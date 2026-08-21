import * as articleService from "../services/articleService";
import asyncHandler from "../middlewares/asyncHandler";
import { BadRequestError } from "../types/errors";
import { getUserId } from "../middlewares/auth";

function parseId(params: { id?: string }): number {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new BadRequestError("올바르지 않은 게시글 id예요.");
  }
  return id;
}

interface ArticleListQuery {
  page?: string;
  pageSize?: string;
  orderBy?: string;
  keyword?: string;
}

// GET /articles (비로그인 공개)
export const getArticles = asyncHandler(async (req, res) => {
  const query = req.query as ArticleListQuery;
  const page = Math.max(parseInt(query.page ?? "") || 1, 1);
  const pageSize = Math.min(
    Math.max(parseInt(query.pageSize ?? "") || 10, 1),
    100,
  );
  const orderBy = ["recent", "like"].includes(query.orderBy ?? "")
    ? query.orderBy
    : "recent";
  const keyword = (query.keyword ?? "").trim().slice(0, 100);

  const result = await articleService.getArticles({
    page,
    pageSize,
    orderBy,
    keyword,
  });
  res.json(result);
});

// GET /articles/:id (optionalAuth: 비로그인도 조회, 로그인 시 isLiked 반영)
export const getArticle = asyncHandler(async (req, res) => {
  const id = parseId(req.params);
  const article = await articleService.getArticle(id, req.auth?.userId ?? null);
  res.json(article);
});

// POST /articles
export const createArticle = asyncHandler(async (req, res) => {
  const article = await articleService.createArticle(
    getUserId(req),
    req.body,
  );
  res.status(201).json(article);
});

// PATCH /articles/:id
export const updateArticle = asyncHandler(async (req, res) => {
  const id = parseId(req.params);
  const article = await articleService.updateArticle(
    id,
    getUserId(req),
    req.body,
  );
  res.json(article);
});

// DELETE /articles/:id
export const deleteArticle = asyncHandler(async (req, res) => {
  const id = parseId(req.params);
  await articleService.deleteArticle(id, getUserId(req));
  res.status(204).send();
});

// POST /articles/:id/like
export const addLike = asyncHandler(async (req, res) => {
  const id = parseId(req.params);
  const article = await articleService.addLike(id, getUserId(req));
  res.status(201).json(article);
});

// DELETE /articles/:id/like
export const removeLike = asyncHandler(async (req, res) => {
  const id = parseId(req.params);
  const article = await articleService.removeLike(id, getUserId(req));
  res.json(article);
});
