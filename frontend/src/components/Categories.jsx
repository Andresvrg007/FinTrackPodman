import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const Categories = ({ isDarkMode }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [categoryType, setCategoryType] = useState('expense');
    const [selectedIcon, setSelectedIcon] = useState('💰');
    const [selectedColor, setSelectedColor] = useState('from-blue-500 to-blue-600');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Iconos disponibles
    const availableIcons = [
        '🍽️', '🚗', '💼', '🛍️', '💻', '🎬', '📈', '🏥', 
        '🏠', '⚡', '📱', '🎓', '🎮', '✈️', '🚌', '⛽'
    ];

    // Colores disponibles
    const availableColors = [
        'from-red-500 to-red-600',
        'from-blue-500 to-blue-600', 
        'from-green-500 to-green-600',
        'from-purple-500 to-purple-600',
        'from-teal-500 to-teal-600',
        'from-pink-500 to-pink-600',
        'from-indigo-500 to-indigo-600',
        'from-orange-500 to-orange-600'
    ];

    const tabs = [
        { id: 'all', name: 'All' },
        { id: 'income', name: 'Income' },
        { id: 'expense', name: 'Expense' },
    ];

    // Cargar categorías al montar el componente
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/categories`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories || []);
            } else {
                console.error('Error fetching categories');
                setCategories([]);
            }
        } catch (error) {
            console.error('Error:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        
        if (!categoryName.trim()) return;

        try {
            const response = await fetch(`${API_URL}/api/categories`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: categoryName,
                    type: categoryType,
                    icon: selectedIcon,
                    color: selectedColor
                })
            });

            if (response.ok) {
                const data = await response.json();
                setCategories([...categories, data.category]);
                
                // Resetear formulario
                setCategoryName('');
                setCategoryType('expense');
                setSelectedIcon('💰');
                setSelectedColor('from-blue-500 to-blue-600');
                setIsModalOpen(false);
            } else {
                console.error('Error creating category');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this category!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setCategories(categories.filter(cat => cat._id !== categoryId));
            } else {
                console.error('Error deleting category');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    const filteredCategories = activeTab === 'all'
        ? categories
        : categories.filter(category => category.type === activeTab);

    if (loading) {
        return (
            <div className={`rounded-2xl shadow-xl p-6 border-l-4 border-green-500 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl shadow-xl p-6 border-l-4 border-green-500 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className={`text-3xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                    Categories Management
                </h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 text-sm font-medium active:scale-95 shadow-lg cursor-pointer flex items-center gap-2"
                >
                    <span className="text-lg">➕</span>
                    Add Category
                </button>
            </div>

            {/* Tabs para filtrar */}
            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                            activeTab === tab.id
                                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                                : isDarkMode
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCategories.map((category) => (
                    <div 
                        key={category._id}
                        className={`p-4 rounded-xl border transition-all duration-200 hover:scale-105 cursor-pointer ${
                            isDarkMode 
                                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                                    {category.icon}
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${
                                        isDarkMode ? 'text-white' : 'text-gray-800'
                                    }`}>
                                        {category.name}
                                    </h3>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        category.type === 'expense' 
                                            ? 'bg-red-100 text-red-600' 
                                            : 'bg-green-100 text-green-600'
                                    }`}>
                                        {category.type === 'expense' ? 'Expense' : 'Income'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleDeleteCategory(category._id)}
                                    className="p-1 rounded-lg hover:bg-red-100 text-red-600 cursor-pointer"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State cuando no hay categorías filtradas */}
            {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📂</div>
                    <p className={`text-lg ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        No {activeTab === 'all' ? '' : activeTab} categories found
                    </p>
                    <p className={`text-sm mt-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                        Add your first category to get started
                    </p>
                </div>
            )}

            {/* Modal para agregar categoría */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className={`w-full max-w-md rounded-2xl shadow-xl p-6 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-xl font-bold ${
                                isDarkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                                Add New Category
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            {/* Nombre de categoría */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter category name"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                />
                            </div>

                            {/* Tipo de categoría */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Category Type
                                </label>
                                <select 
                                    value={categoryType}
                                    onChange={(e) => setCategoryType(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all cursor-pointer ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>

                            {/* Selección de icono */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Select Icon
                                </label>
                                <div className="grid grid-cols-8 gap-2">
                                    {availableIcons.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setSelectedIcon(icon)}
                                            className={`p-2 rounded-lg text-lg transition-all cursor-pointer ${
                                                selectedIcon === icon
                                                    ? 'bg-green-500 text-white'
                                                    : isDarkMode
                                                        ? 'bg-gray-700 hover:bg-gray-600'
                                                        : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Selección de color */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Select Color
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {availableColors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} transition-all cursor-pointer ${
                                                selectedColor === color
                                                    ? 'ring-2 ring-green-500 ring-offset-2'
                                                    : ''
                                            }`}
                                        />
                                    ))}
                                </div>
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
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition-all cursor-pointer"
                                >
                                    Add Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};