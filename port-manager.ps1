param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("check", "free", "status", "conflicts")]
    [string]$Action
)

function Check-Ports {
    Write-Host "🔍 Verificando puertos de la aplicación MERN:" -ForegroundColor Cyan
    
    $ports = @(3000, 5000, 27017)
    
    foreach ($port in $ports) {
        $connection = netstat -an | findstr ":$port "
        if ($connection) {
            Write-Host "Puerto $port: ❌ OCUPADO" -ForegroundColor Red
            Write-Host "  $connection" -ForegroundColor Yellow
        } else {
            Write-Host "Puerto $port: ✅ LIBRE" -ForegroundColor Green
        }
    }
}

function Free-Ports {
    Write-Host "🔓 Liberando puertos de la aplicación MERN..." -ForegroundColor Yellow
    
    # Detener contenedores específicos
    $containers = @("expense-frontend", "expense-backend", "expense-mongo")
    
    foreach ($container in $containers) {
        $running = podman ps --format "{{.Names}}" | findstr "^$container$"
        if ($running) {
            Write-Host "Deteniendo $container..." -ForegroundColor Yellow
            podman stop $container
            podman rm $container
        }
    }
    
    Write-Host "✅ Puertos liberados" -ForegroundColor Green
    Check-Ports
}

function Show-Status {
    Write-Host "📊 Estado actual de contenedores y puertos:" -ForegroundColor Cyan
    
    # Contenedores de la app
    Write-Host "`n🐳 Contenedores MERN:" -ForegroundColor White
    podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=expense-"
    
    # Todos los contenedores
    Write-Host "`n🌐 Todos los contenedores:" -ForegroundColor White
    podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Estado de puertos
    Write-Host ""
    Check-Ports
}

function Check-Conflicts {
    Write-Host "⚠️ Verificando conflictos potenciales:" -ForegroundColor Yellow
    
    # Servicios comunes que pueden usar estos puertos
    $services = @{
        3000 = @("React Dev Server", "Next.js", "Otras apps Node.js")
        5000 = @("Flask apps", "Otras APIs", "Services Windows")
        27017 = @("MongoDB local", "Otras instancias MongoDB")
    }
    
    foreach ($port in $services.Keys) {
        Write-Host "`nPuerto $port podría conflictar con:" -ForegroundColor Cyan
        foreach ($service in $services[$port]) {
            Write-Host "  - $service" -ForegroundColor Gray
        }
    }
}

# Ejecutar acción
switch ($Action) {
    "check" { Check-Ports }
    "free" { Free-Ports }
    "status" { Show-Status }
    "conflicts" { Check-Conflicts }
}
