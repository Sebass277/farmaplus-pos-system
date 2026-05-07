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
      
      console.log('✅ Estructura de base de datos lista.');
      seedDatabase(db);
    });
  } catch (err) {
    console.error('❌ Error al inicializar esquema:', err);
  }
}

// Función para auto-poblar la base de datos si está vacía (v3.0)
function seedDatabase(db) {
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (row && row.count === 0) {
            console.log('🌱 Poblando usuarios iniciales...');
            const adminPass = require('bcryptjs').hashSync('admin123', 10);
            const cajeroPass = require('bcryptjs').hashSync('cajero123', 10);
            db.run("INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)", ['USR-001', 'admin', adminPass, 'Administrador']);
            db.run("INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)", ['USR-002', 'cajero', cajeroPass, 'Cajero']);
        }
    });

    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (row && row.count === 0) {
            console.log('🌱 Poblando productos iniciales...');
            const products = [
                ['PROD-001', 'Protector Solar Facial en Gel Crema Eucerin Oil Control FPS50+', 95.50, '50ml', '/images/protector.jpg', 100, 10, '7750123456789', 'L-001'],
                ['PROD-002', 'Repuesto Gel Hidratante Facial Hydro Boost Neutrogena', 65.20, '50g', '/images/neutrogena.jpg', 50, 5, '7750987654321', 'L-002'],
                ['PROD-003', 'Bismutol 87.33mg/5 ml Suspensión Oral', 18.50, '150ml', '/images/bismutol.jpg', 30, 8, '7750111222333', 'L-003'],
                ['PROD-004', 'DoloMejoral 550 mg tableta recubierta', 1.50, '1 Tableta', '/images/dolomejoral.jpg', 200, 50, '7750444555666', 'L-004'],
                ['PROD-005', 'Dolo Neurobion Forte NF', 5.80, '1 Ampolla', '/images/doloneurobion.jpg', 150, 20, '7750777888999', 'L-005']
            ];
            const stmt = db.prepare("INSERT INTO products (id, nombre, precio, unidad, imagen, stock_actual, stock_minimo, codigo_barras, lote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            products.forEach(p => stmt.run(p));
            stmt.finalize();
        }
    });
}

module.exports = { db, dbAsync, initDb };
