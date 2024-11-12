import jwt from 'jsonwebtoken'

import { expressjwt } from "express-jwt";
import { UserModel } from "../models/user.js";
import { permissions } from "../utils/rbac.js";


export const isAuthenticated = expressjwt({
    secret: process.env.JWT_PRIVATE_KEY,
    algorithms: ["HS256"],
    requestProperty: 'auth' 
});


export const hasPermission = (action) => {
    return async (req, res, next) => {
        try {
           
            const user = await UserModel.findById(req.auth.id);
            const permission = permissions.find(value => value.role === user.role);
            if (!permission) {
                return res.status(403).json('No permission found!');
            }
            if (permission.actions.includes(action)) {
                next(); 
            } else {
                res.status(403).json('Action not allowed');
            }
        } catch (error) {
            next(error);
        }
    };
};



// Middleware function to verify the JWT
export const verifyToken = (req, res, next) => {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // The token should be in the format "Bearer <token>"
    
    if (!token) {
        return res.status(403).json({ message: 'Access denied. Invalid token format.' });
    }

    try {
        // Verify the token using the secret key from the .env file
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the decoded user information to the request object
        req.user = decoded;
        
        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};