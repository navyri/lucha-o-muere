import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';

// Función helper para obtener dictator ID
const getDictatorId = async (userId: string): Promise<string | null> => {
    try {
        console.log('Buscando dictator_id para user_id:', userId);
        
        const result = await pool.query('SELECT id FROM Dictator WHERE user_id = $1', [userId]);
        
        if (result.rows.length > 0) {
            console.log('Dictator encontrado:', result.rows[0].id);
            return result.rows[0].id;
        } else {
            console.log('No se encontró dictator para user_id:', userId);
            return null;
        }
    } catch (error) {
        console.error('Error al obtener dictator ID:', error);
        return null;
    }
};


// Obtener inventario del dictador
export const getDictatorInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    
    try {
        console.log('getDictatorInventory - userId:', userId);

        const dictatorId = await getDictatorId(userId);
        
        if (!dictatorId) {
            res.status(403).json({ error: "No tienes permiso para ver el inventario." });
            return;
        }

        console.log('dictatorId obtenido:', dictatorId);

        const inventory = await pool.query(
            'SELECT id, dictator_id, item_name, category, quantity FROM dictator_inventory WHERE dictator_id = $1 ORDER BY item_name',
            [dictatorId]
        );

        console.log('Items encontrados para dictator_id', dictatorId, ':', inventory.rows.length);
        
        // Debug: Mostrar cada item encontrado
        inventory.rows.forEach(item => {
            console.log(`- Item: ${item.item_name}, category: ${item.category}, quantity: ${item.quantity}, dictator_id: ${item.dictator_id}`);
        });

        res.json(inventory.rows);

    } catch (error) {
        console.error("Error al obtener inventario del dictador:", error);
        res.status(500).json({ error: "Error al obtener inventario." });
    }
};

// Añadir item al inventario del dictador
export const addItemToDictatorInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const { itemName, category, quantity } = req.body;

    try {
        // Validar categoría
        const validCategories = ['weapon', 'buff'];
        if (!validCategories.includes(category)) {
            res.status(400).json({ error: "Categoría inválida. Debe ser 'weapon' o 'buff'." });
            return;
        }


        const dictatorId = await getDictatorId(userId);
        
        if (!dictatorId) {
            res.status(403).json({ error: "No tienes permiso para añadir items." });
            return;
        }

        // Verificar si el item ya existe
        const existingItem = await pool.query(
            'SELECT * FROM dictator_inventory WHERE dictator_id = $1 AND item_name = $2 AND category = $3',
            [dictatorId, itemName, category]
        );

        if (existingItem.rows.length > 0) {
            // Si existe, actualizar cantidad
            await pool.query(
                'UPDATE dictator_inventory SET quantity = quantity + $1 WHERE dictator_id = $2 AND item_name = $3 AND category = $4',
                [quantity, dictatorId, itemName, category]
            );
        } else {
            // Si no existe, crear nuevo
            await pool.query(
                'INSERT INTO dictator_inventory (dictator_id, item_name, category, quantity) VALUES ($1, $2, $3, $4)',
                [dictatorId, itemName, category, quantity]
            );
        }

        res.status(201).json({ message: "Item añadido al inventario exitosamente." });

    } catch (error) {
        console.error("Error al añadir item al inventario:", error);
        res.status(500).json({ error: "Error al añadir item al inventario." });
    }
};

// Eliminar item del inventario del dictador
export const deleteItemFromDictatorInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.id;
    const { item_id } = req.body;

    try {
        const dictatorId = await getDictatorId(userId);
        
        if (!dictatorId) {
            res.status(403).json({ error: "No tienes permiso para eliminar items." });
            return;
        }

        // Verificar que el item existe y pertenece al dictador
        const itemCheck = await pool.query(
            'SELECT * FROM dictator_inventory WHERE dictator_id = $1 AND id = $2',
            [dictatorId, item_id]
        );

        if (itemCheck.rows.length === 0) {
            res.status(404).json({ error: "Item no encontrado en tu inventario." });
            return;
        }

        // Eliminar el item del inventario
        await pool.query(
            'DELETE FROM dictator_inventory WHERE dictator_id = $1 AND id = $2',
            [dictatorId, item_id]
        );

        res.json({ 
            message: `Item "${itemCheck.rows[0].item_name}" eliminado del inventario.`
        });

    } catch (error) {
        console.error("Error al eliminar item del inventario:", error);
        res.status(500).json({ error: "Error al eliminar item del inventario." });
    }
};
