import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js'; 
import routes from './routes/routes.js'; 
import cookieParser from 'cookie-parser';

dotenv.config();
connectDB(); 

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Configuración CORS específica para contenedores
app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (como mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Lista de orígenes permitidos
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Permitir todos por ahora para debug
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    optionsSuccessStatus: 200
}));

// Middleware para debug
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use('/api', routes);

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000; 
app.listen(PORT, '0.0.0.0', () => { 
  console.log(`Server is running on PORT: ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});

export default app;