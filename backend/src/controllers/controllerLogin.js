import User from '../models/user.js'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const loginController = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ 
                message: "Email not found" 
            });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: "Invalid password" 
            });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.cookie('authToken', token, {
            httpOnly: true,     
            sameSite: 'strict', 
            maxAge: 1 * 60 * 60 * 1000 
        });

        return res.status(200).json({ 
            message: "Login successful"
        });
    } catch (error) {
        console.error('Login error:', error); 
        return res.status(500).json({ 
            message: "Internal server error",
            error: error.message
        });
    }
};
