const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../farmacia.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al abrir la base de datos:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos SQLite.');
    initDb();
  }
});

// Wrapper para manejar SQLite con async/await (Indispensable para transacciones atómicas)
const dbAsync = {
  run: (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  }),
  get: (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  }),
  all: (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  exec: (sql) => new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  })
};

async function initDb() {
  try {
    // Usamos serialize para asegurar que la creación de tablas sea ordenada
    db.serialize(() => {
      // 1. Usuarios
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT CHECK(role IN ('Cliente', 'Cajero', 'Administrador'))
      )`);

      // 2. Productos (Añadimos 'status' para borrado lógico)
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        nombre TEXT,
        precio REAL,
        unidad TEXT,
        imagen TEXT,
        stock_actual INTEGER DEFAULT 0,
        stock_minimo INTEGER DEFAULT 0,
        codigo_barras TEXT,
        lote TEXT,
        status TEXT DEFAULT 'active'
      )`);

      // 3. Ventas
      db.run(`CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        total REAL,
        tipo TEXT CHECK(tipo IN ('Ecommerce', 'Manual')),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // 4. Detalles de Ventas
      db.run(`CREATE TABLE IF NOT EXISTS sales_details (
        id TEXT PRIMARY KEY,
        sale_id TEXT,
        product_id TEXT,
        cantidad INTEGER,
        precio_unitario REAL,
        subtotal REAL,
        FOREIGN KEY(sale_id) REFERENCES sales(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )`);

      // 5. NUEVA: Movimientos de Inventario (Auditoría v3.0)
      db.run(`CREATE TABLE IF NOT EXISTS inventory_movements (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        tipo TEXT CHECK(tipo IN ('ENTRADA', 'SALIDA')),
        cantidad INTEGER,
        motivo TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id)
      )`);
    });
    console.log('✅ Esquema de base de datos v3.0 listo.');
  } catch (err) {
    console.error('❌ Error al inicializar esquema:', err);
  }
}

module.exports = { db, dbAsync, initDb };
