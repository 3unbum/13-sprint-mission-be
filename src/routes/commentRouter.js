import express from "express";
import * as commentController from "../controllers/commentController.js";
import { verifyAccessToken } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { CreateComment } from "../structs/commentStructs.js";

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
