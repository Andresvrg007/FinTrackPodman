import { Link } from "react-router-dom"
import {useState, useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthHook";
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const Form = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); 
    const { user, loading } = useAuth();
    const navigate=useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard');
        }
    }, [user, loading, navigate]);
 
     if (loading) {
        
        return <div>Loading...</div>;
    }
   
    const handleSubmit = async (e) => {   
        e.preventDefault();
        console.log('Attempting login...', { email }); // Debug log
        
        try {
            const res = await fetch(`${API_URL}/api/`, {
                credentials: 'include',
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });
            
            console.log('Response status:', res.status); // Debug log
            
            if(!res.ok) {
                const errorData = await res.json();
                console.log('Error data:', errorData); // Debug log
                throw new Error(errorData.message);
            }
            
            console.log('Login successful'); // Debug log
            setEmail("");
            setPassword("");   
            navigate("/dashboard");
            Swal.fire({
                icon: "success",
                title: "Login successful!",
                text: "Welcome back!",
            });

        } catch (error) {
            console.log("Full error:", error); // Debug log
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.message || "Connection failed. Please check if the server is running.",
            });
        }
     } 
    
    return (
        <>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
                            Sign In
                    </h1>

                    <form className="space-y-4 sm:space-y-6" onSubmit={(e) => handleSubmit(e)}>
                            {/* Email Input */}
                            <input
                                type="email"
                                required
                                placeholder="Email"
                                className="w-full px-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            {/* Password Input */}
                            <input
                                type="password"
                                required
                                placeholder="Password"
                                className="w-full px-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium text-sm sm:text-base cursor-pointer"
                            >
                                Sign In
                            </button>

                    </form>

                    {/* Sign up link */}
                <p className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600">
                    Don't have an account?{' '}
                        <Link 
                            to='/register' 
                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all"
                        >
                            Sign Up
                        </Link>
                    </p>

                </div>
            </div>
        </>
    )
}