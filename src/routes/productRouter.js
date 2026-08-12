import express from "express";
import * as productController from "../controllers/productController.js";
import { verifyAccessToken, optionalAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { CreateProduct, UpdateProduct } from "../structs/productStructs.js";
import * as commentController from "../controllers/commentController.js";
import { CreateComment } from "../structs/commentStructs.js";

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
  .get(optionalAuth, productController.getProduct) // 상품 상세는 비로그인도 조회 가능
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

router
  .route("/:id/comments")
  .get(commentController.getProductComments) // 댓글 목록은 비로그인도 조회 가능 (게시글과 동일)
  .post(
    verifyAccessToken,
    validateBody(CreateComment),
    commentController.createProductComment,
  );

export default router;
