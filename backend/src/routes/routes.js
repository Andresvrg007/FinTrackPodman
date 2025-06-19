import express from 'express';
import { registerController } from '../controllers/controllerRegister.js';
import { loginController } from '../controllers/controllerLogin.js';
import { controllerDashboard } from '../controllers/controllerDashboard.js';
import { deleteCookie } from '../controllers/controllerCookie.js';
import { getCategories, createCategory, deleteCategory } from '../controllers/controllerCategories.js';
import { getTransactions, createTransaction, deleteTransaction, getTransactionStats } from '../controllers/controllerTransactions.js';
import { generatePDF } from '../controllers/controllerPDF.js';

const router = express.Router();

router.post("/", loginController);
router.post("/register", registerController);
router.get("/dashboard", controllerDashboard);
router.get("/dashboard/deleteCookie", deleteCookie);


// Rutas para categorías
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.delete("/categories/:categoryId", deleteCategory);

// Rutas para transacciones
router.get("/transactions", getTransactions);
router.post("/transactions", createTransaction);
router.delete("/transactions/:transactionId", deleteTransaction);
router.get("/transactions/stats", getTransactionStats);

// Ruta para generar PDF
router.get("/generate-pdf", generatePDF);

export default router;