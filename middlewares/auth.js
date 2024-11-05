// auth.js
import { expressjwt } from "express-jwt";
import { UserModel } from "../models/user.js";
import { permissions } from "../utils/rbac.js";

// Middleware to check if the user is authenticated
export const isAuthenticated = expressjwt({
    secret: process.env.JWT_PRIVATE_KEY,
    algorithms: ["HS256"],
    requestProperty: 'auth' // Attaches the decoded token to req.auth
});

// Middleware to check if the user has permission to perform a specific action
export const hasPermission = (action) => {
    return async (req, res, next) => {
        try {
            // Find the user by their ID from the database
            const user = await UserModel.findById(req.auth.id);
            
            // Check if the user's role has the required permissions
            const permission = permissions.find(value => value.role === user.role);
            if (!permission) {
                return res.status(403).json('No permission found!');
            }

            // Check if the permission actions include the requested action
            if (permission.actions.includes(action)) {
                next(); // User has permission, proceed to the next middleware
            } else {
                res.status(403).json('Action not allowed');
            }
        } catch (error) {
            next(error); 
        }
    };
};
