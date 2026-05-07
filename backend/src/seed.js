const fs = require('fs');
const path = require('path');
const { db, initDb } = require('./db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const jsonPath = path.resolve(__dirname, '../../../database farmacia/productos_farma.json');

async function seed() {
  await initDb();
  const productsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  db.serialize(async () => {
    // Clear existing data
    db.run('DELETE FROM products');
    db.run('DELETE FROM users');

    // Seed Products
    const stmt = db.prepare('INSERT INTO products (id, nombre, precio, unidad, imagen, stock_actual, stock_minimo) VALUES (?, ?, ?, ?, ?, ?, ?)');
    productsData.forEach((prod) => {
      const stock_actual = Math.floor(Math.random() * (50 - 2 + 1)) + 2;
      const stock_minimo = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
      stmt.run(prod.id || uuidv4(), prod.nombre, prod.precio, prod.unidad, prod.imagen, stock_actual, stock_minimo);
    });
    stmt.finalize();

    // Seed Users (Default admin, cashier, client)
    const adminPass = await bcrypt.hash('admin123', 10);
    const cashierPass = await bcrypt.hash('cashier123', 10);
    const clientPass = await bcrypt.hash('client123', 10);

    db.run('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)', [uuidv4(), 'admin', adminPass, 'Administrador']);
    db.run('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)', [uuidv4(), 'cashier', cashierPass, 'Cajero']);
    db.run('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)', [uuidv4(), 'client', clientPass, 'Cliente']);

    console.log('Seeding completed!');
  });
}

seed();
