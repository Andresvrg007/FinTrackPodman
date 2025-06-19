@echo off

if "%1"=="start" (
    echo Iniciando aplicación...
    podman-compose up -d
    goto :end
)

if "%1"=="stop" (
    echo Deteniendo aplicación...
    podman-compose down
    goto :end
)

if "%1"=="restart" (
    echo Reiniciando aplicación...
    podman-compose restart
    goto :end
)

if "%1"=="logs" (
    echo Mostrando logs...
    podman-compose logs -f
    goto :end
)

if "%1"=="build" (
    echo Construyendo imágenes...
    podman-compose build --no-cache
    goto :end
)

if "%1"=="clean" (
    echo Limpiando todo...
    podman-compose down -v
    podman system prune -f
    goto :end
)

echo Comandos disponibles:
echo   start   - Iniciar aplicación
echo   stop    - Detener aplicación  
echo   restart - Reiniciar aplicación
echo   logs    - Ver logs en tiempo real
echo   build   - Reconstruir imágenes
echo   clean   - Limpiar todo

:end
