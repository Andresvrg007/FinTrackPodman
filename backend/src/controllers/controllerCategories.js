import Category from '../models/category.js';
import jwt from 'jsonwebtoken';

// Obtener todas las categorías del usuario
export const getCategories = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        const categories = await Category.find({ userId });

        return res.status(200).json({
            message: "Categories retrieved successfully",
            categories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// Crear nueva categoría
export const createCategory = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        const { name, type, icon, color } = req.body;

        const newCategory = new Category({
            name,
            type,
            icon,
            color,
            userId
        });

        await newCategory.save();

        return res.status(201).json({
            message: "Category created successfully",
            category: newCategory
        });

    } catch (error) {
        console.error('Create category error:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

// Eliminar categoría
export const deleteCategory = async (req, res) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;
        const { categoryId } = req.params;

        const category = await Category.findOneAndDelete({ 
            _id: categoryId, 
            userId 
        });

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        return res.status(200).json({
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error('Delete category error:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};