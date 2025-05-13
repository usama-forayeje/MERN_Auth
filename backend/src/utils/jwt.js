import jwt from "jsonwebtoken";

export const generateTokens = (user) => {
  // Ensure secrets are available
  if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("❌ JWT secrets are not defined in environment variables");
  }

  // Define token payload
  const payload = {
    _id: user._id,
    role: user.role,
  };

  // Generate Access Token
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "12h",
  });

  // Generate Refresh Token
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  });

  return { accessToken, refreshToken };
};
