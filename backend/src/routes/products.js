const express = require('express');
const router = express.Router();
const { db, dbAsync } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Listar solo productos activos (Público)
router.get('/', async (req, res) => {
  try {
    const rows = await dbAsync.all("SELECT * FROM products WHERE status = 'active'");
    
    // Limpiar URLs de imágenes para que funcionen en producción
    const sanitizedRows = rows.map(prod => ({
        ...prod,
        imagen: prod.imagen ? prod.imagen.replace('http://localhost:5000', '') : ''
    }));

    res.json(sanitizedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await dbAsync.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener historial de movimientos de un producto
router.get('/:id/movements', async (req, res) => {
    try {
        const rows = await dbAsync.all('SELECT * FROM inventory_movements WHERE product_id = ? ORDER BY fecha DESC', [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { nombre, precio, unidad, imagen, stock_actual, stock_minimo, codigo_barras, lote } = req.body;
  const id = `PROD-${Math.floor(1000 + Math.random() * 9000)}`;
  
  try {
    await dbAsync.run('BEGIN TRANSACTION');
    
    await dbAsync.run(
      'INSERT INTO products (id, nombre, precio, unidad, imagen, stock_actual, stock_minimo, codigo_barras, lote, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, nombre, precio, unidad, imagen, stock_actual, stock_minimo, codigo_barras, lote, 'active']
    );

    // Registro inicial de inventario
    await dbAsync.run(
      'INSERT INTO inventory_movements (id, product_id, tipo, cantidad, motivo) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), id, 'ENTRADA', stock_actual, 'CARGA INICIAL']
    );

    await dbAsync.run('COMMIT');
    req.io.emit('products_updated');
    res.json({ message: 'Producto creado y registrado', id });
  } catch (err) {
    await dbAsync.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, unidad, imagen, stock_actual, stock_minimo, codigo_barras, lote } = req.body;
  const cantidadNueva = parseInt(stock_actual) || 0;

  try {
    await dbAsync.run('BEGIN TRANSACTION');

    // Actualizar datos del producto
    await dbAsync.run(
      `UPDATE products SET 
        nombre = ?, precio = ?, unidad = ?, imagen = ?,
        stock_actual = stock_actual + ?, 
        stock_minimo = ?, codigo_barras = ?, lote = ? 
       WHERE id = ?`,
      [nombre, precio, unidad, imagen, cantidadNueva, stock_minimo, codigo_barras, lote, id]
    );

    // Registrar el movimiento de reposición si hubo cambio en stock
    if (cantidadNueva !== 0) {
        await dbAsync.run(
            'INSERT INTO inventory_movements (id, product_id, tipo, cantidad, motivo) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), id, cantidadNueva > 0 ? 'ENTRADA' : 'SALIDA', Math.abs(cantidadNueva), 'REPOSICIÓN/AJUSTE MANUAL']
        );
    }

    await dbAsync.run('COMMIT');
    req.io.emit('products_updated');
    res.json({ message: 'Producto y movimientos actualizados' });
  } catch (err) {
    await dbAsync.run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Borrado Lógico para mantener integridad referencial
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await dbAsync.run("UPDATE products SET status = 'inactive' WHERE id = ?", [req.params.id]);
    req.io.emit('products_updated');
    res.json({ message: 'Producto desactivado (Historial preservado)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
