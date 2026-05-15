import express from "express";
import {
  createArticle,
  getArticleList,
  getArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/article.controller.js";
import {
  createArticleComment,
  getArticleCommentList,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/", createArticle); // POST /articles
router.get("/", getArticleList); // GET /articles
router.get("/:id", getArticle); // GET /articles/:id
router.patch("/:id", updateArticle); // PATCH /articles/:id
router.delete("/:id", deleteArticle); //DELETE /articles/:id

router.post("/:articleId/comments", createArticleComment);
router.get("/:articleId/comments", getArticleCommentList);

export default router;
