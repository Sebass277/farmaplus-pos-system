const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { v4: uuidv4 } = require('uuid');

router.post('/', (req, res) => {
  const { user_id, items, total, tipo } = req.body;
  const sale_id = uuidv4();

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    const saleStmt = db.prepare('INSERT INTO sales (id, user_id, total, tipo) VALUES (?, ?, ?, ?)');
    saleStmt.run(sale_id, user_id, total, tipo);
    saleStmt.finalize();

    const detailStmt = db.prepare('INSERT INTO sales_details (id, sale_id, product_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?)');
    
    items.forEach((item) => {
      const detail_id = uuidv4();
      detailStmt.run(detail_id, sale_id, item.id, item.cantidad, item.precio, item.cantidad * item.precio);

      // Discount stock
      db.run('UPDATE products SET stock_actual = stock_actual - ? WHERE id = ?', [item.cantidad, item.id], function(err) {
        if (err) console.error(err);
        
        // Check for alerts
        db.get('SELECT nombre, stock_actual, stock_minimo FROM products WHERE id = ?', [item.id], (err, row) => {
          if (row && row.stock_actual <= row.stock_minimo) {
            console.log(`⚠️ ALERTA DE STOCK: ${row.nombre} bajó a ${row.stock_actual} unidades.`);
            req.io.emit('stock_alert', {
              message: `¡Alerta de Stock! ${row.nombre} tiene solo ${row.stock_actual} unidades restantes.`,
              product_id: item.id,
              stock_actual: row.stock_actual
            });
          }
        });
      });
    });

    detailStmt.finalize((err) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      db.run('COMMIT');
      console.log(`✅ VENTA REGISTRADA: ID ${sale_id} | Total: S/ ${total} | Tipo: ${tipo}`);
      req.io.emit('products_updated'); // Notificar a todos los clientes
      res.json({ message: 'Venta registrada con éxito', sale_id });
    });
  });
});

router.get('/reports', (req, res) => {
    db.all(`
        SELECT s.id, s.fecha, s.total, s.tipo, u.username 
        FROM sales s 
        JOIN users u ON s.user_id = u.id 
        ORDER BY s.fecha DESC
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;
