const express = require('express');
const router = express.Router();
const { db, dbAsync } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('../middleware/auth');

/**
 * REGISTRO DE VENTA (NUEVA ARQUITECTURA v3.0)
 * - Autoratitativo: El servidor calcula precios y totales.
 * - Atómico: Transacción completa o nada.
 * - Seguro: Valida stock real antes de confirmar.
 */
router.post('/', verifyToken, async (req, res) => {
  const { user_id, items, tipo } = req.body;
  const sale_id = uuidv4();
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío' });
  }

  try {
    // 1. Iniciar Transacción
    await dbAsync.run('BEGIN TRANSACTION');

    let totalVenta = 0;
    const detallesParaInsertar = [];

    // 2. Validar cada item contra la DB real
    for (const item of items) {
      const product = await dbAsync.get('SELECT * FROM products WHERE id = ?', [item.id]);

      if (!product) {
        throw new Error(`Producto no encontrado: ${item.id}`);
      }

      if (product.stock_actual < item.cantidad) {
        throw new Error(`Stock insuficiente para: ${product.nombre} (Solicitado: ${item.cantidad}, Disponible: ${product.stock_actual})`);
      }

      const subtotal = product.precio * item.cantidad;
      totalVenta += subtotal;

      detallesParaInsertar.push({
        id: uuidv4(),
        product_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: product.precio,
        subtotal: subtotal
      });
    }

    // 3. Crear cabecera de venta
    await dbAsync.run(
      'INSERT INTO sales (id, user_id, total, tipo) VALUES (?, ?, ?, ?)',
      [sale_id, user_id, totalVenta, tipo]
    );

    // 4. Insertar detalles, descontar stock y registrar movimiento
    for (const det of detallesParaInsertar) {
      // Insertar detalle
      await dbAsync.run(
        'INSERT INTO sales_details (id, sale_id, product_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [det.id, sale_id, det.product_id, det.cantidad, det.precio_unitario, det.subtotal]
      );

      const updateResult = await dbAsync.run(
        'UPDATE products SET stock_actual = stock_actual - ? WHERE id = ? AND stock_actual >= ?',
        [det.cantidad, det.product_id, det.cantidad]
      );

      console.log(`[DEBUG] Producto: ${det.product_id} | Cambios: ${updateResult.changes} | Stock restado: ${det.cantidad}`);

      if (updateResult.changes === 0) {
        throw new Error('Error de concurrencia: El stock cambió durante la transacción.');
      }

      // Registrar movimiento de inventario
      await dbAsync.run(
        'INSERT INTO inventory_movements (id, product_id, tipo, cantidad, motivo) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), det.product_id, 'SALIDA', det.cantidad, `VENTA: ${sale_id}`]
      );
    }

    // 5. Finalizar Transacción
    await dbAsync.run('COMMIT');

    // 6. Notificaciones Real-time
    req.io.emit('products_updated');
    
    // Alerta de stock bajo si aplica
    for (const det of detallesParaInsertar) {
        const prod = await dbAsync.get('SELECT nombre, stock_actual, stock_minimo FROM products WHERE id = ?', [det.product_id]);
        if (prod && prod.stock_actual <= prod.stock_minimo) {
            req.io.emit('stock_alert', {
                message: `⚠️ Stock Bajo: ${prod.nombre} (${prod.stock_actual} restantes)`,
                product_id: det.product_id
            });
        }
    }

    res.json({ 
        message: '✅ Venta procesada con éxito', 
        sale_id, 
        total: totalVenta 
    });

  } catch (error) {
    await dbAsync.run('ROLLBACK');
    console.error('🔥 Error en transacción de venta:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Reportes (Se mantiene igual pero usando dbAsync para consistencia futura)
router.get('/reports', async (req, res) => {
    try {
        const rows = await dbAsync.all(`
            SELECT s.id, s.fecha, s.total, s.tipo, u.username 
            FROM sales s 
            JOIN users u ON s.user_id = u.id 
            ORDER BY s.fecha DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
