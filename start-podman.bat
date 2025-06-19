@echo off
echo Iniciando aplicación MERN con Podman...

echo Paso 1: Limpiando contenedores anteriores...
podman-compose down -v

echo Paso 2: Construyendo imágenes...
podman-compose build --no-cache

echo Paso 3: Levantando servicios...
podman-compose up -d

echo Paso 4: Mostrando estado de contenedores...
podman ps

echo.
echo ✅ Aplicación iniciada correctamente!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo 🗄️ MongoDB: localhost:27017
echo.
echo Para ver logs: podman-compose logs -f
echo Para detener: podman-compose down
