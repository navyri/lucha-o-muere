import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';

export const sellItemInBlackMarket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const { item_id, price, quantity } = req.body; // Cambiar para recibir item_id

    try {
        console.log('sellItemInBlackMarket - userId:', userId);
        
        // Obtener el Sponsor ID desde el User ID
        const sponsorResult = await pool.query('SELECT id FROM Sponsor WHERE user_id = $1', [userId]);
        console.log('sponsorResult:', sponsorResult.rows);

        if (sponsorResult.rows.length === 0) {
            res.status(403).json({ error: "No tienes permiso para vender items en el mercado negro." });
            return;
        }

        const sponsorId = sponsorResult.rows[0].id;
        console.log('sponsorId encontrado:', sponsorId);

        // Verificar si el sponsor tiene el item en su inventario usando item_id
        const itemCheck = await pool.query(
            'SELECT item_name, quantity FROM SponsorInventory WHERE sponsor_id = $1 AND id = $2',
            [sponsorId, item_id]
        );
        console.log('itemCheck result:', itemCheck.rows);

        if (itemCheck.rows.length === 0) {
            res.status(400).json({ error: "No se encontró el item en tu inventario." });
            return;
        }

        if (itemCheck.rows[0].quantity < quantity) {
            res.status(400).json({ error: "No tienes suficientes unidades de este item para vender." });
            return;
        }

        const itemName = itemCheck.rows[0].item_name;
        console.log('Item a vender:', itemName, 'Cantidad:', quantity);

        // Registrar la venta en el mercado negro (USAR sponsorId consistentemente)
        await pool.query(
            `INSERT INTO BlackMarketTransaction (item, amount, status, transaction_date, seller_id) 
            VALUES ($1, $2, 'Discovered', NOW(), $3)`,
            [itemName, price, userId] // Mantener userId como seller_id para consistencia
        );

        // Reducir la cantidad en el inventario
        await pool.query(
            'UPDATE SponsorInventory SET quantity = quantity - $1 WHERE sponsor_id = $2 AND id = $3',
            [quantity, sponsorId, item_id]
        );

        console.log('Item vendido exitosamente');
        res.json({ message: "Item puesto a la venta en el mercado negro con éxito." });

    } catch (error) {
        console.error("Error al vender item en el mercado negro:", error);
        res.status(500).json({ error: "Error al vender item en el mercado negro." });
    }
};


export const buyItemFromBlackMarket = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { transactionId } = req.body;

    try {
        console.log("Usuario comprador ID:", userId);

        //  Obtener el Dictator ID desde el User ID
        const dictatorResult = await pool.query('SELECT id, user_id FROM Dictator WHERE user_id = $1', [userId]);
        console.log(" Resultado Dictator:", dictatorResult.rows);

        if (dictatorResult.rows.length === 0) {
            res.status(403).json({ error: "No tienes permiso para comprar en el mercado negro." });
            return;
        }

        const dictatorId = dictatorResult.rows[0].id;
        const buyerUserId = dictatorResult.rows[0].user_id;

        //  Verificar que la transacción existe y está disponible
        const transaction = await pool.query(
            'SELECT item, seller_id FROM BlackMarketTransaction WHERE id = $1 AND buyer_id IS NULL',
            [transactionId]
        );
        console.log(" Resultado Transacción:", transaction.rows);

        if (transaction.rows.length === 0) {
            res.status(400).json({ error: "El item no está disponible para compra." });
            return;
        }

        const itemName = transaction.rows[0].item;
        const sellerUserId = transaction.rows[0].seller_id;
        console.log(" Item a comprar:", itemName, "Vendedor User ID:", sellerUserId);

        //  Obtener el Sponsor ID desde el User ID del vendedor
        const sponsorResult = await pool.query(
            'SELECT id FROM Sponsor WHERE user_id = $1',
            [sellerUserId]
        );
        console.log(" Resultado Sponsor:", sponsorResult.rows);

        if (sponsorResult.rows.length === 0) {
            res.status(400).json({ error: "No se encontró al Sponsor que vendió el item." });
            return;
        }

        const sponsorId = sponsorResult.rows[0].id;
        console.log(" Sponsor ID:", sponsorId, "item_name", itemName);

        //  Obtener la categoría del item desde el inventario del Sponsor
        const itemCategoryResult = await pool.query(
            'SELECT category FROM SponsorInventory WHERE sponsor_id = $1 AND item_name = $2',
            [sponsorId, itemName]
        );
        console.log(" Resultado Categoría Item:", itemCategoryResult.rows);

        if (itemCategoryResult.rows.length === 0) {
            res.status(400).json({ error: "No se encontró información del item en el inventario del vendedor." });
            return;
        }

        const itemCategory = itemCategoryResult.rows[0].category;
        console.log(" Categoría del item:", itemCategory);

        //  Asignar la compra al comprador y al Contestant
        await pool.query(
            `UPDATE BlackMarketTransaction 
            SET buyer_id = $1, status = 'Completed' 
            WHERE id = $2`,
            [buyerUserId, transactionId]
        );
        console.log(" Transacción actualizada correctamente.");

        //  Agregar el item al inventario del Dictador con la categoría correcta
        await pool.query(
            `INSERT INTO dictator_inventory (dictator_id, item_name, category, quantity) 
            VALUES ($1, $2, $3, 1) 
            ON CONFLICT (dictator_id, item_name) 
            DO UPDATE SET quantity = dictator_inventory.quantity + 1`,
            [dictatorId, itemName, itemCategory]
        );
        console.log(" Item agregado al inventario del dictador.");

        res.json({ message: "Item comprado, agregado al inventario y asignado con éxito." });

    } catch (error) {
        console.error(" Error al comprar en el mercado negro:", error);
        res.status(500).json({ error: "Error al comprar en el mercado negro." });
    }
};


//  Obtener la lista de items en venta en el mercado negro
export const getBlackMarketItems = async (_req: Request, res: Response) => {
    try {
        const items = await pool.query(
            'SELECT * FROM BlackMarketTransaction WHERE status = \'Discovered\''
        );
        res.json(items.rows);

    } catch (error) {
        console.error("Error al obtener items del mercado negro:", error);
        res.status(500).json({ error: "Error al obtener items del mercado negro." });
    }
};

