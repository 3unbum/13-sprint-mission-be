import * as commentService from "../services/commentService";
import asyncHandler from "../middlewares/asyncHandler";
import { BadRequestError } from "../types/errors";
import { getUserId } from "../middlewares/auth";

// id 값 검증 (라벨만 바꿔 상품/댓글 /cursor에 공용)
function parseId(value: string | string[] | undefined, label: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new BadRequestError(`올바르지 않은 ${label} 값이에요.`);
  }
  return id;
}

// 댓글 목록 조회 쿼리 스트링 타입 (전부 문자열)
interface CommentListQuery {
  limit?: string;
  cursor?: string | string[];
}

// GET /products/:id/comments
export const getProductComments = asyncHandler(async (req, res) => {
  const productId = parseId(req.params.id, "상품 id");
  const query = req.query as CommentListQuery;
  const limit = Math.min(Math.max(parseInt(query.limit ?? "") || 10, 1), 50);
  const cursor = query.cursor ? parseId(query.cursor, "cursor") : undefined;

  const result = await commentService.getProductComments(
    productId,
    req.auth?.userId ?? null,
    { cursor, limit },
  );
  res.json(result);
});

// POST /products/:id/comments
export const createProductComment = asyncHandler(async (req, res) => {
  const productId = parseId(req.params.id, "상품 id");
  const comment = await commentService.createProductComment(
    productId,
    getUserId(req),
    req.body.content,
  );
  res.status(201).json(comment);
});

// PATCH /comments/:id
export const updateComment = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "댓글 id");
  const comment = await commentService.updateComment(
    id,
    getUserId(req),
    req.body.content,
  );
  res.json(comment);
});

// DELETE /comments/:id
export const deleteComment = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "댓글 id");
  await commentService.deleteComment(id, getUserId(req));
  res.status(204).send();
});

// GET /articles/:id/comments (비로그인 공개)
export const getArticleComments = asyncHandler(async (req, res) => {
  const articleId = parseId(req.params.id, "게시글 id");
  const query = req.query as CommentListQuery;
  const limit = Math.min(Math.max(parseInt(query.limit ?? "") || 10, 1), 50);
  const cursor = query.cursor ? parseId(query.cursor, "cursor") : undefined;

  const result = await commentService.getArticleComments(articleId, {
    cursor,
    limit,
  });
  res.json(result);
});

// POST /articles/:id/comments
export const createArticleComment = asyncHandler(async (req, res) => {
  const articleId = parseId(req.params.id, "게시글 id");
  const comment = await commentService.createArticleComment(
    articleId,
    getUserId(req),
    req.body.content,
  );
  res.status(201).json(comment);
});
