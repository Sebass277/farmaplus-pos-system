const express = require('express');
const router = express.Router();
const { db } = require('../db');

router.get('/', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { nombre, precio, unidad, imagen, stock_actual, stock_minimo, codigo_barras, lote } = req.body;
  const id = `PROD-${Math.floor(100 + Math.random() * 900)}`;
  
  db.run(
    'INSERT INTO products (id, nombre, precio, unidad, imagen, stock_actual, stock_minimo, codigo_barras, lote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, nombre, precio, unidad, imagen, stock_actual, stock_minimo, codigo_barras, lote],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Producto agregado', id });
    }
  );
});

module.exports = router;
