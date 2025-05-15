import { Router } from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
import {
  changePassword,
  forgotPassword,
  refreshToken,
  resetPassword,
  signIn,
  signOut,
  signUp,
  socialLogin,
  updateProfile,
  userProfile,
  verifyEmail,
} from "../controller/auth.controller.js";
import upload from "../middleware/multer.middleware.js";
import { limiter } from "../middleware/rateLimit.middleware.js";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "../validations/auth.validator.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post("/sign-up", validateRequest(signUpSchema), limiter, signUp);

router.post("/verify", verifyEmail);

router.post("/sign-in", limiter, validateRequest(signInSchema), signIn);

router.post("/sign-out", verifyJWT, signOut);

router.post("/forgot-password", limiter, validateRequest(forgotPasswordSchema), forgotPassword);

router.post(
  "/reset-password/:forgotPasswordToken",
  validateRequest(resetPasswordSchema),
  limiter,
  resetPassword
);

router.post("/refresh-token", refreshToken);

router.put("/change-password", verifyJWT, changePassword);

router.post("/social-login", socialLogin);

router.get("/profile", verifyJWT, userProfile);

router.patch("/profile-update", verifyJWT, upload.single("avatar"), updateProfile);

export default router;
