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
  verifyEmail,
} from "../controller/auth.controller.js";
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

router.get("/verify", verifyEmail);

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
export default router;
