// api.js - Configuración dinámica de la API
const getApiUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const savedBridge = localStorage.getItem('nova_salud_bridge');
    if (savedBridge) url = savedBridge;
    else if (import.meta.env.VITE_API_URL) url = import.meta.env.VITE_API_URL;

    // Limpieza: Quitar barra final si existe
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

const API_URL = getApiUrl();

export default API_URL;
