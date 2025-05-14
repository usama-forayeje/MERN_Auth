import { UserRolesEnum } from "../constants/roles.js";
import { User } from "../models/users.models.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import { generateTokens } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ApiError } from "../utils/api-errors.js";
import { UAParser } from "ua-parser-js";
import { generateOTP } from "../constants/generateOTP.js";
import { logger } from "../utils/logger.js";
import {
  sendPasswordResetRequestEmail,
  sendPasswordResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mail/email.js";

// Auth system
const signUp = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists with this email.");
  }

  const otp = generateOTP();

  const user = new User({
    email,
    userName,
    password,
    role: UserRolesEnum.USER,
    otp,
    otpExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  await user.save();

  //  Generate tokens
  const refreshToken = user.generateRefreshToken();
  const accessToken = user.generateAccessToken();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  await sendVerificationEmail(user.email, otp, user.userName);

  const { password: userPassword, ...userWithoutPassword } = user._doc;

  return res.status(201).json(
    new ApiResponse(201, "User created successfully", {
      ...userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken,
      },
    })
  );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json(new ApiResponse(400, "Verification code is required"));
  }

  const user = await User.findOne({
    otp: code,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json(new ApiResponse(400, "Invalid or expired verification code"));
  }

  user.isEmailVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  await sendWelcomeEmail(user.email, user.userName);

  return res.status(200).json(new ApiResponse(200, "Email verified successfully"));
});

const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "❌ User not found with this email.");

  //  Check if account is temporarily locked
  if (user.isAccountLocked && user.blockedUntil > Date.now()) {
    const remainingMinutes = Math.ceil((user.blockedUntil - Date.now()) / 60000);
    throw new ApiError(
      403,
      `🚫 Your account is temporarily locked. Try again after ${remainingMinutes} minute(s).`
    );
  }

  // Check if login is allowed
  if (!(await user.canLogin())) {
    throw new ApiError(403, "🚫 Account locked due to too many failed login attempts.");
  }

  //  Validate password
  const isPasswordValid = await user.isPasswordMatch(password);
  if (!isPasswordValid) {
    user.loginAttempts += 1;

    // Lock account after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.isAccountLocked = true;
      user.blockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      await user.save();
      throw new ApiError(403, "🚫 Your account is locked for 15 minutes.");
    }

    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, "❌ Incorrect password.");
  }

  //  Email verification check
  if (!user.isEmailVerified) {
    throw new ApiError(401, "📧 Please verify your email before logging in.");
  }

  //  Reset login attempt on success
  user.loginAttempts = 0;
  user.isAccountLocked = false;
  user.blockedUntil = undefined;

  //  Generate tokens
  const refreshToken = user.generateRefreshToken();
  const accessToken = user.generateAccessToken();

  //  Extract login meta (IP, device, browser)
  const parser = new UAParser(req.headers["user-agent"]);
  const ua = parser.getResult();
  const ip =
    req.headers["x-forwarded-for"]?.split(",")?.[0]?.trim() ||
    req.socket?.remoteAddress ||
    "Unknown";

  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  user.lastLoginMeta = {
    ip,
    userAgent: req.headers["user-agent"],
    browser: `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`,
    os: `${ua.os.name || "Unknown"} ${ua.os.version || ""}`,
    device: ua.device?.type || "Desktop",
  };

  await user.save({ validateBeforeSave: false });

  //  Set refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  //  Return success response
  return res.status(200).json(
    new ApiResponse(200, "✅ User signed in successfully", {
      user: {
        ...user._doc,
        password: undefined,
      },
      accessToken,
    })
  );
});

const signOut = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(200).json(new ApiResponse(200, "🔓 No active session. Already signed out."));
  }

  const user = await User.findOne({ refreshToken });
  if (user) {
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/",
    expires: new Date(0),
  });

  return res.status(200).json(new ApiResponse(200, "✅ Signed out successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  logger.info("Refresh token from cookie:", refreshToken);
  if (!refreshToken) {
    throw new ApiError(401, "🔒 Refresh token missing. Please log in again.");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log("Decoded:", decoded);
  } catch (err) {
    console.log("JWT Error:", err.message);
    throw new ApiError(403, "⛔ Invalid or expired refresh token.");
  }

  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(404, "❌ User not found.");
  }

  // Check if refreshToken matches
  if (user.refreshToken !== refreshToken) {
    logger.error(
      "Token mismatch: user.refreshToken:",
      user.refreshToken,
      "refreshToken from cookie:",
      refreshToken
    ); // Log token mismatch
    throw new ApiError(403, "⛔ Refresh token mismatch.");
  }

  const accessToken = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });

  return res.status(200).json(new ApiResponse(200, "✅ Token refreshed", { accessToken }));
});

const socialLogin = asyncHandler(async (req, res) => {
  const { email, userName, profileImage, provider } = req.body;

  if (!email || !userName || !provider) {
    throw new ApiError(400, "Missing required social login fields");
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      userName,
      profileImage: profileImage || "",
      provider,
      isEmailVerified: true,
    });
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // 🔐 production e true koro (HTTPS only)
    sameSite: "Strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return res.status(200).json(
    new ApiResponse(200, "User logged in via social provider successfully", {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      tokens: {
        accessToken,
        refreshToken,
      },
    })
  );
});

// password  system
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found with this email.");
  if (!user.isEmailVerified) throw new ApiError(401, "Email is not verified.");

  // ✅ Clear previous tokens
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordTokenExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${unHashedToken}`;

  // ✅ Validate client URL
  if (!resetLink.startsWith("http")) {
    throw new ApiError(500, "Invalid client URL. Check CLIENT_URL in env.");
  }

  try {
    await sendPasswordResetRequestEmail(
      user.email,
      resetLink,
      user.userName || user.fullName || "User"
    );

    return res.status(200).json(new ApiResponse(200, "Password reset link sent to email."));
  } catch (error) {
    // ✅ Rollback token if email fails
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    throw new ApiError(500, "Failed to send email. Please try again.");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { forgotPasswordToken } = req.params;

  if (!forgotPasswordToken || !password) {
    throw new ApiError(400, "Reset token and new password are required.");
  }

  const hashedToken = crypto.createHash("sha256").update(forgotPasswordToken).digest("hex");

  // 🔎 Find user with valid token
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "⛔ Invalid or expired reset token.");
  }

  // 🔑 Hash the new password
  user.password = password;

  // 🔄 Clear reset token & expiry
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;

  // 💾 Save updated user without extra validations
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetSuccessEmail(user);

  return res.status(200).json(new ApiResponse(200, "✅ Password has been reset successfully."));
});

const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(404, "❌ User not found.");
  }

  const isOldPasswordCorrect = await user.isPasswordMatch(oldPassword);
  if (!isOldPasswordCorrect) {
    throw new ApiError(401, "⛔ Old password is incorrect.");
  }

  const isSamePassword = await user.isPasswordMatch(newPassword);
  if (isSamePassword) {
    throw new ApiError(400, "❌ New password are same old password.");
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "🔐 Password changed successfully. Please login again."));
});

export {
  signUp,
  signIn,
  signOut,
  forgotPassword,
  resetPassword,
  verifyEmail,
  changePassword,
  refreshToken,
  socialLogin,
};
