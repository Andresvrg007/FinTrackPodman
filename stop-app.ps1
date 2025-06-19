# Script para detener la aplicación MERN

Write-Host "🛑 Deteniendo aplicación MERN..." -ForegroundColor Red

Write-Host "Deteniendo contenedores..." -ForegroundColor Yellow
podman stop expense-frontend expense-backend expense-mongo

Write-Host "Eliminando contenedores..." -ForegroundColor Yellow
podman rm expense-frontend expense-backend expense-mongo

Write-Host "Eliminando red..." -ForegroundColor Yellow
podman network rm expense-network

Write-Host "✅ Aplicación detenida correctamente" -ForegroundColor Green
