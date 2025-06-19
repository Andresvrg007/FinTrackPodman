import Transaction from '../models/transaction.js';
import Category from '../models/category.js';
import User from '../models/user.js'; // ✅ AGREGADO: Import faltante
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import htmlToPdf from 'html-pdf-node';

export const generatePDF = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        // Obtener transacciones con populate
        const transactions = await Transaction.find({ userId })
            .populate('categoryId', 'name icon color type')
            .sort({ createdAt: -1 })
            .limit(10);

        // Calcular estadísticas
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

        // Generar HTML para el PDF
        const htmlContent = generateHTMLContent({
            user,
            transactions,
            stats: {
                totalIncome: incomeAmount,
                totalExpenses: expenseAmount,
                balance: balance
            }
        });

        // Configuración para el PDF
        const options = {
            format: 'A4',
            border: {
                top: "20px",
                right: "20px", 
                bottom: "20px",
                left: "20px"
            },
            paginationOffset: 1,
            header: {
                height: "0mm",
            },
            footer: {
                height: "0mm",
            },
            timeout: 30000
        };

        const file = { content: htmlContent };

        // Generar PDF
        const pdfBuffer = await htmlToPdf.generatePdf(file, options);

        // Enviar PDF como respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="expense-report-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Generate PDF error:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Función para generar el contenido HTML del PDF (MEJORADA)
const generateHTMLContent = ({ user, transactions, stats }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Expense Report</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: #f8f9fa;
                padding: 20px;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 3px solid #667eea;
                padding-bottom: 20px;
            }
            
            .header h1 {
                color: #667eea;
                font-size: 28px;
                margin-bottom: 10px;
                font-weight: bold;
            }
            
            .header .subtitle {
                color: #666;
                font-size: 14px;
            }
            
            .user-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 25px;
                border-left: 4px solid #667eea;
            }
            
            .user-info h2 {
                color: #333;
                margin-bottom: 8px;
                font-size: 16px;
            }
            
            .stats-grid {
                display: flex;
                justify-content: space-between;
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                flex: 1;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                color: white;
                font-weight: bold;
            }
            
            .stat-card.income {
                background: #28a745;
            }
            
            .stat-card.expense {
                background: #dc3545;
            }
            
            .stat-card.balance {
                background: #17a2b8;
            }
            
            .stat-card h3 {
                font-size: 12px;
                margin-bottom: 8px;
                opacity: 0.9;
            }
            
            .stat-card .amount {
                font-size: 18px;
                font-weight: bold;
            }
            
            .transactions-section {
                margin-top: 30px;
            }
            
            .transactions-section h2 {
                color: #333;
                margin-bottom: 15px;
                font-size: 20px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 8px;
            }
            
            .transaction-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                border: 1px solid #ddd;
            }
            
            .transaction-table th {
                background: #667eea;
                color: white;
                padding: 10px;
                text-align: left;
                font-weight: bold;
                font-size: 12px;
            }
            
            .transaction-table td {
                padding: 8px 10px;
                border-bottom: 1px solid #eee;
                font-size: 11px;
            }
            
            .transaction-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            
            .category-badge {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
                color: white;
            }
            
            .category-badge.income {
                background: #28a745;
            }
            
            .category-badge.expense {
                background: #dc3545;
            }
            
            .amount.income {
                color: #28a745;
                font-weight: bold;
            }
            
            .amount.expense {
                color: #dc3545;
                font-weight: bold;
            }
            
            .footer {
                margin-top: 30px;
                text-align: center;
                padding-top: 15px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 12px;
            }
            
            .empty-state {
                text-align: center;
                padding: 30px;
                color: #666;
            }
            
            .empty-state .icon {
                font-size: 36px;
                margin-bottom: 15px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <h1>💰 ExpenseApp Report</h1>
                <p class="subtitle">Financial Summary Report</p>
                <p class="subtitle">Generated on ${currentDate}</p>
            </div>
            
            <!-- User Info -->
            <div class="user-info">
                <h2>👤 Account Information</h2>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Report Date:</strong> ${currentDate}</p>
            </div>
            
            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card income">
                    <h3>💰 Total Income</h3>
                    <div class="amount">${formatCurrency(stats.totalIncome)}</div>
                </div>
                <div class="stat-card expense">
                    <h3>💸 Total Expenses</h3>
                    <div class="amount">${formatCurrency(stats.totalExpenses)}</div>
                </div>
                <div class="stat-card balance">
                    <h3>📊 Current Balance</h3>
                    <div class="amount">${formatCurrency(stats.balance)}</div>
                </div>
            </div>
            
            <!-- Recent Transactions -->
            <div class="transactions-section">
                <h2>📋 Recent Transactions (Last 10)</h2>
                
                ${transactions.length > 0 ? `
                <table class="transaction-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(transaction => `
                            <tr>
                                <td>${formatDate(transaction.date)}</td>
                                <td>${transaction.description}</td>
                                <td>
                                    ${transaction.categoryId.icon} ${transaction.categoryId.name}
                                </td>
                                <td>
                                    <span class="category-badge ${transaction.type}">
                                        ${transaction.type.toUpperCase()}
                                    </span>
                                </td>
                                <td class="amount ${transaction.type}">
                                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ` : `
                <div class="empty-state">
                    <div class="icon">📭</div>
                    <h3>No Transactions Found</h3>
                    <p>You haven't recorded any transactions yet.</p>
                </div>
                `}
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p>This report was automatically generated by ExpenseApp</p>
                <p>© ${new Date().getFullYear()} ExpenseApp - Personal Finance Management</p>
            </div>
        </div>
    </body>
    </html>
    `;
};