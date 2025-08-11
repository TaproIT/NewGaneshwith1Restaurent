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