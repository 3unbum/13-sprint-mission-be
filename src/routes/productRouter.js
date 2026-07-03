import express from "express";
import * as productController from "../controllers/productController.js";
import { verifyAccessToken } from "../middlewares/auth.js";

const router = express.Router();

// 같은 경로의 get/post를 route()로 묶어 중복 제거
router
  .route("/")
  .get(productController.getProducts) // 목록은 비로그인도 조회 가능
  .post(verifyAccessToken, productController.createProduct);

router
  .route("/:id")
  .get(verifyAccessToken, productController.getProduct)
  .patch(verifyAccessToken, productController.updateProduct)
  .delete(verifyAccessToken, productController.deleteProduct);

export default router;
