import { useState } from 'react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const PDFGenerator = ({ isDarkMode }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePDF = async () => {
        try {
            setIsGenerating(true);
            
            Swal.fire({
                title: 'Generating PDF...',
                text: 'Please wait while we create your report',
                icon: 'info',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await fetch(`${API_URL}/api/generate-pdf`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `expense-report-${new Date().toISOString().split('T')[0]}.pdf`;
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                Swal.fire({
                    icon: 'success',
                    title: 'PDF Generated!',
                    text: 'Your expense report has been downloaded successfully.',
                    timer: 3000,
                    showConfirmButton: false
                });

            } else {
                throw new Error('Failed to generate PDF');
            }

        } catch (error) {
            console.error('Error generating PDF:', error);
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to generate PDF. Please try again.',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={`rounded-2xl shadow-xl p-6 border-l-4 border-pink-500 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
            <div className="text-center mb-8">
                <h2 className={`text-3xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                    📄 Generate PDF Report
                </h2>
                <p className={`text-lg ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                    Create a comprehensive report of your financial activities
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className={`p-4 rounded-xl ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                    <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">📊</span>
                        <h3 className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                            Financial Summary
                        </h3>
                    </div>
                    <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Complete overview of your income, expenses, and current balance
                    </p>
                </div>

                <div className={`p-4 rounded-xl ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                    <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">📋</span>
                        <h3 className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                            Recent Transactions
                        </h3>
                    </div>
                    <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Detailed list of your latest 10 transactions with categories
                    </p>
                </div>

                <div className={`p-4 rounded-xl ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                    <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">🎨</span>
                        <h3 className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                            Professional Design
                        </h3>
                    </div>
                    <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Beautiful, print-ready format with modern styling
                    </p>
                </div>

                <div className={`p-4 rounded-xl ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                    <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">📅</span>
                        <h3 className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                            Date Stamped
                        </h3>
                    </div>
                    <p className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Automatically includes generation date and user information
                    </p>
                </div>
            </div>

            <div className="text-center">
                <button
                    onClick={handleGeneratePDF}
                    disabled={isGenerating}
                    className={`px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg ${
                        isGenerating 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-pink-500 to-red-600 hover:shadow-xl'
                    } text-white flex items-center gap-3 mx-auto`}
                >
                    {isGenerating ? (
                        <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            Generating PDF...
                        </>
                    ) : (
                        <>
                            <span className="text-2xl">📄</span>
                            Generate PDF Report
                        </>
                    )}
                </button>
                
                <p className={`text-sm mt-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                    The PDF will be automatically downloaded to your device
                </p>
            </div>

            <div className={`mt-8 p-4 rounded-xl ${
                isDarkMode 
                    ? 'bg-blue-900 border border-blue-700' 
                    : 'bg-blue-50 border border-blue-200'
            }`}>
                <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                        <h4 className={`font-semibold mb-2 ${
                            isDarkMode ? 'text-blue-300' : 'text-blue-800'
                        }`}>
                            Tip
                        </h4>
                        <p className={`text-sm ${
                            isDarkMode ? 'text-blue-200' : 'text-blue-700'
                        }`}>
                            The PDF report includes your latest financial data. 
                            For the most accurate report, make sure all your transactions are up to date before generating.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};