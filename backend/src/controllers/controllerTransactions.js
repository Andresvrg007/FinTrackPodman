import Transaction from '../models/transaction.js';
import Category from '../models/category.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose'; 

// Obtener todas las transacciones del usuario
export const getTransactions = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Obtener transacciones con populate de categoría
        const transactions = await Transaction.find({ userId })
            .populate('categoryId', 'name icon color type')
            .sort({ createdAt: -1 }); // Más recientes primero

        return res.status(200).json({
            message: "Transactions retrieved successfully",
            transactions
        });

    } catch (error) {
        console.error('Get transactions error:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// Crear nueva transacción
export const createTransaction = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        const { description, amount, type, categoryId, date } = req.body;

        // Verificar que la categoría existe y pertenece al usuario
        const category = await Category.findOne({ 
            _id: categoryId, 
            userId: userId 
        });

        if (!category) {
            return res.status(404).json({
                message: "Category not found or doesn't belong to user"
            });
        }

        // Verificar que el tipo de transacción coincida con el tipo de categoría
        if (category.type !== type) {
            return res.status(400).json({
                message: `Category type (${category.type}) doesn't match transaction type (${type})`
            });
        }

        const newTransaction = new Transaction({
            description,
            amount,
            type,
            categoryId,
            userId,
            date: date || new Date()
        });

        await newTransaction.save();

        // Obtener la transacción creada con la categoría poblada
        const populatedTransaction = await Transaction.findById(newTransaction._id)
            .populate('categoryId', 'name icon color type');

        return res.status(201).json({
            message: "Transaction created successfully",
            transaction: populatedTransaction
        });

    } catch (error) {
        console.error('Create transaction error:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// Eliminar transacción
export const deleteTransaction = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;
        const { transactionId } = req.params;

        const transaction = await Transaction.findOneAndDelete({ 
            _id: transactionId, 
            userId 
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        return res.status(200).json({
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        console.error('Delete transaction error:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// Obtener estadísticas de transacciones
export const getTransactionStats = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Calcular totales
        const totalIncome = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalExpenses = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const incomeAmount = totalIncome[0]?.total || 0;
        const expenseAmount = totalExpenses[0]?.total || 0;
        const balance = incomeAmount - expenseAmount;

        return res.status(200).json({
            message: "Transaction stats retrieved successfully",
            stats: {
                totalIncome: incomeAmount,
                totalExpenses: expenseAmount,
                balance: balance
            }
        });

    } catch (error) {
        console.error('Get transaction stats error:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};