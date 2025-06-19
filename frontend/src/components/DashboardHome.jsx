import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const DashboardHome = ({ isDarkMode, setCurrentView }) => {
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Colores para los gráficos
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Obtener estadísticas
            const statsResponse = await fetch(`${API_URL}/api/transactions/stats`, {
                method: 'GET',
                credentials: 'include'
            });

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData.stats);
            }

            // Obtener transacciones recientes
            const transactionsResponse = await fetch(`${API_URL}/api/transactions`, {
                method: 'GET',
                credentials: 'include'
            });

            if (transactionsResponse.ok) {
                const transactionsData = await transactionsResponse.json();
                const recent = transactionsData.transactions.slice(0, 5);
                setRecentTransactions(recent);

                // Procesar datos para gráficos
                processCategoryData(transactionsData.transactions);
                processMonthlyData(transactionsData.transactions);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processCategoryData = (transactions) => {
        const categoryTotals = {};
        
        transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                const categoryName = transaction.categoryId?.name || 'Other';
                categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + transaction.amount;
            }
        });

        const categoryArray = Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value,
            percentage: ((value / Object.values(categoryTotals).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
        }));

        setCategoryStats(categoryArray);
    };

    const processMonthlyData = (transactions) => {
        const monthlyTotals = {};
        
        transactions.forEach(transaction => {
            const month = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            
            if (!monthlyTotals[month]) {
                monthlyTotals[month] = { month, income: 0, expenses: 0 };
            }
            
            if (transaction.type === 'income') {
                monthlyTotals[month].income += transaction.amount;
            } else {
                monthlyTotals[month].expenses += transaction.amount;
            }
        });

        const monthlyArray = Object.values(monthlyTotals).slice(-6); // Últimos 6 meses
        setMonthlyData(monthlyArray);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className={`rounded-2xl shadow-xl p-6 ${
                isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-500 to-purple-600'
            } text-white`}>
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back! 👋
                </h1>
                <p className="text-lg opacity-90">
                    Here's your financial overview for today
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Income */}
                <div className={`rounded-2xl shadow-lg p-6 border-l-4 border-green-500 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                Total Income
                            </p>
                            <p className={`text-2xl font-bold text-green-500 ${
                                isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                                {formatCurrency(stats.totalIncome)}
                            </p>
                        </div>
                        <div className="text-3xl">💰</div>
                    </div>
                </div>

                {/* Total Expenses */}
                <div className={`rounded-2xl shadow-lg p-6 border-l-4 border-red-500 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                Total Expenses
                            </p>
                            <p className={`text-2xl font-bold ${
                                isDarkMode ? 'text-red-400' : 'text-red-600'
                            }`}>
                                {formatCurrency(stats.totalExpenses)}
                            </p>
                        </div>
                        <div className="text-3xl">💸</div>
                    </div>
                </div>

                {/* Current Balance */}
                <div className={`rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                Current Balance
                            </p>
                            <p className={`text-2xl font-bold ${
                                stats.balance >= 0 
                                    ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                    : isDarkMode ? 'text-red-400' : 'text-red-600'
                            }`}>
                                {formatCurrency(stats.balance)}
                            </p>
                        </div>
                        <div className="text-3xl">📊</div>
                    </div>
                </div>

                {/* Savings Rate */}
                <div className={`rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                Savings Rate
                            </p>
                            <p className={`text-2xl font-bold ${
                                isDarkMode ? 'text-purple-400' : 'text-purple-600'
                            }`}>
                                {stats.totalIncome > 0 
                                    ? `${((stats.balance / stats.totalIncome) * 100).toFixed(1)}%`
                                    : '0%'
                                }
                            </p>
                        </div>
                        <div className="text-3xl">📈</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={`rounded-2xl shadow-xl p-6 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                <h2 className={`text-2xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => setCurrentView('transactions')}
                        className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                        <span className="text-2xl mb-2">➕</span>
                        <span className="font-medium">Add Transaction</span>
                    </button>
                    
                    <button
                        onClick={() => setCurrentView('categories')}
                        className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                        <span className="text-2xl mb-2">🏷️</span>
                        <span className="font-medium">Add Category</span>
                    </button>
                    
                    <button
                        onClick={() => setCurrentView('pdf')}
                        className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                        <span className="text-2xl mb-2">📄</span>
                        <span className="font-medium">Generate PDF</span>
                    </button>
                    
                    <button
                        onClick={() => setCurrentView('transactions')}
                        className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                        <span className="text-2xl mb-2">📊</span>
                        <span className="font-medium">View Reports</span>
                    </button>
                </div>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <div className={`rounded-2xl shadow-xl p-6 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <h2 className={`text-2xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                        Recent Transactions
                    </h2>
                    
                    {recentTransactions.length > 0 ? (
                        <div className="space-y-3">
                            {recentTransactions.map((transaction, index) => (
                                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                }`}>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">
                                            {transaction.categoryId?.icon || '💰'}
                                        </span>
                                        <div>
                                            <p className={`font-medium ${
                                                isDarkMode ? 'text-white' : 'text-gray-800'
                                            }`}>
                                                {transaction.description}
                                            </p>
                                            <p className={`text-sm ${
                                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                            }`}>
                                                {formatDate(transaction.date)} • {transaction.categoryId?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${
                                        transaction.type === 'income' 
                                            ? 'text-green-500' 
                                            : 'text-red-500'
                                    }`}>
                                        {transaction.type === 'income' ? '+' : '-'}
                                        {formatCurrency(transaction.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <span className="text-4xl">📭</span>
                            <p className={`mt-2 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                No transactions yet
                            </p>
                        </div>
                    )}
                </div>

                {/* Expense Categories Chart */}
                <div className={`rounded-2xl shadow-xl p-6 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <h2 className={`text-2xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                        Expenses by Category
                    </h2>
                    
                    {categoryStats.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryStats}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percentage }) => `${name} ${percentage}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <span className="text-4xl">📊</span>
                            <p className={`mt-2 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                No expense data available
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Trend Chart */}
            {monthlyData.length > 0 && (
                <div className={`rounded-2xl shadow-xl p-6 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <h2 className={`text-2xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                        Monthly Trend
                    </h2>
                    
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => `$${value}`} />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="income" fill="#10B981" name="Income" />
                                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};