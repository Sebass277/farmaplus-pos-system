const localtunnel = require('localtunnel');
const { spawn } = require('child_process');
const path = require('path');

// 1. Iniciar el servidor backend
const server = spawn('node', [path.join(__dirname, 'index.js')], {
    stdio: 'inherit'
});

// 2. Iniciar el túnel (puente)
(async () => {
    try {
        const tunnel = await localtunnel({ port: 5000 });

        console.log('\n\n' + '='.repeat(50));
        console.log('🚀 NOVA SALUD - SISTEMA DE PUENTE ACTIVADO');
        console.log('='.repeat(50));
        console.log('\nCopia este enlace y pégalo en el Panel de Admin:');
        console.log('\x1b[36m%s\x1b[0m', tunnel.url); 
        console.log('\n' + '='.repeat(50));

        tunnel.on('close', () => {
            console.log('Puente cerrado.');
        });

    } catch (err) {
        console.error('Error al crear el puente:', err);
    }
})();

// Limpiar al cerrar
process.on('SIGINT', () => {
    server.kill();
    process.exit();
});
