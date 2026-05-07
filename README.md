# 🏥 Nova Salud - Sistema POS & Gestión de Inventario (v3.0)

**Nova Salud** es una solución integral para la gestión de farmacias y boticas, desarrollada con un enfoque en la integridad de datos, seguridad transaccional y sincronización en tiempo real.

## 🚀 Características Principales (Versión Pro)

- **🛒 Punto de Venta (POS):** Interfaz fluida para ventas rápidas con generación automática de tickets en PDF.
- **📦 Inventario Inteligente:** Control de stock con alertas de existencias bajas y prevención de stock negativo.
- **🛡️ Seguridad Transaccional:** Backend autoritativo que valida precios y disponibilidad en cada transacción mediante SQLite Transactions.
- **🔑 Autenticación JWT:** Acceso restringido por roles (Administrador/Cajero) para proteger operaciones críticas.
- **📊 Reportes y KPIs:** Visualización de métricas de ventas, ticket promedio e historial completo de transacciones.
- **🔄 Sincronización Real-time:** Dashboard y Ecommerce sincronizados mediante Socket.io.
- **📖 Auditoría de Inventario:** Registro detallado de cada movimiento de entrada y salida de productos.

## 🛠️ Stack Tecnológico

- **Frontend:** React.js, Vite, Lucide Icons, CSS3 (Glassmorphism UI).
- **Backend:** Node.js, Express.js.
- **Base de Datos:** SQLite (Arquitectura de archivos atómicos).
- **Comunicación:** Socket.io, REST API.
- **Seguridad:** JSON Web Tokens (JWT), BcryptJS.

## ⚙️ Instalación Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Sebass277/farmaplus-pos-system.git
   ```

2. **Instalar dependencias:**
   ```bash
   # En la carpeta /backend
   npm install
   # En la carpeta /frontend
   npm install
   ```

3. **Iniciar el sistema:**
   ```bash
   # Terminal 1 (Servidor)
   cd backend && npm run dev
   # Terminal 2 (Cliente)
   cd frontend && npm run dev
   ```

## 👨‍💻 Autor
**Sebass277** - *Desarrollo y Arquitectura*
