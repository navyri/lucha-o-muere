import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';

export const startBattle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { battleId } = req.params;
    console.log("battleId recibido:", battleId);

    try {
        // Obtener la batalla con estado "Approved"
        const battle = await pool.query(
            'SELECT * FROM battle WHERE id = $1 AND status = \'Approved\'',
            [battleId]
        );

        console.log("Resultado de la consulta:", battle.rows);

        if (battle.rows.length === 0) {
            res.status(400).json({ error: "La batalla no estÃ¡ aprobada o no existe." });
            return;
        }

        // Actualizar el estado de la batalla a 'Start'
        await pool.query(
            'UPDATE battle SET status = \'Start\' WHERE id = $1',
            [battleId]
        );

        // Obtener los concursantes de la batalla
        const { contestant_1, contestant_2 } = battle.rows[0];

        // Obtener los buffs de los concursantes
        const buffs = await pool.query(
            'SELECT * FROM Buff WHERE contestant_id IN ($1, $2)',
            [contestant_1, contestant_2]
        );

        let contestantStats: any = {};
        for (const buff of buffs.rows) {
            if (!contestantStats[buff.contestant_id]) {
                contestantStats[buff.contestant_id] = { strength: 0, agility: 0 };
            }
            contestantStats[buff.contestant_id].strength += buff.strength_boost;
            contestantStats[buff.contestant_id].agility += buff.agility_boost;
        }

        res.json({
            message: "Batalla iniciada. Buffs aplicados antes del combate.",
            battle: battle.rows[0],
            buffs_applied: contestantStats
        });

    } catch (error) {
        console.error("Error al iniciar batalla:", error);
        res.status(500).json({ error: "Error al iniciar la batalla." });
    }
};

export const closeBattle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { battleId } = req.params;
    const { winnerId, deathOccurred, casualtyId } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verificar la batalla
        const battle = await client.query('SELECT * FROM Battle WHERE id = $1 AND status = \'Start\'', [battleId]);

        if (battle.rows.length === 0) {
            res.status(400).json({ error: "La batalla no estÃ¡ activa o no existe." });
            return;
        }

        const { contestant_1, contestant_2, dictator_id } = battle.rows[0];
        const loserId = contestant_1 === winnerId ? contestant_2 : contestant_1;

        // Cerrar la batalla
        await client.query(
            'UPDATE Battle SET status = \'Closed\', winner_id = $1, death_occurred = $2, casualty_id = $3 WHERE id = $4',
            [winnerId, deathOccurred, casualtyId, battleId]
        );

        // Actualizar estadÃ­sticas de los Contestants
        await client.query(
            'UPDATE Contestant SET wins = wins + 1, health = LEAST(health + 10, 100) WHERE id = $1',
            [winnerId]
        );
        await client.query(
            'UPDATE Contestant SET losses = losses + 1, health = GREATEST(health - 10, 0) WHERE id = $1',
            [loserId]
        );

        if (deathOccurred) {
            await client.query('UPDATE Contestant SET status = \'Dead\', health = 0 WHERE id = $1', [casualtyId]);
        }

        // Ajustar fidelidad del Dictador
        await client.query(
            'UPDATE Dictator SET loyalty_score = LEAST(loyalty_score + 5, 100) WHERE id = (SELECT dictator_id FROM Contestant WHERE id = $1)',
            [winnerId]
        );
        await client.query(
            'UPDATE Dictator SET loyalty_score = GREATEST(loyalty_score - 10, 0) WHERE id = (SELECT dictator_id FROM Contestant WHERE id = $1)',
            [loserId]
        );

        // Bloquear dictadores con fidelidad 0
        await client.query('UPDATE Dictator SET blocked = TRUE WHERE loyalty_score = 0');

        // Ajustar fidelidad de Sponsors involucrados
        await adjustSponsorLoyalty(client, winnerId, loserId);

        // Cerrar apuestas de la batalla
        await client.query(
            'UPDATE Bet SET status = \'Closed\' WHERE battle_id = $1',
            [battleId]
        );

        // Pagar apuestas ganadoras
        await client.query(
            `UPDATE Bet 
            SET payout = amount * 2, status = 'Won' 
            WHERE battle_id = $1 AND predicted_winner = $2`,
            [battleId, winnerId]
        );

        // Registrar apuestas perdedoras
        await client.query(
            `UPDATE Bet 
            SET payout = 0, status = 'Lost' 
            WHERE battle_id = $1 AND predicted_winner != $2`,
            [battleId, winnerId]
        );

        await client.query('COMMIT');
        res.json({ message: "Batalla cerrada, apuestas finalizadas y pagos aplicados." });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al cerrar batalla:", error);
        res.status(500).json({ error: "Error al cerrar batalla." });

    } finally {
        client.release();
    }
};

const adjustSponsorLoyalty = async (client: any, winnerId: string, loserId: string) => {
    // Buscar Sponsors que donaron items a estos Contestants
    const sponsors = await client.query(
        'SELECT giver_id FROM public.contestantitems WHERE contestant_id IN ($1, $2)',
        [winnerId, loserId]
    );

    for (const sponsor of sponsors.rows) {
        const sponsorId = sponsor.sponsor_id;

        if (winnerId === sponsorId) {
            // Sponsor apoyÃ³ al ganador â†’ Aumenta fidelidad
            await client.query(
                'UPDATE Sponsor SET loyalty_score = LEAST(loyalty_score + 5, 100) WHERE id = $1',
                [sponsorId]
            );
        } else {
            // Sponsor apoyÃ³ al perdedor â†’ Disminuye fidelidad
            await client.query(
                'UPDATE Sponsor SET loyalty_score = GREATEST(loyalty_score - 10, 0) WHERE id = $1',
                [sponsorId]
            );
        }
    }
};

export const getProposedBattles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log('Admin solicitando batallas propuestas...');

        const proposedBattles = await pool.query(`
            SELECT 
                b.id,
                b.contestant_1,
                b.contestant_2,
                b.status,
                b.date as proposed_date,
                b.date as created_at,
                b.winner_id,
                b.death_occurred,
                b.casualty_id,
                b.injuries,
                b.dictator_id,
                c1.name as contestant_1_name,
                c1.nickname as contestant_1_nickname,
                c2.name as contestant_2_name,
                c2.nickname as contestant_2_nickname,
                d1.name as dictator_1_name,
                d2.name as dictator_2_name
            FROM Battle b
            LEFT JOIN Contestant c1 ON b.contestant_1 = c1.id
            LEFT JOIN Contestant c2 ON b.contestant_2 = c2.id
            LEFT JOIN Dictator d1 ON c1.dictator_id = d1.id
            LEFT JOIN Dictator d2 ON c2.dictator_id = d2.id
            WHERE b.status = 'Pending'
            ORDER BY b.date DESC
        `);

        if (proposedBattles.rows.length === 0) {
            res.json({ battles: [], message: "No hay batallas propuestas." });
            return;
        }

        res.json({ battles: proposedBattles.rows });

    } catch (error) {
        console.error("Error al obtener batallas propuestas:", error);
        res.status(500).json({ error: "Error al obtener batallas propuestas." });
    }
};


export const getAvailableOpponents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.id;

    try {
        // Obtener el ID del Dictador autenticado
        const dictatorResult = await pool.query('SELECT id FROM Dictator WHERE user_id = $1', [userId]);

        if (dictatorResult.rows.length === 0) {
            res.status(403).json({ error: "No tienes permiso para ver esta informaciÃ³n." });
            return;
        }

        const dictatorId = dictatorResult.rows[0].id;

        // Obtener los Contestants de otros dictadores que estÃ©n vivos
        const result = await pool.query(`
            SELECT 
                c.id AS contestant_id, c.name AS contestant_name, c.strength, c.agility, 
                d.id AS dictator_id, d.name AS dictator_name, d.territory
            FROM Contestant c
            JOIN Dictator d ON c.dictator_id = d.id
            WHERE c.dictator_id <> $1 AND c.status = 'Alive'
        `, [dictatorId]);

        res.json(result.rows);

    } catch (error) {
        console.error("Error al obtener oponentes disponibles:", error);
        res.status(500).json({ error: "Error al obtener oponentes disponibles." });
    }
};

export const proposeBattle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    let { contestant1, contestant2 } = req.body;

    try {
        // Convertir los IDs a formato UUID asegurado
        contestant1 = String(contestant1).trim();
        contestant2 = String(contestant2).trim();

        if (!contestant1 || !contestant2) {
            res.status(400).json({ error: "Se requieren ambos IDs de Contestants." });
            return;
        }

        // Obtener el ID del Dictador autenticado
        const dictatorResult = await pool.query('SELECT id FROM Dictator WHERE user_id = $1', [userId]);

        if (dictatorResult.rows.length === 0) {
            res.status(403).json({ error: "No tienes permiso para proponer batallas." });
            return;
        }

        const dictatorId = dictatorResult.rows[0].id;

        // Obtener informaciÃ³n de los Contestants con conversiÃ³n explÃ­cita a UUID
        const [c1, c2] = await Promise.all([
            pool.query('SELECT * FROM Contestant WHERE id::uuid = $1', [contestant1]),
            pool.query('SELECT * FROM Contestant WHERE id::uuid = $1', [contestant2])
        ]);

        if (c1.rows.length === 0 || c2.rows.length === 0) {
            res.status(400).json({ error: "Uno o ambos Contestants no existen." });
            return;
        }

        const contestant1Data = c1.rows[0];
        const contestant2Data = c2.rows[0];

        // Validaciones
        if (contestant1Data.dictator_id === contestant2Data.dictator_id) {
            res.status(400).json({ error: "No puedes proponer una batalla entre tus propios Contestants." });
            return;
        }

        if (contestant1Data.dictator_id !== dictatorId && contestant2Data.dictator_id !== dictatorId) {
            res.status(400).json({ error: "Debes seleccionar al menos un Contestant propio." });
            return;
        }

        // Registrar la batalla como "Pending Approval"
        const result = await pool.query(
            `INSERT INTO Battle (contestant_1, contestant_2, dictator_id, status) 
             VALUES ($1::uuid, $2::uuid, $3::uuid, 'Pending') RETURNING *`,
            [contestant1, contestant2, dictatorId]
        );

        res.status(201).json({ message: "Batalla propuesta. Esperando aprobaciÃ³n del Admin.", battle: result.rows[0] });

    } catch (error) {
        console.error("Error al proponer batalla:", error);
        res.status(500).json({ error: "Error al proponer batalla." });
    }
};

export const approveBattle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { battleId, eventName } = req.body;

    try {
        // Consultar la batalla pendiente
        const battle = await pool.query(
            'SELECT * FROM Battle WHERE id = $1 AND status = \'Pending\'',
            [battleId]
        );

        if (battle.rows.length === 0) {
            res.status(400).json({ error: "La batalla no estÃ¡ pendiente de aprobaciÃ³n." });
            return;
        }

        // Obtener el dictator_id de la batalla
        const dictatorId = battle.rows[0].dictator_id;

        // Consultar los detalles del dictador utilizando dictator_id
        const dictatorResult = await pool.query(
            'SELECT * FROM Dictator WHERE id = $1',
            [dictatorId]
        );

        if (dictatorResult.rows.length === 0) {
            res.status(404).json({ error: "No se encontrÃ³ al dictador." });
            return;
        }

        // Aprobar la batalla
        await pool.query(
            'UPDATE Battle SET status = \'Approved\' WHERE id = $1',
            [battleId]
        );

        // Verificar si ya existe un evento con el mismo nombre
        let event = await pool.query(
            'SELECT * FROM Event WHERE name = $1',
            [eventName]
        );

        // Si el evento no existe, crearlo con reglas predeterminadas
        if (event.rows.length === 0) {
            const defaultRules = "Duelo a Muerte";

            event = await pool.query(
                'INSERT INTO Event (name, organizer_id, start_date, rules) VALUES ($1, $2, CURRENT_TIMESTAMP, $3) RETURNING id',
                [eventName, dictatorId, defaultRules]
            );
        }

        // Asociar la batalla al evento
        await pool.query(
            'INSERT INTO EventBattle (event_id, battle_id) VALUES ($1, $2)',
            [event.rows[0].id, battleId]
        );

        // Actualizar las fechas del evento: start_date y end_date
        const eventBattles = await pool.query(
            'SELECT b.date FROM Battle b ' +
            'JOIN EventBattle eb ON eb.battle_id = b.id ' +
            'WHERE eb.event_id = $1 ORDER BY b.date ASC',
            [event.rows[0].id]
        );

        if (eventBattles.rows.length > 0) {
            const startDate = eventBattles.rows[0].date;
            const endDate = eventBattles.rows[eventBattles.rows.length - 1].date;

            // Actualizar el evento con las fechas correctas
            await pool.query(
                'UPDATE Event SET start_date = $1, end_date = $2 WHERE id = $3',
                [startDate, endDate, event.rows[0].id]
            );
        }

        res.json({ message: "Batalla aprobada y asociada al evento correctamente." });

    } catch (error) {
        console.error("Error al aprobar la batalla y asociarla al evento:", error);
        res.status(500).json({ error: "Error al aprobar la batalla y asociarla al evento." });
    }
};

export const placeBet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const { battleId, predictedWinner, amount } = req.body;

    try {
        // Verificar si el usuario es Dictador o Sponsor
        const dictator = await pool.query('SELECT * FROM Dictator WHERE user_id = $1', [userId]);
        const sponsor = await pool.query('SELECT * FROM Sponsor WHERE user_id = $1', [userId]);

        if (dictator.rows.length === 0 && sponsor.rows.length === 0) {
            res.status(403).json({ error: "Solo los Dictadores y Sponsors pueden apostar." });
            return;
        }

        // Obtener el ID y tipo de apostador
        const bettorId = dictator.rows.length > 0 ? dictator.rows[0].id : sponsor.rows[0].id;
        const bettorType = dictator.rows.length > 0 ? "Dictator" : "Sponsor";

        // Verificar que la batalla estÃ¡ activa
        const battle = await pool.query(
            'SELECT * FROM Battle WHERE id = $1 AND status = \'Approved\'',
            [battleId]
        );

        if (battle.rows.length === 0) {
            res.status(400).json({ error: "La batalla no estÃ¡ activa o no existe." });
            return;
        }

        // Verificar que un Dictador no apueste en batallas de sus propios esclavos
        if (bettorType === "Dictator") {
            const contestantOwned = await pool.query(
                'SELECT * FROM Contestant WHERE (id = $1 OR id = $2) AND dictator_id = $3',
                [battle.rows[0].contestant_1, battle.rows[0].contestant_2, bettorId]
            );

            if (contestantOwned.rows.length > 0) {
                res.status(403).json({ error: "No puedes apostar en batallas de tus propios esclavos." });
                return;
            }
        }

        // Verificar que el usuario no haya apostado mÃ¡s de 2 veces en la misma batalla
        const existingBets = await pool.query(
            'SELECT COUNT(*) FROM Bet WHERE battle_id = $1 AND bettor_id = $2',
            [battleId, bettorId]
        );

        if (parseInt(existingBets.rows[0].count) >= 2) {
            res.status(403).json({ error: "No puedes apostar mÃ¡s de dos veces en la misma batalla." });
            return;
        }

        // Registrar la apuesta
        await pool.query(
            `INSERT INTO Bet (battle_id, bettor_id, bettor_type, amount, predicted_winner, bet_date) 
            VALUES ($1, $2, $3, $4, $5, NOW())`,
            [battleId, bettorId, bettorType, amount, predictedWinner]
        );

        res.status(201).json({ message: "Apuesta registrada con Ã©xito." });

    } catch (error) {
        console.error("Error al registrar apuesta:", error);
        res.status(500).json({ error: "Error al registrar apuesta." });
        return;
    }
};

export const getBetsByBattle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { battleId } = req.params;

    try {
        const bets = await pool.query(
            'SELECT * FROM Bet WHERE battle_id = $1',
            [battleId]
        );

        res.json(bets.rows);

    } catch (error) {
        console.error("Error al obtener apuestas:", error);
        res.status(500).json({ error: "Error al obtener apuestas." });
    }
};

export const getBetStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { betId } = req.params;

    try {
        const bet = await pool.query(
            'SELECT * FROM Bet WHERE id = $1',
            [betId]
        );

        if (bet.rows.length === 0) {
            res.status(404).json({ error: "Apuesta no encontrada." });
            return;
        }

        res.json(bet.rows[0]);

    } catch (error) {
        console.error("Error al obtener estado de apuesta:", error);
        res.status(500).json({ error: "Error al obtener apuesta." });
    }
};

export const getMyBets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.id;

    try {
        console.log('getMyBets - userId:', userId);

        // Verificar si el usuario es Dictador o Sponsor
        const dictator = await pool.query('SELECT * FROM Dictator WHERE user_id = $1', [userId]);
        const sponsor = await pool.query('SELECT * FROM Sponsor WHERE user_id = $1', [userId]);

        if (dictator.rows.length === 0 && sponsor.rows.length === 0) {
            res.status(403).json({ error: "Solo los Dictadores y Sponsors pueden ver apuestas." });
            return;
        }

        // Obtener el ID y tipo de apostador
        const bettorId = dictator.rows.length > 0 ? dictator.rows[0].id : sponsor.rows[0].id;
        const bettorType = dictator.rows.length > 0 ? "Dictator" : "Sponsor";

        console.log('Buscando apuestas para:', { bettorId, bettorType, userId });

        // CORRECCION: Buscar apuestas usando el bettor_id correcto
        const bets = await pool.query(`
            SELECT 
                b.*,
                bat.status as battle_status,
                bat.winner_id as battle_winner,
                bat.date as battle_date
            FROM Bet b
            JOIN Battle bat ON b.battle_id = bat.id
            WHERE b.bettor_id = $1 AND b.bettor_type = $2
            ORDER BY b.bet_date DESC
        `, [bettorId, bettorType]);

        console.log('Apuestas encontradas:', bets.rows.length);
        console.log('Apuestas data:', bets.rows);

        res.json({
            bettorType,
            totalBets: bets.rows.length,
            bets: bets.rows
        });

    } catch (error) {
        console.error("Error al obtener mis apuestas:", error);
        res.status(500).json({ error: "Error al obtener mis apuestas." });
    }
};

const processBets = async (client: any, battleId: string, winnerId: string, next: NextFunction): Promise<void> => {
    // Obtener todas las apuestas de la batalla
    const bets = await client.query('SELECT * FROM Bet WHERE battle_id = $1', [battleId]);

    for (const bet of bets.rows) {
        const { id, dictator_id, amount, predicted_winner } = bet;

        if (predicted_winner === winnerId) {
            // Apuesta acertada: Ganancia = Doble del monto apostado
            const payout = amount * 2;

            await client.query(
                'UPDATE Bet SET status = \'Won\', payout = $1 WHERE id = $2',
                [payout, id]
            );

            if (dictator_id) {
                // Si es un Dictador, aumentar fidelidad con el Admin
                await client.query(
                    'UPDATE Dictator SET loyalty_score = LEAST(loyalty_score + 5, 100) WHERE id = $1',
                    [dictator_id]
                );
            }
        } else {
            // Apuesta fallida: No hay pago, pero disminuye fidelidad
            await client.query(
                'UPDATE Bet SET status = \'Lost\', payout = 0 WHERE id = $1',
                [id]
            );

            if (dictator_id) {
                await client.query(
                    'UPDATE Dictator SET loyalty_score = GREATEST(loyalty_score - 10, 0) WHERE id = $1',
                    [dictator_id]
                );
            }
        }
    }
};

export const getAllBattles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log('Admin solicitando todas las batallas...');

        // ✅ Query enriquecida con nombres de contestants y dictadores
        const allBattles = await pool.query(`
            SELECT 
                b.id,
                b.contestant_1,
                b.contestant_2,
                b.status,
                b.date as proposed_date,
                b.date as created_at,
                b.winner_id,
                b.death_occurred,
                b.casualty_id,
                b.injuries,
                b.dictator_id,
                c1.name as contestant_1_name,
                c1.nickname as contestant_1_nickname,
                c2.name as contestant_2_name,
                c2.nickname as contestant_2_nickname,
                d1.name as dictator_1_name,
                d2.name as dictator_2_name
            FROM Battle b
            LEFT JOIN Contestant c1 ON b.contestant_1 = c1.id
            LEFT JOIN Contestant c2 ON b.contestant_2 = c2.id
            LEFT JOIN Dictator d1 ON c1.dictator_id = d1.id
            LEFT JOIN Dictator d2 ON c2.dictator_id = d2.id
            ORDER BY b.date DESC
        `);

        console.log('Todas las batallas encontradas:', allBattles.rows.length);
        res.json(allBattles.rows);

    } catch (error) {
        console.error("Error al obtener todas las batallas:", error);
        console.error("Detalles del error:", error.message);
        res.status(500).json({ error: "Error al obtener todas las batallas." });
    }
};

export { processBets };