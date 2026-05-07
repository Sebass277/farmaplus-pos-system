@echo off
title NOVA SALUD - Lanzador de Puente
echo ===========================================
echo   INICIANDO PUENTE DE NOVA SALUD...
echo ===========================================
cd backend
echo Instalando dependencias (solo la primera vez)...
call npm install
echo Iniciando servidor y generando enlace...
npm run bridge
pause
