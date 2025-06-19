# ExpensesApp
## Español

ExpensesApp es una aplicación web full-stack para gestionar finanzas personales. Permite a los usuarios registrar ingresos y gastos, categorizar transacciones y visualizar sus datos financieros con gráficos e informes usando podman como contenedor de toda la app.

### Características
- Autenticación de usuarios (registro, inicio y cierre de sesión)
- Panel principal con resumen financiero y gráficos
- Agregar, editar y eliminar ingresos y gastos
- Categorizar transacciones
- Generar reportes en PDF
- Interfaz moderna y responsiva

### Tecnologías Utilizadas
- **Frontend:** React, Vite, Tailwind CSS, Recharts, jsPDF
- **Backend:** Node.js, Express, MongoDB, Mongoose

### Primeros Pasos

#### Requisitos Previos
- Node.js y npm instalados
- Instancia de MongoDB (local o en la nube)

#### Configuración del Backend
1. Ve a la carpeta `backend`:
   ```powershell
   cd backend
   ```
2. Instala las dependencias:
   ```powershell
   npm install
   ```
3. Crea un archivo `.env` con tu cadena de conexión de MongoDB y otras variables de entorno necesarias.
4. Inicia el servidor backend:
   ```powershell
   npm run dev
   ```

#### Configuración del Frontend
1. Ve a la carpeta `frontend`:
   ```powershell
   cd ../frontend
   ```
2. Instala las dependencias:
   ```powershell
   npm install
   ```
3. Inicia el servidor de desarrollo del frontend:
   ```powershell
   npm run dev
   ```

El frontend estará disponible en `http://localhost:5173` y el backend en `http://localhost:3000` por defecto.


## English

ExpensesApp is a full-stack web application for managing personal finances. It allows users to track their income and expenses, categorize transactions, and visualize their financial data with charts and reports.

### Features
- User authentication (register, login, logout)
- Dashboard with financial summary and charts
- Add, edit, and delete income and expense transactions
- Categorize transactions
- Generate PDF reports
- Responsive and modern UI

### Technologies Used
- **Frontend:** React, Vite, Tailwind CSS, Recharts, jsPDF
- **Backend:** Node.js, Express, MongoDB, Mongoose

### Getting Started

#### Prerequisites
- Node.js and npm installed
- MongoDB instance (local or cloud)

#### Backend Setup
1. Navigate to the `backend` folder:
   ```powershell
   cd backend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Create a `.env` file with your MongoDB connection string and other environment variables as needed.
4. Start the backend server:
   ```powershell
   npm run dev
   ```

#### Frontend Setup
1. Navigate to the `frontend` folder:
   ```powershell
   cd ../frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the frontend development server:
   ```powershell
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000` by default.

---

