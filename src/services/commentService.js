import * as commentRepository from "../repositories/commentRepository.js";
import * as productRepository from "../repositories/productRepository.js";
import * as articleRepository from "../repositories/articleRepository.js";

// user -> writer로 이름만 바꿔 프론트 형태로
function toCommentResponse(comment) {
  const { user: writer, ...rest } = comment;
  return { ...rest, writer };
}

// 상품 존재 확인 (404)
async function ensureProduct(productId, userId) {
  const product = await productRepository.findById(productId, userId);
  if (!product) {
    const error = new Error("상품을 찾을 수 없어요.");
    error.status = 404;
    throw error;
  }
}

// 작성자 본인 확인 (404/403)
async function checkWriter(id, userId) {
  const comment = await commentRepository.findById(id);
  if (!comment) {
    const error = new Error("댓글을 찾을 수 없어요.");
    error.status = 404;
    throw error;
  }
  if (comment.userId !== userId) {
    const error = new Error("본인이 작성한 댓글만 수정•삭제할 수 있어요.");
    error.status = 403;
    throw error;
  }
}

export async function getProductComments(productId, userId, { cursor, limit }) {
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

export async function createProductComment(productId, userId, content) {
  await ensureProduct(productId, userId);
  const comment = await commentRepository.create({
    content,
    productId,
    userId,
  });
  return toCommentResponse(comment);
}

export async function updateComment(id, userId, content) {
  await checkWriter(id, userId);
  const comment = await commentRepository.update(id, { content });
  return toCommentResponse(comment);
}

export async function deleteComment(id, userId) {
  await checkWriter(id, userId);
  await commentRepository.remove(id);
}

// 게시글 존재 확인 (404)
async function ensureArticle(articleId) {
  const article = await articleRepository.findById(articleId, null);
  if (!article) {
    const error = new Error("게시글을 찾을 수 없어요.");
    error.status = 404;
    throw error;
  }
}

export async function getArticleComments(articleId, { cursor, limit }) {
  await ensureArticle(articleId);
  const comments = await commentRepository.findManyByArticle(articleId, {
    cursor,
    limit,
  });
  const list = comments.map(toCommentResponse);
  const nextCursor = list.length === limit ? list[list.length - 1].id : null;
  return { list, nextCursor };
}

export async function createArticleComment(articleId, userId, content) {
  await ensureArticle(articleId);
  const comment = await commentRepository.create({
    content,
    articleId,
    userId,
  });
  return toCommentResponse(comment);
}
