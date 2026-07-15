import * as articleRepository from "../repositories/articleRepository.js";

// 프론트 기대 형태로 변환 - 상품과 필드명이 다름에 두의
// (favoriteCount -> likeCount, ownerNickname -> nickname으로 평탄화)
function toArticleResponse(article) {
  const { user, _count, likes, ...rest } = article;
  return {
    ...rest,
    ownerId: user.id,
    nickname: user.nickname,
    likeCount: _count.likes,
    isLiked: likes ? likes.length > 0 : false,
  };
}

async function checkOwner(id, userId) {
  const article = await articleRepository.findById(id, userId);
  if (!article) {
    const error = new Error("게시글을 찾을 수 없어요.");
    error.status = 404;
    throw error;
  }
  if (article.userId !== userId) {
    const error = new Error("본인이 작성한 게시글만 수정•삭제할 수 있어요.");
    error.status = 403;
    throw error;
  }
}

export async function getArticles({ page, pageSize, orderBy, keyword }) {
  const orderOption =
    orderBy === "like" ? { likes: { _count: "desc" } } : { createdAt: "desc" };

  const [totalCount, articles] = await articleRepository.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderOption,
    keyword,
  });

  return { list: articles.map(toArticleResponse), totalCount };
}

export async function getArticle(id, userId) {
  const article = await articleRepository.findById(id, userId);
  if (!article) {
    const error = new Error("게시글을 찾을 수 없어요.");
    error.status = 404;
    throw error;
  }
  return toArticleResponse(article);
}

export async function createArticle(userId, { title, content }) {
  const article = await articleRepository.create({ title, content, userId });
  return toArticleResponse(article);
}

export async function updateArticle(id, userId, { title, content }) {
  await checkOwner(id, userId);
  const article = await articleRepository.update(id, userId, {
    title,
    content,
  });
  return toArticleResponse(article);
}

export async function deleteArticle(id, userId) {
  await checkOwner(id, userId);
  await articleRepository.remove(id);
}

export async function addLike(articleId, userId) {
  const article = await articleRepository.findById(articleId, userId);
  if (!article) {
    const error = new Error("게시글을 찾을 수 없어요.");
    error.status = 404;
    throw error;
  }
  if (article.likes.length > 0) {
    const error = new Error("이미 좋아요를 누른 게시글이에요.");
    error.status = 409;
    throw error;
  }
  const updated = await articleRepository.addLike(articleId, userId);
  return toArticleResponse(updated);
}

export async function removeLike(articleId, userId) {
  const article = await articleRepository.findById(articleId, userId);
  if (!article) {
    const error = new Error("게시글을 찾을 수 없어요.");
    error.status = 404;
    throw error;
  }
  if (article.likes.length === 0) {
    const error = new Error("좋아요를 누르지 않은 게시글이에요.");
    error.status = 409;
    throw error;
  }
  const updated = await articleRepository.removeLike(articleId, userId);
  return toArticleResponse(updated);
}
