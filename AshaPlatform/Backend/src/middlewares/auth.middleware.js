import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'

export const verifyJWT=asyncHandler(async(req,res,next)=>{


        req.user = {
                id: '507f1f77bcf86cd799439011', // Valid ObjectId format
                _id: '507f1f77bcf86cd799439011',
                name: 'Demo User',
                email: 'demo@example.com'
              };
    
        next();
   
});


export const optionalJWT = asyncHandler(async (req, res, next) => {
try {
        // Extract token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        // If no token is provided, continue without authentication
        if (!token) {
        return next();
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Find the user
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
        if (!user) {
        // If user not found, continue without authentication
        return next();
        }

        // Set the user in the request object
        req.user = user;
        
        // Continue to the next middleware
        next();
} catch (error) {
        // For any verification errors, continue without authentication
        return next();
}
});