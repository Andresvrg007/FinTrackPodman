import { useState} from "react";
import Swal from 'sweetalert2'
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const FormRegister = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");   
    const [confirmPassword, setConfirmPassword] = useState("");
    let navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length <= 5 || confirmPassword.length <= 5 ){
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Password must be at least 6 characters long!",
            });
            return;
        };
        if(password !== confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Password are not the same!",
            });
            return;
        };
        const userData={
            email: email,
            password: password
        };

        try {
            let response = await fetch(`${API_URL}/api/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });
            let data=await response.json();
            if(!response.ok){
                throw new Error(data.message || "Failed to create user");
            }
            Swal.fire({
                icon: "success",
                title: "Fine",
                text: "User has been creating!",
            });
            setEmail("");
            setPassword("");    
            setConfirmPassword("");
            navigate("/dashboard");

        } catch (error) {
             Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `${error}`,
            });
            console.log("Error sending form:", error);
        }
    }
    
    return (
        <>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">   
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
                        Sign Up
                    </h1>

                    <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
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

                        {/* Confirm Password Input */}
                        <input
                            type="password"
                            required
                            placeholder="Confirm Password"
                            className="w-full px-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 sm:py-4 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium text-sm sm:text-base cursor-pointer"
                        >
                            Sign Up
                        </button>
                    </form>

                    {/* Sign in link */}
                    <p className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link 
                            to='/' 
                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all cursor-pointer"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </>
    )
}