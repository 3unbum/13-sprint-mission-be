import express from "express";
import * as userController from "../controllers/userController.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

// GET /users/me - 토큰 검증 후 컨트롤러 실행
router.get("/me", verifyAccessToken, userController.getMe);

export default router;
