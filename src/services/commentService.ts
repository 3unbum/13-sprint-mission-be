import type { Comment, User } from "@prisma/client";
import * as commentRepository from "../repositories/commentRepository.js";
import * as productRepository from "../repositories/productRepository.js";
import * as articleRepository from "../repositories/articleRepository.js";
import { NotFoundError, ForbiddenError } from "../types/errors";

// 리포지토리가 include로 붙여주는 작성자 정보 (repository의 writerInclude와 짝)
type Writer = Pick<User, "id" | "nickname" | "image">;

// 리포지토리에서 나오는 형태 : Comment + user
type CommentWithUser = Comment & { user: Writer };

// 프론트로 나가는 형태 : user를 writer로 이름만 바꾼 것
type CommentResponse = Comment & { writer: Writer };

// 커서 페이지네이션 공통 파라미터
interface CursorParams {
  cursor?: number;
  limit: number;
}

// 커서 페이지네이션 공통 응답
interface CommentListResult {
  list: CommentResponse[];
  nextCursor: number | null;
}

// user -> writer로 이름만 바꿔 프론트 형태로
function toCommentResponse(comment: CommentWithUser): CommentResponse {
  const { user: writer, ...rest } = comment;
  return { ...rest, writer };
}

// 상품 존재 확인 (404)
async function ensureProduct(
  productId: number,
  userId: number | null,
): Promise<void> {
  const product = await productRepository.findById(productId, userId);
  if (!product) {
    throw new NotFoundError("상품을 찾을 수 없어요.");
  }
}

// 작성자 본인 확인 (404/403)
async function checkWriter(id: number, userId: number): Promise<void> {
  const comment = await commentRepository.findById(id);
  if (!comment) {
    throw new NotFoundError("댓글을 찾을 수 없어요.");
  }
  if (comment.userId !== userId) {
    throw new ForbiddenError("본인이 작성한 댓글만 수정•삭제할 수 있어요.");
  }
}

export async function getProductComments(
  productId: number,
  userId: number | null,
  { cursor, limit }: CursorParams,
): Promise<CommentListResult> {
  await ensureProduct(productId, userId);
  const comments = await commentRepository.findManyByProduct(productId, {
    cursor,
    limit,
  });
  const list = comments.map(toCommentResponse);
  // limit만큼 꽉 채워 왔으면 다음 페이지가 있을 수 있음 -> 마지막 id가 다음 cursor
  const nextCursor = list.length === limit ? list[list.length - 1].id : null;
  return { list, nextCursor };
}

export async function createProductComment(
  productId: number,
  userId: number,
  content: string,
): Promise<CommentResponse> {
  await ensureProduct(productId, userId);
  const comment = await commentRepository.create({
    content,
    productId,
    userId,
  });
  return toCommentResponse(comment);
}

export async function updateComment(
  id: number,
  userId: number,
  content: string,
): Promise<CommentResponse> {
  await checkWriter(id, userId);
  const comment = await commentRepository.update(id, { content });
  return toCommentResponse(comment);
}

export async function deleteComment(id: number, userId: number): Promise<void> {
  await checkWriter(id, userId);
  await commentRepository.remove(id);
}

// 게시글 존재 확인 (404)
async function ensureArticle(articleId: number): Promise<void> {
  const article = await articleRepository.findById(articleId, null);
  if (!article) {
    throw new NotFoundError("게시글을 찾을 수 없어요.");
  }
}

export async function getArticleComments(
  articleId: number,
  { cursor, limit }: CursorParams,
): Promise<CommentListResult> {
  await ensureArticle(articleId);
  const comments = await commentRepository.findManyByArticle(articleId, {
    cursor,
    limit,
  });
  const list = comments.map(toCommentResponse);
  const nextCursor = list.length === limit ? list[list.length - 1].id : null;
  return { list, nextCursor };
}

export async function createArticleComment(
  articleId: number,
  userId: number,
  content: string,
): Promise<CommentResponse> {
  await ensureArticle(articleId);
  const comment = await commentRepository.create({
    content,
    articleId,
    userId,
  });
  return toCommentResponse(comment);
}
