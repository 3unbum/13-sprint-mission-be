import express from "express";
import * as articleController from "../controllers/articleController.js";
import * as commentController from "../controllers/commentController.js";
import { verifyAccessToken, optionalAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { CreateArticle, UpdateArticle } from "../structs/articleStructs.js";
import { CreateComment } from "../structs/commentStructs.js";

const router = express.Router();

router
  .route("/")
  .get(articleController.getArticles)
  .post(
    verifyAccessToken,
    validateBody(CreateArticle),
    articleController.createArticle,
  );

router
  .route("/:id")
  .get(optionalAuth, articleController.getArticle)
  .patch(
    verifyAccessToken,
    validateBody(UpdateArticle),
    articleController.updateArticle,
  )
  .delete(verifyAccessToken, articleController.deleteArticle);

router
  .route("/:id/like")
  .post(verifyAccessToken, articleController.addLike)
  .delete(verifyAccessToken, articleController.removeLike);

router
  .route("/:id/comments")
  .get(commentController.getArticleComments)
  .post(
    verifyAccessToken,
    validateBody(CreateComment),
    commentController.createArticleComment,
  );

export default router;
