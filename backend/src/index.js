require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const { db, initDb } = require('./db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const saleRoutes = require('./routes/sales');

const app = express();

// Espía de peticiones (DEBUG)
app.use((req, res, next) => {
  console.log(`📡 RECIBIDO: ${req.method} ${req.url}`);
  next();
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(morgan('dev')); // Logger de peticiones HTTP
app.use(cors());
app.use(express.json());

// Root route for health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Nova Salud API Server is running',
    version: '1.0.0',
    endpoints: ['/api/auth', '/api/products', '/api/sales']
  });
});

// Pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Catch-all para rutas no encontradas (Evita errores HTML 404)
app.use((req, res) => {
  console.log(`[404] Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ error: `La ruta ${req.method} ${req.url} no existe en el servidor.` });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
