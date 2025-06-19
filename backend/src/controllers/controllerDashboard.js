import jwt from 'jsonwebtoken';


export const controllerDashboard = async (req, res) => {
    try {
        const token=req.cookies.authToken;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized access, please login"
            });
        }
        
        let decodedToken= jwt.verify(token, process.env.JWT_SECRET);
        
        return res.status(200).json({
            message: "Welcome to the dashboard",
            userID: decodedToken.userId,
            email: decodedToken.email,
            isAuthenticated: decodedToken.isAuthenticated
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}