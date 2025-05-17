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
  emailPasswordResetRequestContent,
  emailVerifyOtpMailGenContent,
  emailWelcomeMailGenContent,
  sendPasswordResetSuccessEmail,
} from "../mail/emailTemplates.js";
import { sendMail } from "../mail/email.service.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Auth system
const signUp = asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;

  // 🔍 Step 1: Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "A user already exists with this email address.");
  }

  // 🔐 Step 2: Generate OTP and expiry time
  const otp = generateOTP();
  const otpExpires = Date.now() + 24 * 60 * 60 * 1000;

  // 👤 Step 3: Create a new user
  const user = new User({
    email,
    name,
    password,
    role: UserRolesEnum.USER,
    otp,
    otpExpires,
  });

  await user.save();

  // 🔑 Step 4: Generate JWT tokens
  const refreshToken = user.generateRefreshToken();
  const accessToken = user.generateAccessToken();

  // 🍪 Step 5: Store refresh token in secure cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // 📧 Step 6: Send OTP verification email
  const mailContent = await emailVerifyOtpMailGenContent(user.name, user.otp);
  await sendMail({
    email: user.email,
    subject: "Verify your email address",
    mailgenContent: mailContent,
  });

  // 🔒 Step 7: Hide sensitive fields before sending user data
  const { password: _, otp: __, otpExpires: ___, ...userData } = user._doc;

  // ✅ Step 8: Send response with tokens
  return res.status(201).json(
    new ApiResponse(201, "User registered successfully", {
      user: userData,
      tokens: {
        accessToken,
        refreshToken,
      },
    })
  );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { code } = req.body;

  // 🛑 Step 1: Check if OTP code is provided
  if (!code) {
    return res.status(400).json(new ApiResponse(400, "Verification code is required"));
  }

  // 🔍 Step 2: Find user with valid OTP and unexpired
  const user = await User.findOne({
    otp: code,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json(new ApiResponse(400, "Invalid or expired verification code"));
  }

  // ✅ Step 3: Mark email as verified and clear OTP fields
  user.isEmailVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();

  // 📧 Step 4: Send welcome email after verification
  const mailContent = await emailWelcomeMailGenContent(user.email, user.name);
  await sendMail({
    email: user.email,
    subject: "Welcome to our platform!",
    mailgenContent: mailContent,
  });

  // 🎉 Step 5: Send success response
  return res.status(200).json(new ApiResponse(200, "Email verified successfully"));
});

const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 🧠 Step 1: Check user exists by email
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "❌ User not found with this email.");

  // 🔐 Step 2: Check if account is locked temporarily
  if (user.isAccountLocked && user.blockedUntil > Date.now()) {
    const remainingMinutes = Math.ceil((user.blockedUntil - Date.now()) / 60000);
    throw new ApiError(
      403,
      `🚫 Your account is temporarily locked. Try again after ${remainingMinutes} minute(s).`
    );
  }

  // 🔐 Step 3: Check if login allowed (based on failed attempts)
  if (!(await user.canLogin())) {
    throw new ApiError(403, "🚫 Account locked due to too many failed login attempts.");
  }

  // 🔑 Step 4: Verify password
  const isPasswordValid = await user.isPasswordMatch(password);
  if (!isPasswordValid) {
    user.loginAttempts += 1;

    // ❌ Step 4.1: Lock account after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.isAccountLocked = true;
      user.blockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lock
      await user.save();
      throw new ApiError(403, "🚫 Your account is locked for 15 minutes.");
    }
    await user.save();
    throw new ApiError(401, "❌ Invalid password.");
  }
  // 📧 Step 5: Check if email is verified
  if (!user.isEmailVerified) {
    throw new ApiError(401, "📧 Please verify your email before logging in.");
  }

  // ✅ Step 6: Reset lock-related values on successful login
  user.loginAttempts = 0;
  user.isAccountLocked = false;
  user.blockedUntil = undefined;

  // 🔐 Step 7: Generate access & refresh tokens
  const refreshToken = user.generateRefreshToken();
  const accessToken = user.generateAccessToken();

  // 🧠 Step 8: Parse browser/device/IP info
  const parser = new UAParser(req.headers["user-agent"]);
  const ua = parser.getResult();
  const ip =
    req.headers["x-forwarded-for"]?.split(",")?.[0]?.trim() ||
    req.socket?.remoteAddress ||
    "Unknown";

  // 📝 Step 9: Save login meta info
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

  // 🍪 Step 10: Set cookies securely
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // 🚀 Step 11: Respond with user info (excluding password)
  const { password: pwd, ...userWithoutPassword } = user._doc;

  return res.status(200).json(
    new ApiResponse(200, "✅ User signed in successfully", {
      user: userWithoutPassword,
      accessToken,
    })
  );
});

const signOut = asyncHandler(async (req, res) => {
  // 🍪 Step 1: Get refresh token from cookies
  const refreshToken = req.cookies?.refreshToken;

  // ✅ Step 2: If no refresh token, user is already signed out
  if (!refreshToken) {
    return res.status(200).json(new ApiResponse(200, "🔓 No active session. Already signed out."));
  }

  // 👤 Step 3: Find user by refresh token
  const user = await User.findOne({ refreshToken });

  if (user) {
    // 🧼 Step 4: Clear refreshToken from database
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
  }

  // 🍪 Step 5: Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/",
    expires: new Date(0),
  });

  // 🍪 Step 6: Clear access token cookie (if present)
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/",
    expires: new Date(0),
  });

  // 🟢 Step 7: Send success response
  return res.status(200).json(new ApiResponse(200, "✅ Signed out successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  // 🍪 Step 1: Get refreshToken from cookie
  const { refreshToken } = req.cookies;

  // ❌ Step 2: Token missing
  if (!refreshToken) {
    throw new ApiError(401, "🔒 Refresh token missing. Please log in again.");
  }

  let decoded;
  try {
    // 🔍 Step 3: Verify the refresh token
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    // ❌ Token expired or invalid
    throw new ApiError(403, "⛔ Invalid or expired refresh token.");
  }

  // 👤 Step 4: Find user by decoded ID
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(404, "❌ User not found.");
  }

  // 🔐 Step 5: Check if refreshToken matches DB token
  if (user.refreshToken !== refreshToken) {
    // Token mismatch
    throw new ApiError(403, "⛔ Refresh token mismatch.");
  }

  // ✅ Step 6: Generate new access token
  const accessToken = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });

  // 🚀 Step 7: Send response with new access token
  return res.status(200).json(new ApiResponse(200, "✅ Token refreshed", { accessToken }));
});

const socialLogin = asyncHandler(async (req, res) => {
  const { email, userName, profileImage, provider } = req.body;

  // Step 1: Validate required fields
  if (!email || !userName || !provider) {
    throw new ApiError(400, "⚠️ Missing required social login fields.");
  }

  // Step 2: Find or create user
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

  // Step 3: Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user);

  // Step 4: Update user info
  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Step 5: Set refresh token cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 🔐 Use true in production
    sameSite: "Strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // Step 6: Return user info + access token
  return res.status(200).json(
    new ApiResponse(200, "✅ Logged in via social provider successfully.", {
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

const googleOAuthLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ApiError(400, "❌ Missing Google ID token.");
  }

  // Step 1: Verify the Google token
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, picture, sub } = payload;

  if (!email || !sub) {
    throw new ApiError(400, "❌ Invalid Google token payload.");
  }

  // Step 2: Find or create the user
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      name,
      profileImage: picture || "",
      provider: "google",
      isEmailVerified: true,
    });
  }

  // Step 3: Generate access and refresh tokens
  const refreshToken = user.generateRefreshToken();
  const accessToken = user.generateAccessToken();

  // Step 4: Save refreshToken to DB
  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Step 5: Set HTTP-Only Refresh Token Cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // Step 6: Respond with user info and accessToken
  return res.status(200).json(
    new ApiResponse(200, "✅ Google login successful.", {
      _id: user._id,
      name: user.name,
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

  // 🔍 Step 1: Check user existence
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "❌ User not found with this email.");
  if (!user.isEmailVerified) throw new ApiError(401, "📧 Email is not verified.");

  // 🔄 Step 2: Clear any previous reset token
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;

  // 🔐 Step 3: Generate secure temporary token
  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordTokenExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  // 🔗 Step 4: Build reset link using CLIENT_URL
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${unHashedToken}`;

  // 🧪 Step 5: Validate client URL
  if (!resetLink.startsWith("http")) {
    throw new ApiError(500, "❌ Invalid client URL. Check CLIENT_URL in .env.");
  }

  try {
    // ✉️ Step 6: Prepare email content using Mailgen
    const mailContent = await emailPasswordResetRequestContent(
      user.email,
      resetLink,
      user.userName || user.fullName || "User"
    );

    // 📤 Step 7: Send password reset email
    await sendMail({
      email: user.email,
      subject: "🔐 Password Reset Request",
      mailgenContent: mailContent,
    });

    // ✅ Step 8: Return success response
    return res.status(200).json(new ApiResponse(200, "✅ Password reset link sent to email."));
  } catch (error) {
    // 🔁 Step 9: Rollback token if email fails
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    throw new ApiError(500, "❌ Failed to send email. Please try again.");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { forgotPasswordToken } = req.params;

  // 🚫 Step 1: Validate input
  if (!forgotPasswordToken || !password) {
    throw new ApiError(400, "⛔ Reset token and new password are required.");
  }

  // 🔐 Step 2: Hash the incoming token (same as stored in DB)
  const hashedToken = crypto.createHash("sha256").update(forgotPasswordToken).digest("hex");

  // 🔍 Step 3: Find valid user by hashed token and check expiry
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "⛔ Invalid or expired reset token.");
  }

  // 🔑 Step 4: Set new password
  user.password = password;

  // ♻️ Step 5: Clear the reset token and expiry
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;

  // 💾 Step 6: Save updated user securely
  await user.save({ validateBeforeSave: false });

  // ✉️ Step 7: Send confirmation email (optional but pro touch)
  try {
    const mailContent = await sendPasswordResetSuccessEmail(user);
    await sendMail({
      email: user.email,
      subject: "✅ Your Password Was Successfully Reset",
      mailgenContent: mailContent,
    });
  } catch (error) {
    console.error("📧 Failed to send confirmation email:", error.message);
    // Do not block response if email fails
  }

  // ✅ Step 8: Respond to client
  return res.status(200).json(new ApiResponse(200, "✅ Password has been reset successfully."));
});

const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;

  // 🔍 Step 1: Fetch user with password field
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "❌ User not found.");
  }

  // 🔐 Step 2: Validate old password
  const isOldPasswordCorrect = await user.isPasswordMatch(oldPassword);
  if (!isOldPasswordCorrect) {
    throw new ApiError(401, "⛔ Incorrect old password.");
  }

  // 🚫 Step 3: Prevent using the same password
  const isSamePassword = await user.isPasswordMatch(newPassword);
  if (isSamePassword) {
    throw new ApiError(400, "❌ New password must be different from the old password.");
  }

  // 🔄 Step 4: Update password and mark change time
  user.password = newPassword;
  user.passwordChangedAt = new Date();

  // 🚪 Optional: Invalidate all existing sessions/tokens
  user.refreshToken = null;
  await user.save({ validateBeforeSave: true });

  // 📢 Step 5: Respond to client
  return res
    .status(200)
    .json(new ApiResponse(200, "🔐 Password changed successfully. Please log in again."));
});

const userProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new ApiError(404, "❌ User not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "✅ User profile retrieved successfully.", user));
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name } = req.body;

  // Validate input
  if (!userName && !req.file) {
    throw new ApiError(400, "Nothing to update");
  }

  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update username if provided
  if (name) user.name = name;

  // File validation for avatar
  if (req.file) {
    const file = req.file;

    // Check for valid file type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiError(400, "Invalid file type. Only JPEG, PNG, and GIF are allowed.");
    }

    // Check for file size limit
    if (file.size > maxFileSize) {
      throw new ApiError(400, "File size exceeds the 5MB limit.");
    }

    // Upload to Cloudinary and get the URL
    const uploadFromBuffer = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          {
            folder: "avatars",
            width: 150,
            height: 150,
            crop: "fill",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
    };

    const result = await uploadFromBuffer();

    // If the user already has an avatar, delete the old one from Cloudinary
    if (user.avatar?.publicId) {
      await cloudinary.v2.uploader.destroy(user.avatar.publicId);
    }

    // Update the avatar URL and publicId
    user.avatar = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  // Save the updated user profile
  await user.save({ validateBeforeSave: true });

  return res.status(200).json(
    new ApiResponse(200, "✅ Profile updated successfully.", {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  );
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
  updateProfile,
  userProfile,
  googleOAuthLogin,
};
