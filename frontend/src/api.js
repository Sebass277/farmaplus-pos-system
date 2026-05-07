// api.js - Configuración dinámica de la API
const getApiUrl = () => {
    // 1. Prioridad: Enlace manual guardado por el administrador
    const savedBridge = localStorage.getItem('nova_salud_bridge');
    if (savedBridge) return savedBridge;

    // 2. Variable de entorno (para despliegue fijo)
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // 3. Fallback: localhost
    return 'http://localhost:5000';
};

const API_URL = getApiUrl();

export default API_URL;
