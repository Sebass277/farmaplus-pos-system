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
  const id = `PROD-${Math.floor(1000 + Math.random() * 9000)}`;
  console.log(`[POST] Creando nuevo producto: ${nombre}`);
  
  db.run(
    'INSERT INTO products (id, nombre, precio, unidad, imagen, stock_actual, stock_minimo, codigo_barras, lote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, nombre, precio, unidad, imagen, stock_actual, stock_minimo, codigo_barras, lote],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      req.io.emit('products_updated');
      res.json({ message: 'Producto agregado', id });
    }
  );
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, unidad, imagen, stock_actual, stock_minimo, codigo_barras, lote } = req.body;
  console.log(`[PUT] Actualizando producto ID: ${id}`);

  db.run(
    `UPDATE products SET 
      nombre = ?,
      precio = ?, 
      unidad = ?,
      imagen = ?,
      stock_actual = stock_actual + ?, 
      stock_minimo = ?, 
      codigo_barras = ?, 
      lote = ? 
     WHERE id = ?`,
    [nombre, precio, unidad, imagen, parseInt(stock_actual) || 0, stock_minimo, codigo_barras, lote, id],
    function(err) {
      if (err) {
        console.error(`[PUT Error]: ${err.message}`);
        return res.status(500).json({ error: err.message });
      }
      console.log(`[PUT Success]: Producto ${id} actualizado completamente.`);
      req.io.emit('products_updated');
      res.json({ message: 'Producto actualizado con éxito' });
    }
  );
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    req.io.emit('products_updated');
    res.json({ message: 'Producto eliminado' });
  });
});

module.exports = router;
