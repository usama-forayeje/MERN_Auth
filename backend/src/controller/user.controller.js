import { User } from "../models/users.models.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const maxFileSize = 5 * 1024 * 1024; // 5MB

// User system
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

export { userProfile, updateProfile };
