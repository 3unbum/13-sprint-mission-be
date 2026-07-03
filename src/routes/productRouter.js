import express from "express";
import * as productController from "../controllers/productController.js";
import { verifyAccessToken } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { CreateProduct, UpdateProduct } from "../structs/productStructs.js";

const router = express.Router();

// 같은 경로의 get/post를 route()로 묶어 중복 제거
router
  .route("/")
  .get(productController.getProducts) // 목록은 비로그인도 조회 가능
  .post(
    verifyAccessToken,
    validateBody(CreateProduct),
    productController.createProduct,
  );

router
  .route("/:id")
  .get(verifyAccessToken, productController.getProduct)
  .patch(
    verifyAccessToken,
    validateBody(UpdateProduct),
    productController.updateProduct,
  )
  .delete(verifyAccessToken, productController.deleteProduct);

router
  .route("/:id/favorite")
  .post(verifyAccessToken, productController.addFavorite)
  .delete(verifyAccessToken, productController.removeFavorite);

export default router;
