import type { Comment, Prisma, User } from "@prisma/client";
import prisma from "../config/prisma";

// 작성자 정보는 모든 조회에서 함께 가져옴
// satisfies를 붙여야 Prisma가 include 내용을 추론해 반환 타입에 user가 붙는다
// (그냥 상수로 두면 객체 리터럴 타입이 넓어져 반환 타입에서 user가 사라짐)
const writerInclude = {
  user: { select: { id: true, nickname: true, image: true } },
} satisfies Prisma.CommentInclude;

// 서비스가 쓰는 "작성자 정보가 붙은 댓글" 타입
export type CommentWithUser = Comment & {
  user: Pick<User, "id" | "nickname" | "image">;
};

interface CursorOptions {
  cursor?: number;
  limit: number;
}

// 상품 댓글 목록 (cursor 페이지네이션, 최신순)
// cursor가 있으면 그 지점부터, skip:1로 cursor 자신은 제외
export async function findManyByProduct(
  productId: number,
  { cursor, limit }: CursorOptions,
): Promise<CommentWithUser[]> {
  return prisma.comment.findMany({
    where: { productId },
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { id: "desc" },
    include: writerInclude,
  });
}

// 게시글 댓글 목록 (cursor 페이지네이션, 최신순)
export async function findManyByArticle(
  articleId: number,
  { cursor, limit }: CursorOptions,
): Promise<CommentWithUser[]> {
  return prisma.comment.findMany({
    where: { articleId },
    take: limit,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { id: "desc" },
    include: writerInclude,
  });
}

export async function findById(id: number): Promise<CommentWithUser | null> {
  return prisma.comment.findUnique({ where: { id }, include: writerInclude });
}

export async function create(
  data: Prisma.CommentUncheckedCreateInput,
): Promise<CommentWithUser> {
  return prisma.comment.create({ data, include: writerInclude });
}

export async function update(
  id: number,
  data: Prisma.CommentUpdateInput,
): Promise<CommentWithUser> {
  return prisma.comment.update({ where: { id }, data, include: writerInclude });
}

export async function remove(id: number): Promise<Comment> {
  return prisma.comment.delete({ where: { id } });
}
