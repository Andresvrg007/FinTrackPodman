param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "logs", "status", "clean")]
    [string]$Action
)

function Show-Status {
    Write-Host "📊 Estado actual de la aplicación:" -ForegroundColor Cyan
    podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=expense-"
}

function Start-App {
    Write-Host "🚀 Iniciando aplicación MERN..." -ForegroundColor Green
    
    # Crear red si no existe
    podman network create expense-network 2>$null
    
    # Iniciar MongoDB
    Write-Host "🗄️ Iniciando MongoDB..." -ForegroundColor Yellow
    podman run -d --name expense-mongo --network expense-network -p 27017:27017 -e MONGO_INITDB_DATABASE=ExpenseApp mongo:7.0
    
    Start-Sleep -Seconds 5
    
    # Iniciar Backend
    Write-Host "🔧 Iniciando Backend..." -ForegroundColor Yellow
    podman run -d --name expense-backend --network expense-network -p 5000:5000 -e NODE_ENV=production -e MONGO_URI=mongodb://expense-mongo:27017/ExpenseApp -e JWT_SECRET=mi_secreto_super_seguro -e PORT=5000 expense-backend
    
    Start-Sleep -Seconds 3
    
    # Iniciar Frontend
    Write-Host "🌐 Iniciando Frontend..." -ForegroundColor Yellow
    podman run -d --name expense-frontend --network expense-network -p 3000:80 -e VITE_API_URL=http://localhost:5000 expense-frontend
    
    Write-Host "✅ Aplicación iniciada!" -ForegroundColor Green
    Show-Status
}

function Stop-App {
    Write-Host "🛑 Deteniendo aplicación..." -ForegroundColor Red
    podman stop expense-frontend expense-backend expense-mongo 2>$null
    podman rm expense-frontend expense-backend expense-mongo 2>$null
    Write-Host "✅ Aplicación detenida" -ForegroundColor Green
}

function Restart-App {
    Stop-App
    Start-Sleep -Seconds 2
    Start-App
}

function Show-Logs {
    Write-Host "📋 Selecciona qué logs ver:" -ForegroundColor Cyan
    Write-Host "1. Backend"
    Write-Host "2. Frontend"
    Write-Host "3. MongoDB"
    Write-Host "4. Todos"
    
    $choice = Read-Host "Opción (1-4)"
    
    switch ($choice) {
        "1" { podman logs -f expense-backend }
        "2" { podman logs -f expense-frontend }
        "3" { podman logs -f expense-mongo }
        "4" { 
            Write-Host "Backend logs:" -ForegroundColor Yellow
            podman logs expense-backend --tail=10
            Write-Host "`nFrontend logs:" -ForegroundColor Yellow
            podman logs expense-frontend --tail=10
            Write-Host "`nMongoDB logs:" -ForegroundColor Yellow
            podman logs expense-mongo --tail=10
        }
        default { Write-Host "Opción inválida" -ForegroundColor Red }
    }
}

function Clean-All {
    Write-Host "🧹 Limpiando todo..." -ForegroundColor Yellow
    Stop-App
    podman network rm expense-network 2>$null
    podman volume prune -f
    Write-Host "✅ Limpieza completada" -ForegroundColor Green
}

# Ejecutar acción
switch ($Action) {
    "start" { Start-App }
    "stop" { Stop-App }
    "restart" { Restart-App }
    "logs" { Show-Logs }
    "status" { Show-Status }
    "clean" { Clean-All }
}
