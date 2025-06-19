import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const Transactions = ({ isDarkMode }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0
    });

    // Estados del formulario
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense',
        categoryId: '',
        date: new Date().toISOString().split('T')[0]
    });

    const tabs = [
        { id: 'all', name: 'All', icon: '💼' },
        { id: 'income', name: 'Income', icon: '💰' },
        { id: 'expense', name: 'Expenses', icon: '💸' }
    ];

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        await Promise.all([
            fetchTransactions(),
            fetchCategories(),
            fetchStats()
        ]);
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/transactions`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions || []);
            } else {
                console.error('Error fetching transactions');
                setTransactions([]);
            }
        } catch (error) {
            console.error('Error:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/api/categories`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/transactions/stats`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleCreateTransaction = async (e) => {
        e.preventDefault();
        
        if (!formData.description.trim() || !formData.amount || !formData.categoryId) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Form',
                text: 'Please fill in all required fields!',
            });
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/transactions`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            });

            if (response.ok) {
                const data = await response.json();
                setTransactions([data.transaction, ...transactions]);
                
                // Resetear formulario
                setFormData({
                    description: '',
                    amount: '',
                    type: 'expense',
                    categoryId: '',
                    date: new Date().toISOString().split('T')[0]
                });
                setIsModalOpen(false);
                
                // Actualizar estadísticas
                fetchStats();

                // SweetAlert de éxito
                Swal.fire({
                    icon: 'success',
                    title: 'Transaction Added!',
                    text: 'Your transaction has been created successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });

            } else {
                const errorData = await response.json();
                console.error('Error creating transaction:', errorData.message);
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorData.message || 'Failed to create transaction',
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: 'Please check your connection and try again.',
            });
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        // SweetAlert para confirmar eliminación
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this transaction!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`${API_URL}/api/transactions/${transactionId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setTransactions(transactions.filter(t => t._id !== transactionId));
                fetchStats(); // Actualizar estadísticas
                
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Transaction has been deleted.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete transaction',
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: 'Please check your connection and try again.',
            });
        }
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Si cambia el tipo, resetear la categoría seleccionada
        if (name === 'type') {
            setFormData(prev => ({
                ...prev,
                categoryId: ''
            }));
        }
    };

    const filteredTransactions = activeTab === 'all'
        ? transactions
        : transactions.filter(transaction => transaction.type === activeTab);

    const filteredCategories = categories.filter(category => 
        category.type === formData.type
    );

    const formatAmount = (amount, type) => {
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
        
        return type === 'income' ? `+${formattedAmount}` : `-${formattedAmount}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className={`rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
                    <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl shadow-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-green-100 text-sm">Total Income</h3>
                            <p className="text-xl font-bold">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(stats.totalIncome || 0)}
                            </p>
                        </div>
                        <div className="text-2xl opacity-80">💰</div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-xl shadow-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-red-100 text-sm">Total Expenses</h3>
                            <p className="text-xl font-bold">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(stats.totalExpenses || 0)}
                            </p>
                        </div>
                        <div className="text-2xl opacity-80">💸</div>
                    </div>
                </div>
                
                <div className={`rounded-xl shadow-lg p-4 text-white ${
                    stats.balance >= 0 
                        ? 'bg-gradient-to-r from-blue-400 to-blue-600' 
                        : 'bg-gradient-to-r from-orange-400 to-orange-600'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`font-semibold text-sm ${
                                stats.balance >= 0 ? 'text-blue-100' : 'text-orange-100'
                            }`}>Balance</h3>
                            <p className="text-xl font-bold">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                }).format(stats.balance || 0)}
                            </p>
                        </div>
                        <div className="text-2xl opacity-80">📊</div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className={`text-3xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                    Transactions Management
                </h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200 text-sm font-medium active:scale-95 shadow-lg cursor-pointer flex items-center gap-2"
                >
                    <span className="text-lg">➕</span>
                    Add Transaction
                </button>
            </div>

            {/* Tabs para filtrar */}
            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                            activeTab === tab.id
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                                : isDarkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                    <div 
                        key={transaction._id}
                        className={`p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Category Icon */}
                                <div className={`w-12 h-12 bg-gradient-to-r ${transaction.categoryId.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                                    {transaction.categoryId.icon}
                                </div>
                                
                                <div>
                                    <h3 className={`font-semibold ${
                                        isDarkMode ? 'text-white' : 'text-gray-800'
                                    }`}>
                                        {transaction.description}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            transaction.type === 'expense' 
                                                ? 'bg-red-100 text-red-600' 
                                                : 'bg-green-100 text-green-600'
                                        }`}>
                                            {transaction.categoryId.name}
                                        </span>
                                        <span className={`text-xs ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                            {formatDate(transaction.date)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className={`font-bold text-lg ${
                                        transaction.type === 'income' 
                                            ? 'text-green-600' 
                                            : 'text-red-600'
                                    }`}>
                                        {formatAmount(transaction.amount, transaction.type)}
                                    </p>
                                </div>
                                
                                <button 
                                    onClick={() => handleDeleteTransaction(transaction._id)}
                                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 cursor-pointer transition-all"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">💳</div>
                    <p className={`text-lg ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        No {activeTab === 'all' ? '' : activeTab} transactions found
                    </p>
                    <p className={`text-sm mt-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                        {categories.length === 0 
                            ? 'Please add categories first before creating transactions'
                            : 'Add your first transaction to get started'
                        }
                    </p>
                </div>
            )}

            {/* Modal para agregar transacción */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className={`w-full max-w-md rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-xl font-bold ${
                                isDarkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                                Add New Transaction
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {categories.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">📂</div>
                                <p className={`text-lg ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                    No categories available
                                </p>
                                <p className={`text-sm mt-2 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    Please create categories first before adding transactions
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl cursor-pointer"
                                >
                                    OK
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateTransaction} className="space-y-4">
                                {/* Descripción */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        name="description"
                                        required
                                        placeholder="Enter transaction description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                    />
                                </div>

                                {/* Monto */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                    />
                                </div>

                                {/* Tipo */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Transaction Type
                                    </label>
                                    <select 
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all cursor-pointer ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>

                                {/* Categoría */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Category
                                    </label>
                                    <select 
                                        name="categoryId"
                                        required
                                        value={formData.categoryId}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all cursor-pointer ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                    >
                                        <option value="">Select a category</option>
                                        {filteredCategories.map((category) => (
                                            <option key={category._id} value={category._id}>
                                                {category.icon} {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fecha */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all cursor-pointer ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-all cursor-pointer ${
                                            isDarkMode
                                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-medium transition-all cursor-pointer"
                                    >
                                        Add Transaction
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};