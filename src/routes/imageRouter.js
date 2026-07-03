import express from "express";
import { verifyAccessToken } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import * as imageController from "../controllers/imageController.js";

const router = express.Router();

// "image" 필드의 단일 파일 업로드 (상품 이미지 3개 = 3번 호출)
router.post(
  "/upload",
  verifyAccessToken,
  upload.single("image"),
  imageController.uploadImage,
);

export default router;
