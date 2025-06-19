import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthHook";
import { Categories } from "../components/Categories";
import { Transactions } from "../components/Transactions";
import { PDFGenerator } from "../components/PDFGenerator";
import { DashboardHome } from "../components/DashboardHome";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const Dashboard = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [currentView, setCurrentView] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    // Cargar tema del localStorage al iniciar
    useEffect(() => {
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme === 'true') {
            setIsDarkMode(true);
        }
    }, []);

    // Guardar tema en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('darkMode', isDarkMode.toString());
    }, [isDarkMode]);

    const handleLogout = async () => {
        try {
            let res = await fetch(`${API_URL}/api/dashboard/deleteCookie`, {
                credentials: 'include',
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                navigate('/');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    const menuItems = [
        { id: 'home', name: 'Dashboard', icon: '📊', color: 'from-blue-500 to-purple-600' },
        { id: 'categories', name: 'Categories', icon: '📂', color: 'from-green-500 to-teal-600' },
        { id: 'transactions', name: 'Transactions', icon: '💰', color: 'from-yellow-500 to-orange-600' },
        { id: 'pdf', name: 'Generate PDF', icon: '📄', color: 'from-pink-500 to-red-600' }
    ];

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
            {/* Header dinámico */}
            <header className={`shadow-xl border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Left side - Mobile menu button + Logo */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className={`md:hidden p-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 active:scale-95 cursor-pointer ${
                                    isDarkMode 
                                        ? 'text-gray-300 hover:bg-gray-700 focus:ring-blue-400' 
                                        : 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500'
                                }`}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                                    isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                                }`}>
                                    <span className={`text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>💰</span>
                                </div>
                                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    ExpenseApp
                                </h1>
                            </div>
                        </div>

                        {/* Right side - Theme toggle + Welcome + Logout */}
                        <div className="flex items-center space-x-3">
                            {/* Theme toggle */}
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`p-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-xl active:scale-95 cursor-pointer ${
                                    isDarkMode 
                                        ? 'text-gray-300 hover:bg-gray-700 focus:ring-blue-400' 
                                        : 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500'
                                }`}
                                title={isDarkMode ? "Modo claro" : "Modo oscuro"}
                            >
                                {isDarkMode ? '☀️' : '🌙'}
                            </button>

                            {/* Welcome message */}
                            <span className={`hidden sm:block text-sm font-medium px-3 py-1 rounded-full ${
                                isDarkMode 
                                    ? 'text-gray-300 bg-gray-700' 
                                    : 'text-gray-600 bg-gray-100'
                            }`}>
                                ¡WELCOMEBACK!
                            </span>

                            {/* Logout button */}
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200 text-sm font-medium active:scale-95 shadow-lg cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className={`hidden md:block w-64 shadow-xl border-r min-h-screen ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                    <div className="p-6">
                        <h2 className={`text-lg font-semibold mb-6 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                            Navegation
                        </h2>
                        <nav className="space-y-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentView(item.id)}
                                    className={`group w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer ${
                                        currentView === item.id
                                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                                            : isDarkMode
                                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <span className="text-2xl mr-4">{item.icon}</span>
                                    <span className="font-medium">{item.name}</span>
                                    {currentView === item.id && (
                                        <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm cursor-pointer" 
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div className={`fixed inset-y-0 left-0 w-80 shadow-2xl transform transition-transform duration-300 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`} onClick={(e) => e.stopPropagation()}>
                            {/* Header del menú móvil */}
                            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                                        <span className="text-white text-xl">💰</span>
                                    </div>
                                    <h2 className="text-lg font-semibold text-white">Menu</h2>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-xl text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 cursor-pointer"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <nav className="p-6 space-y-3">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setCurrentView(item.id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`group w-full flex items-center px-4 py-4 text-left rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer ${
                                            currentView === item.id
                                                ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                                                : isDarkMode
                                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <span className="text-2xl mr-4">{item.icon}</span>
                                        <span className="font-medium text-lg">{item.name}</span>
                                        {currentView === item.id && (
                                            <div className="ml-auto w-3 h-3 bg-white rounded-full"></div>
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className={`flex-1 p-4 sm:p-6 lg:p-8 min-h-screen ${
                    isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
                }`}>
                    <div className="max-w-7xl mx-auto">
                        {currentView === 'home' && (
                            <DashboardHome isDarkMode={isDarkMode} setCurrentView={setCurrentView} />
                        )}
                        
                        {currentView === 'categories' && (
                           <Categories isDarkMode={isDarkMode}/>
                                    
                        )}

                        {currentView === 'transactions' && (
                            <Transactions isDarkMode={isDarkMode}/>
                        )}

                        {currentView === 'pdf' && (
                            <PDFGenerator isDarkMode={isDarkMode}/>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}