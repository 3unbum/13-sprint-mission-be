import { Request } from "express";
import * as productService from "../services/productService";
import asyncHandler from "../middlewares/asyncHandler";
import { BadRequestError } from "../types/errors";

// :id 파라미터 검증 (숫자가 아니면 400)
function parseId(params: { id?: string }): number {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new BadRequestError("올바르지 않은 상품 id예요.");
  }
  return id;
}

// 목록 조회 쿼리 스트링 타입 (전부 문자열로 들어옴)
interface ProductListQuery {
  page?: string;
  pageSize?: string;
  orderBy?: string;
  keyword?: string;
}

// GET /products - 쿼리 검증•클램프는 컨트롤러 담당
export const getProducts = asyncHandler(async (req, res) => {
  const query = req.query as ProductListQuery;
  const page = Math.max(parseInt(query.page ?? "") || 1, 1);
  const pageSize = Math.min(
    Math.max(parseInt(query.pageSize ?? "") || 10, 1),
    100,
  );
  const orderBy = ["recent", "favorite"].includes(query.orderBy ?? "")
    ? query.orderBy
    : "recent";
  const keyword = (query.keyword ?? "").trim().slice(0, 100);

  const result = await productService.getProducts({
    page,
    pageSize,
    orderBy,
    keyword,
  });
  res.json(result);
});

// GET /products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const id = parseId(req.params);
  const product = await productService.getProduct(id, req.auth?.userId ?? null);
  res.json(product);
});

// POST /products
export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(
    req.auth!.userId,
    req.body,
  );
  res.status(201).json(product);
});

// PATCH /products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const id = parseId(req.params);
  const product = await productService.updateProduct(
    id,
    req.auth!.userId,
    req.body,
  );
  res.json(product);
});

// DELETE /products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const id = parseId(req.params);
  await productService.deleteProduct(id, req.auth!.userId);
  res.status(204).send();
});

// POST /products/:id/favorite
export const addFavorite = asyncHandler(async (req, res) => {
  const id = parseId(req.params);
  const product = await productService.addFavorite(id, req.auth!.userId);
  res.status(201).json(product);
});

// DELETE /products/:id/favorite
export const removeFavorite = asyncHandler(async (req, res) => {
  const id = parseId(req.params);
  const product = await productService.removeFavorite(id, req.auth!.userId);
  res.json(product);
});
