const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/**
 * Middleware para proteger rutas
 * Verifica que el token enviado en el header 'Authorization' sea válido.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: 'Bearer TOKEN'

  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado: Se requiere un token de seguridad.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Guardamos los datos del usuario en la petición
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesión expirada o token inválido. Por favor inicia sesión de nuevo.' });
  }
};

/**
 * Middleware para restringir rutas solo a Administradores
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Administrador') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado: Se requieren permisos de Administrador.' });
    }
};

module.exports = { verifyToken, isAdmin };
