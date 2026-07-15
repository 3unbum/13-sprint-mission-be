import prisma from "../config/prisma.js";

// 작성자 정보는 모든 조회에서 함께 가져옴
const writerInclude = {
  user: { select: { id: true, nickname: true, image: true } },
};

// 상품 댓글 목록 (cursor 페이지네이션, 최신순)
// cursor가 있으면 그 지점부터, skip:1로 cursor 자신은 제외
export async function findManyByProduct(productId, { cursor, limit }) {
  return prisma.comment.findMany({
    where: { productId },
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { id: "desc" },
    include: writerInclude,
  });
}

// 게시글 댓글 목록 (cursor 페이지네이션, 최신순)
export async function findManyByArticle(articleId, { cursor, limit }) {
  return prisma.comment.findMany({
    where: { articleId },
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { id: "desc" },
    include: writerInclude,
  });
}

export async function findById(id) {
  return prisma.comment.findUnique({ where: { id }, include: writerInclude });
}

export async function create(data) {
  return prisma.comment.create({ data, include: writerInclude });
}

export async function update(id, data) {
  return prisma.comment.update({ where: { id }, data, include: writerInclude });
}

export async function remove(id) {
  return prisma.comment.delete({ where: { id } });
}
