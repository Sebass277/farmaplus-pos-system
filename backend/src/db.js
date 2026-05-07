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
            console.log('🌱 Poblando catálogo completo (22 productos)...');
            const products = [
                ['PROD-001', 'Protector Solar Facial en Gel Crema Eucerin Oil Control FPS50+', 96.9, 'FRASCO 50 ML', '/images/PROD-001.jpg', 132, 12, '7756708015805', 'L-3396-C'],
                ['PROD-002', 'Repuesto Gel Hidratante Facial Hydro Boost Neutrogena', 34.9, 'TUBO 50 GR', '/images/PROD-002.jpg', 207, 9, '7751462119604', 'L-3329-A'],
                ['PROD-003', 'Bismutol 87.33mg/5 ml Suspensión Oral', 26.5, 'FRASCO 340 ML', '/images/PROD-003.jpg', 61, 19, '7754076235787', 'L-8420-B'],
                ['PROD-004', 'DoloMejoral 550 mg tableta recubierta', 21, 'BLÍSTER 10 UN', '/images/PROD-004.jpg', 116, 15, '7753007720284', 'L-3121-B'],
                ['PROD-005', 'Dolo Neurobion Forte NF', 12.8, 'BLÍSTER 4 UN', '/images/PROD-005.jpg', 189, 12, '7757771254243', 'L-1060-C'],
                ['PROD-006', 'Anaflex® Mujer 200Mg Cápsula Blanda', 135, 'CAJA 150 UN', '/images/PROD-006.jpg', 200, 8, '7758181676994', 'L-3789-C'],
                ['PROD-007', 'Paracetamol 500mg Tableta', 10, 'CAJA 100 UN', '/images/PROD-007.jpg', 175, 8, '7752250699743', 'L-9555-A'],
                ['PROD-008', 'Cetirizina IQ 10mg Tableta Recubierta', 10, 'CAJA 100 UN', '/images/PROD-008.jpg', 44, 5, '7754412578269', 'L-9482-C'],
                ['PROD-009', 'Omeprazol 20mg Cápsula de Liberación Retardada', 11.8, 'CAJA 100 UN', '/images/PROD-009.jpg', 23, 15, '7754623367006', 'L-8176-A'],
                ['PROD-010', 'Paracetamol 500mg Tableta', 10, 'CAJA 100 UN', '/images/PROD-010.jpg', 192, 14, '7754954021563', 'L-2124-A'],
                ['PROD-011', 'Terbinafina 250mg Tabletas recubiertas', 85, 'CAJA 100 UN', '/images/PROD-011.jpg', 98, 5, '7758258839367', 'L-8009-C'],
                ['PROD-012', 'Loratadina 10mg', 4.9, 'CAJA 100 UN', '/images/PROD-012.jpg', 157, 16, '7752547783022', 'L-3551-C'],
                ['PROD-013', 'Ibuprofeno 400mg Tableta recubierta', 13, 'CAJA 100 UN', '/images/PROD-013.jpg', 85, 18, '7751970827320', 'L-4473-A'],
                ['PROD-014', 'Sulfato Ferroso 300mg Tableta', 10, 'CAJA 100 UN', '/images/PROD-014.jpg', 37, 12, '7751202707857', 'L-6805-B'],
                ['PROD-015', 'Naproxeno Sódico 550 Mg Tableta Recubierta', 3.8, 'BLÍSTER 10 UN', '/images/PROD-015.jpg', 117, 14, '7752259817472', 'L-9187-B'],
                ['PROD-016', 'Enterogermina Suspensión Oral', 3.7, 'FRASCO BEBIBLE 1 UN', '/images/PROD-016.jpg', 171, 17, '7756658404983', 'L-3739-C'],
                ['PROD-017', 'Buscapina Compositum N 10mg/500mg Comprimido Recubierto', 10, 'BLÍSTER 10 UN', '/images/PROD-017.jpg', 29, 19, '7753511362709', 'L-4487-C'],
                ['PROD-018', 'Caverta 5mg Tableta Recubierta', 72.24, 'CAJA 28 UN', '/images/PROD-018.jpg', 86, 19, '7757568213931', 'L-7864-C'],
                ['PROD-019', 'Ácido Tranexamico 250mg Cápsula', 30.8, 'CAJA 10 UN', '/images/PROD-019.jpg', 211, 15, '7756381638623', 'L-5800-A'],
                ['PROD-020', 'Sal De Andrews Clasica Polvo Efervescente Para Solucion Oral', 1, 'UNIDAD 1 UN', '/images/PROD-020.jpg', 180, 16, '7755264180220', 'L-9714-A'],
                ['PROD-021', 'Bio Electro 250mg + 250mg + 65mg Tableta Recubierta', 80, 'CAJA 100 UN', '/images/PROD-021.jpg', 125, 16, '7755626361831', 'L-6650-B'],
                ['PROD-022', 'Climadiol 2Mg Tableta Recubierta', 77.7, 'CAJA 30 UN', '/images/PROD-022.jpg', 202, 13, '7751303712354', 'L-6470-C']
            ];
            const stmt = db.prepare("INSERT INTO products (id, nombre, precio, unidad, imagen, stock_actual, stock_minimo, codigo_barras, lote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            products.forEach(p => stmt.run(p));
            stmt.finalize();
        }
    });
}

module.exports = { db, dbAsync, initDb };
