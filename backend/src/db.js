const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../farmacia.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDb();
  }
});

function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT CHECK(role IN ('Cliente', 'Cajero', 'Administrador'))
      )`);

      // Products table
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        nombre TEXT,
        precio REAL,
        unidad TEXT,
        imagen TEXT,
        stock_actual INTEGER,
        stock_minimo INTEGER,
        codigo_barras TEXT,
        lote TEXT
      )`);

      // Sales table
      db.run(`CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        total REAL,
        tipo TEXT CHECK(tipo IN ('Ecommerce', 'Manual')),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // Sales Details table
      db.run(`CREATE TABLE IF NOT EXISTS sales_details (
        id TEXT PRIMARY KEY,
        sale_id TEXT,
        product_id TEXT,
        cantidad INTEGER,
        precio_unitario REAL,
        subtotal REAL,
        FOREIGN KEY(sale_id) REFERENCES sales(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

module.exports = { db, initDb };
