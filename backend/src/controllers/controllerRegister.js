import User from '../models/user.js';
import bcrypt from 'bcrypt'; // ✅ CAMBIAR: de 'bcryptjs' a 'bcrypt'

export const register = async (req, res) => {
    try {
        // Validar que todos los campos estén presentes
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please provide a valid email address"
            });
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                message: "User with this email already exists"
            });
        }

        // Hash de la contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // ✅ CREAR USUARIO CON SOLO LOS CAMPOS DEL MODELO
        const newUser = new User({
            email: email.toLowerCase(),
            password: hashedPassword
        });

        // Guardar usuario en la base de datos
        const savedUser = await newUser.save();

        // Respuesta exitosa (sin enviar la contraseña)
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: savedUser._id,
                email: savedUser.email,
                createdAt: savedUser.createdAt
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Manejar errores específicos de MongoDB
        if (error.code === 11000) {
            return res.status(409).json({
                message: "User with this email already exists"
            });
        }

        return res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ✅ CAMBIAR NOMBRE DE FUNCIÓN PARA QUE COINCIDA CON ROUTES
export const registerController = register;