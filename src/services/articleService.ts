import type { Article, User } from "@prisma/client";
import * as articleRepository from "../repositories/articleRepository.js";
import { NotFoundError, ForbiddenError, ConflictError } from "../types/errors";

// 리포지토리가 include로 붙여주는 부가 정보
// (baseInclude: user + _count / detailInclude: 거기에 내 좋아요만 필터한 likes)
type ArticleWithRelations = Article & {
  user: Pick<User, "id" | "nickname">;
  _count: { likes: number };
  // 비로그인이면 리포지토리가 likes: false로 아예 제외하므로 옵셔널
  likes?: { id: number }[];
};

// 프론트로 나가는 형태 (관계 필드를 평탄화해 치환)
type ArticleResponse = Article & {
  ownerId: number;
  nickname: string;
  likeCount: number;
  isLiked: boolean;
};

// 목록 조회 파라미터
interface ArticleListParams {
  page: number;
  pageSize: number;
  orderBy?: string;
  keyword: string;
}

// 생성•수정 입력 (수정은 일부만 보낼 수 있어 Partial)
type ArticleInput = Pick<Article, "title" | "content">;

interface ArticleListResult {
  list: ArticleResponse[];
  totalCount: number;
}

// 프론트 기대 형태로 변환 - 상품과 필드명이 다름에 두의
// (favoriteCount -> likeCount, ownerNickname -> nickname으로 평탄화)
function toArticleResponse(article: ArticleWithRelations): ArticleResponse {
  const { user, _count, likes, ...rest } = article;
  return {
    ...rest,
    ownerId: user.id,
    nickname: user.nickname,
    likeCount: _count.likes,
    isLiked: likes ? likes.length > 0 : false,
  };
}

async function checkOwner(id: number, userId: number): Promise<void> {
  const article = await articleRepository.findById(id, userId);
  if (!article) {
    throw new NotFoundError("게시글을 찾을 수 없어요.");
  }
  if (article.userId !== userId) {
    throw new ForbiddenError("본인이 작성한 게시글만 수정•삭제할 수 있어요.");
  }
}

export async function getArticles({
  page,
  pageSize,
  orderBy,
  keyword,
}: ArticleListParams): Promise<ArticleListResult> {
  const orderOption =
    orderBy === "like" ? { likes: { _count: "desc" } } : { createdAt: "desc" };

  const [totalCount, articles] = await articleRepository.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderOption,
    keyword,
  });

  return {
    list: (articles as ArticleWithRelations[]).map(toArticleResponse),
    totalCount,
  };
}

export async function getArticle(
  id: number,
  userId: number | null,
): Promise<ArticleResponse> {
  const article = await articleRepository.findById(id, userId);
  if (!article) {
    throw new NotFoundError("게시글을 찾을 수 없어요.");
  }
  return toArticleResponse(article);
}

export async function createArticle(
  userId: number,
  { title, content }: ArticleInput,
): Promise<ArticleResponse> {
  const article = await articleRepository.create({ title, content, userId });
  return toArticleResponse(article);
}

export async function updateArticle(
  id: number,
  userId: number,
  { title, content }: Partial<ArticleInput>,
) {
  await checkOwner(id, userId);
  const article = await articleRepository.update(id, userId, {
    title,
    content,
  });
  return toArticleResponse(article);
}

export async function deleteArticle(id: number, userId: number): Promise<void> {
  await checkOwner(id, userId);
  await articleRepository.remove(id);
}

export async function addLike(
  articleId: number,
  userId: number,
): Promise<ArticleResponse> {
  const article = await articleRepository.findById(articleId, userId);
  if (!article) {
    throw new NotFoundError("게시글을 찾을 수 없어요.");
  }
  if (article.likes.length > 0) {
    throw new ConflictError("이미 좋아요를 누른 게시글이에요.");
  }
  const updated = await articleRepository.addLike(articleId, userId);
  if (!updated) {
    throw new NotFoundError("게시글을 찾을 수 없어요.");
  }
  return toArticleResponse(updated);
}

export async function removeLike(
  articleId: number,
  userId: number,
): Promise<ArticleResponse> {
  const article = await articleRepository.findById(articleId, userId);
  if (!article) {
    throw new NotFoundError("게시글을 찾을 수 없어요.");
  }
  if (article.likes.length === 0) {
    throw new ConflictError("좋아요를 누르지 않은 게시글이에요.");
  }
  const updated = await articleRepository.removeLike(articleId, userId);
  if (!updated) {
    throw new NotFoundError("게시글을 찾을 수 없어요.");
  }
  return toArticleResponse(updated);
}
