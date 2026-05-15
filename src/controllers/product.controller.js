import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// --- Create ---
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, tags } = req.body;
  const newProduct = await prisma.product.create({
    data: { name, description, price, tags },
  });
  res.status(201).json(newProduct);
});

// --- Read: 목록 ---
export const getProductList = asyncHandler(async (req, res) => {
  // 쿼리 파라미터 검증
  const offset = Math.max(0, parseInt(req.query.offset) || 0);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const sortWhitelist = ["recent"];
  const sort = sortWhitelist.includes(req.query.sort)
    ? req.query.sort
    : "recent";
  const keyword = (req.query.keyword || "").trim().slice(0, 100);

  // 검색 조건
  const where = keyword
    ? {
        OR: [
          { name: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } },
        ],
      }
    : {};

  // 정렬
  const orderBy = sort === "recent" ? { createdAt: "desc" } : {};

  // 병렬 조회
  const [totalCount, list] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        name: true,
        price: true,
        createdAt: true,
      },
    }),
  ]);

  res.json({ list, totalCount });
});

// --- Read: 단건 ---
export const getProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({
    where: { id },
  });
  if (!product) {
    return res.status(404).json({ message: "상품을 찾을 수 없어요." });
  }
  res.json(product);
});

// --- Update ---
export const updateProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  // 존재 확인
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "상품을 찾을 수 없어요." });
  }

  // 화이트리스트 추출
  const { name, description, price, tags } = req.body;
  const updated = await prisma.product.update({
    where: { id },
    data: { name, description, price, tags },
  });
  res.json(updated);
});

// --- Delete ---
export const deleteProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  // 존재 확인
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "상품을 찾을 수 없어요." });
  }

  const deleted = await prisma.product.delete({ where: { id } });
  res.json({ message: "삭제되었어요.", data: deleted });
});
