import jwt from 'jsonwebtoken';
import BlackListToken from '../models/black-list-token-model.js';

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


/**
 * Verifies a JWT token and returns the decoded payload.
 * Throws an error if the token is invalid or expired.
 */
export const verifyEncodedToken = (token, secret) => {
    try {

       const decodedToken = jwt.verify(token, secret);
       return decodedToken;

    } catch (error) {

        if (error instanceof jwt.TokenExpiredError) {
            return sendErrorResponse(res, 401, "Access Token expired.", error);
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return sendErrorResponse(res, 401, "Invalid token.", error);
        }

        return sendErrorResponse(res, 500, "Internal Server Error", error);
    }
};


/**
 * Blacklists a given JWT by storing it with its expiration date.
 * Prevents reuse of revoked tokens.
 */
export const blacklistToken = async (token) => {
  try {
    // Verify and decode the token to extract expiry time
    const decodedToken = verifyEncodedToken(token, process.env.ACCESS_TOKEN_SECRET);
    const tokenExpiryDate = new Date(decodedToken.exp * 1000); // Convert seconds → ms

    // Check if the token already exists in the blacklist
    const tokenExists = await BlackListToken.findOne({ token }).lean();
    if (tokenExists) return; // Token already blacklisted

    // Store token in blacklist with expiration date
    await BlackListToken.create({
      token,
      expireAt: tokenExpiryDate,
    });

  } catch (error) {
    // Log errors without crashing the server
    console.error("Failed to blacklist token:", error.message);
  }
};
