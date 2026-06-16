import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseId } from "../utils/parseId.js";

// ========= Product 댓글 =========

// --- Create: Product 댓글 등록 ---
export const createProductComment = asyncHandler(async (req, res) => {
  const productId = parseId(req.params.productId);
  const { content } = req.body;

  // 부모 Product 존재 확인 (FK 위반 방지)
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return res.status(404).json({ message: "상품을 찾을 수 없어요." });
  }

  const newComment = await prisma.comment.create({
    data: { content, productId },
  });
  res.status(201).json(newComment);
});

// --- Read: Product 댓글 목록 (cursor 페이지네이션) ---
export const getProductCommentList = asyncHandler(async (req, res) => {
  const productId = parseId(req.params.productId);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const cursor = req.query.cursor ? parseId(req.query.cursor) : undefined;

  const list = await prisma.comment.findMany({
    where: { productId },
    take: limit,
    ...(cursor && {
      skip: 1, // cursor 자체는 결과에서 제외
      cursor: { id: cursor }, // 이 id 다음부터 시작
    }),
    // 인덱스 (productId/articleId, createdAt)와 정렬 키를 맞춤.
    // createdAt 동순간 tiebreak로 id를 함께 써서 안정적인 순서 보장.
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      content: true,
      createdAt: true,
    },
  });
  // 다음 cursor: 응답이 limit만큼 꽉 찼으면 마지막 id, 아니면 null (마지막 페이지)
  const nextCursor = list.length === limit ? list[list.length - 1].id : null;

  res.json({ list, nextCursor });
});

// ========= Article 댓글 =========

// --- Create: Article 댓글 등록 ---
export const createArticleComment = asyncHandler(async (req, res) => {
  const articleId = parseId(req.params.articleId);
  const { content } = req.body;

  // 부모 Article 존재 확인
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) {
    return res.status(404).json({ message: "게시글을 찾을 수 없어요." });
  }

  const newComment = await prisma.comment.create({
    data: { content, articleId },
  });
  res.status(201).json(newComment);
});

// --- Read: Article 댓글 목록 (cursor 페이지네이션) ---
export const getArticleCommentList = asyncHandler(async (req, res) => {
  const articleId = parseId(req.params.articleId);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const cursor = req.query.cursor ? parseId(req.query.cursor) : undefined;

  const list = await prisma.comment.findMany({
    where: { articleId },
    take: limit,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      content: true,
      createdAt: true,
    },
  });

  const nextCursor = list.length === limit ? list[list.length - 1].id : null;

  res.json({ list, nextCursor });
});

// ========= 공통 (수정/삭제) =========

// --- Update: 댓글 수정 ---
export const updateComment = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  // 존재 확인
  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "댓글을 찾을 수 없어요." });
  }

  // 화이트리스트 (content만 수정 가능)
  const { content } = req.body;
  const updated = await prisma.comment.update({
    where: { id },
    data: { content },
  });
  res.json(updated);
});

// --- Delete: 댓글 삭제 ---
export const deleteComment = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  // 존재 확인
  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "댓글을 찾을 수 없어요." });
  }

  const deleted = await prisma.comment.delete({ where: { id } });
  res.json({ message: "삭제되었어요.", data: deleted });
});
