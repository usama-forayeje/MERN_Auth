import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ApiError } from "../utils/api-errors.js";
import asyncHandler from "../utils/async-handler.js";
import { User } from "../models/users.models.js";

dotenv.config();

const verifyJWT = asyncHandler(async (req, res, next) => {
  let token;

  // ✅ Get token from cookies or Authorization header
  if (req.cookies?.refreshToken) {
    token = req.cookies.refreshToken;
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json(new ApiError(401, "Token not provided"));
  }

  try {
    // ✅ Check if it's a refreshToken or accessToken
    const isRefreshToken = req.cookies?.refreshToken === token;
    const secret = isRefreshToken ? process.env.REFRESH_TOKEN_SECRET : process.env.JWT_SECRET;

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded._id);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // ✅ Additional checks for refreshToken
    if (isRefreshToken && user.refreshToken !== token) {
      throw new ApiError(401, "Refresh token is invalid");
    }

    if (user.isAccountLocked) {
      throw new ApiError(403, "Account is locked");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ JWT verification failed:", error);
    return next(new ApiError(401, "⛔ Unauthorized - Invalid or expired token"));
  }
});
export { verifyJWT };
