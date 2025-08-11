import jwt from 'jsonwebtoken';

// Generate a short-lived access token for authentication.
export const generateAccessToken = (userId)=>{
    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error(
        "ACCESS_TOKEN_SECRET is not defined in environment variables."
      );
    }
    return jwt.sign({userId},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"24h"});
}


// Generate a long-lived refresh token for session persistence.
export const generateRefreshToken = (userId)=>{
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error(
        "REFRESH_TOKEN_SECRET is not defined in environment variables."
      );
    }
    return jwt.sign({userId},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"30 days"});
}