import jwt from "jsonwebtoken";
import { ApiError } from "../utils/api-errors.js";
import asyncHandler from "../utils/async-handler.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  console.log("✅ Received Token:", token); // Debug this
  if (!token) {
    return res.status(401).json(new ApiError(401, "Token not provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ JWT verification failed:", error);  // Logs entire error object
    return next(new ApiError(401, "⛔ Unauthorized - Invalid or expired token", error));
  }
  
});

export { verifyJWT };


