import express from "express";
import * as authController from "../controllers/authController";

const router = express.Router();

router.post("/signUp", authController.signUp);
router.post("/signIn", authController.signIn);

export default router;
