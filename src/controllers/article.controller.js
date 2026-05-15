import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// --- Create ---
export const createArticle = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const newArticle = await prisma.article.create({
    data: { title, content },
  });
  res.status(201).json(newArticle);
});

// --- Read: 목록 ---
export const getArticleList = asyncHandler(async (req, res) => {
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
          { title: { contains: keyword, mode: "insensitive" } },
          { content: { contains: keyword, mode: "insensitive" } },
        ],
      }
    : {};

  // 정렬
  const orderBy = sort === "recent" ? { createdAt: "desc" } : {};

  // 병렬 조회
  const [totalCount, list] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
    }),
  ]);

  res.json({ list, totalCount });
});

// --- Read: 단건 ---
export const getArticle = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const article = await prisma.article.findUnique({
    where: { id },
  });
  if (!article) {
    return res.status(404).json({ message: "게시글을 찾을 수 없어요." });
  }
  res.json(article);
});

// --- Update ---
export const updateArticle = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  // 존재 확인
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "게시글을 찾을 수 없어요." });
  }

  // 화이트리스트 추출
  const { title, content } = req.body;
  const updated = await prisma.article.update({
    where: { id },
    data: { title, content },
  });
  res.json(updated);
});

// --- Delete ---
export const deleteArticle = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  // 존재 확인
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "게시글을 찾을 수 없어요." });
  }

  const deleted = await prisma.article.delete({ where: { id } });
  res.json({ message: "삭제되었어요.", data: deleted });
});
