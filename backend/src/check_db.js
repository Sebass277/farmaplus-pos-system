const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../farmacia.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT id, nombre, stock_actual FROM products LIMIT 5', [], (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('📦 ESTADO ACTUAL DEL INVENTARIO:');
    console.table(rows);
    db.close();
});
