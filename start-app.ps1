# Script para levantar la aplicación MERN con Podman

Write-Host "🚀 Iniciando aplicación MERN con Podman..." -ForegroundColor Green

# Limpiar contenedores anteriores
Write-Host "🧹 Limpiando contenedores anteriores..." -ForegroundColor Yellow
podman stop expense-frontend expense-backend expense-mongo 2>$null
podman rm expense-frontend expense-backend expense-mongo 2>$null

# Crear red si no existe
Write-Host "🌐 Creando red de contenedores..." -ForegroundColor Yellow
podman network create expense-network 2>$null

# Construir imágenes
Write-Host "🔨 Construyendo imagen del backend..." -ForegroundColor Yellow
podman build -t expense-backend ./backend

Write-Host "🔨 Construyendo imagen del frontend..." -ForegroundColor Yellow
podman build -t expense-frontend ./frontend

# Ejecutar contenedores
Write-Host "🗄️ Iniciando MongoDB..." -ForegroundColor Yellow
podman run -d --name expense-mongo --network expense-network -p 27017:27017 -e MONGO_INITDB_DATABASE=ExpenseApp mongo:7.0

Write-Host "⚡ Esperando que MongoDB inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🔧 Iniciando Backend..." -ForegroundColor Yellow
podman run -d --name expense-backend --network expense-network -p 5000:5000 -e NODE_ENV=production -e MONGO_URI=mongodb://expense-mongo:27017/ExpenseApp -e JWT_SECRET=mi_secreto_super_seguro -e PORT=5000 expense-backend

Write-Host "⚡ Esperando que Backend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "🌐 Iniciando Frontend..." -ForegroundColor Yellow
podman run -d --name expense-frontend --network expense-network -p 3000:80 -e VITE_API_URL=http://localhost:5000 expense-frontend

Write-Host ""
Write-Host "✅ ¡Aplicación iniciada correctamente!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🗄️ MongoDB: localhost:27017" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Estado de contenedores:" -ForegroundColor Yellow
podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
