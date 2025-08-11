import bcrypt from 'bcrypt';

const saltRounds = process.env.SALT || 10;

// Hash a user password before storing it.
export const hashPassword = async (password) => {
  if (!password && password !== 0) {
    throw new Error("Password is required for hashing.");
  }
  return await bcrypt.hash(String(password), saltRounds);
};


// Hash a refresh token before storing it in DB.
export const hashRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required for hashing.");
  }
  return await bcrypt.hash(refreshToken, saltRounds);
};
