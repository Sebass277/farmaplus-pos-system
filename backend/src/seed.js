const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../farmacia.db');
const jsonPath = path.resolve(__dirname, '../../../database farmacia/productos_farma.json');

const db = new sqlite3.Database(dbPath);

const productsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const usersData = [
  { id: 'admin-001', username: 'admin', password: bcrypt.hashSync('admin123', 10), role: 'Administrador' },
  { id: 'cashier-001', username: 'cajero', password: bcrypt.hashSync('cajero123', 10), role: 'Cajero' }
];

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS products');
  db.run('DROP TABLE IF EXISTS users');

  // Re-create tables
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

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('Cliente', 'Cajero', 'Administrador'))
  )`);

  // Insert Users
  const userStmt = db.prepare('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)');
  usersData.forEach(u => userStmt.run(u.id, u.username, u.password, u.role));
  userStmt.finalize();

  // Insert Products
  const prodStmt = db.prepare('INSERT INTO products (id, nombre, precio, unidad, imagen, stock_actual, stock_minimo, codigo_barras, lote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  productsData.forEach(p => {
    prodStmt.run(
      p.id, 
      p.nombre, 
      p.precio, 
      p.unidad, 
      p.imagen, 
      p.stock_actual || 0, 
      p.stock_minimo || 5, 
      p.codigo_barras || 'N/A', 
      p.lote || 'N/A'
    );
  });
  prodStmt.finalize();

  console.log(`✅ ${productsData.length} productos y ${usersData.length} usuarios cargados.`);
});

db.close();
