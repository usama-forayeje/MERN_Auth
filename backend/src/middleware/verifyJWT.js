import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-errors.js";
import asyncHandler from "../utils/async-handler.js";
import { User } from "../models/users.models.js";

// ✅ Middleware to verify JWT from cookie or Authorization header
const verifyJWT = asyncHandler(async (req, res, next) => {
  let token = null;
  let tokenType = null;

  // ✅ Detect token source and type
  if (req.cookies?.refreshToken) {
    token = req.cookies.refreshToken;
    tokenType = "refresh";
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
    tokenType = "access";
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
    tokenType = "access";
  }

  // ✅ No token provided
  if (!token) {
    throw new ApiError(401, "⛔ Unauthorized - Token not provided");
  }

  try {
    // ✅ Use proper secret based on token type
    const secret =
      tokenType === "refresh" ? process.env.REFRESH_TOKEN_SECRET : process.env.JWT_SECRET;

    // ✅ Verify and decode token
    const decoded = jwt.verify(token, secret);

    // ✅ Fetch user from DB
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new ApiError(401, "⛔ Unauthorized - User not found");
    }

    // ✅ Refresh token must match stored token
    if (tokenType === "refresh" && user.refreshToken !== token) {
      throw new ApiError(401, "⛔ Unauthorized - Invalid refresh token");
    }

    // ✅ Check for locked accounts
    if (user.isAccountLocked) {
      throw new ApiError(403, "🚫 Access denied - Account is locked");
    }

    // ✅ Attach user to request for downstream use
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ JWT verification error:", error.message);
    throw new ApiError(401, "⛔ Unauthorized - Invalid or expired token");
  }
});

export { verifyJWT };
