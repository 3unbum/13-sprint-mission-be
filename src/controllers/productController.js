import * as productService from "../services/productService.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// :id 파라미터 검증 (숫자가 아니면 400)
function parseId(params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    const error = new Error("올바르지 않은 상품 id예요.");
    error.status = 400;
    throw error;
  }
  return id;
}

// GET /products - 쿼리 검증•클램프는 컨트롤러 담당
export const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const pageSize = Math.min(
    Math.max(parseInt(req.query.pageSize) || 10, 1),
    100,
  );
  const orderBy = ["recent", "favorite"].includes(req.query.orderBy)
    ? req.query.orderBy
    : "recent";
  const keyword = (req.query.keyword ?? "").trim().slice(0, 100);

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
  const product = await productService.getProduct(id, req.auth.userId);
  res.json(product);
});

// POST /products
export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.auth.userId, req.body);
  res.status(201).json(product);
});

// PATCH /products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const id = parseId(req.params);
  const product = await productService.updateProduct(
    id,
    req.auth.userId,
    req.body,
  );
  res.json(product);
});

// DELETE /products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const id = parseId(req.params);
  await productService.deleteProduct(id, req.auth.userId);
  res.status(204).send();
});
