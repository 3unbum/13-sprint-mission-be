import express from "express";
import {
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.patch("/:id", updateComment); // PATCH /comments/:id
router.delete("/:id", deleteComment); // DELETE /comments/:id

export default router;
