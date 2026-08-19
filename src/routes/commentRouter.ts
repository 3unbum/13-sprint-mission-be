import express from "express";
import * as commentController from "../controllers/commentController";
import { verifyAccessToken } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { CreateComment } from "../structs/commentStructs";

const router = express.Router();

router
  .route("/:id")
  .patch(
    verifyAccessToken,
    validateBody(CreateComment),
    commentController.updateComment,
  )
  .delete(verifyAccessToken, commentController.deleteComment);

export default router;
