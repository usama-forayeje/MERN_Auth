import { Router } from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
import upload from "../middleware/multer.middleware.js";
import { updateProfile, userProfile } from "../controller/user.controller.js";

const router = Router();

router.get("/profile", verifyJWT, userProfile);

router.patch("/profile-update", verifyJWT, upload.single("avatar"), updateProfile);

export default router;
