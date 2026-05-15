import express from "express";
import {
  createProduct,
  getProductList,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import {
  createProductComment,
  getProductCommentList,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/", createProduct); // POST /products
router.get("/", getProductList); // GET /products
router.get("/:id", getProduct); // GET /products/:id
router.patch("/:id", updateProduct); // PATCH /products/:id
router.delete("/:id", deleteProduct); //DELETE /products/:id

router.post("/:productId/comments", createProductComment);
router.get("/:productId/comments", getProductCommentList);

export default router;
