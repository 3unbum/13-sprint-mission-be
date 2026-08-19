import type { Prisma, Article, User } from "@prisma/client";
import prisma from "../config/prisma";

const baseInclude = {
  user: { select: { id: true, nickname: true } },
  _count: { select: { likes: true } },
} satisfies Prisma.ArticleInclude;

// 로그인 상태면 내 좋아요만 필터해 포함, 비로그인(userId 없음)이면 아예 제외
// (where: { userId: undefined }는 "조건 없음"이 되어 남의 좋아요까지 다 가져오므로 주의)
function detailInclude(userId: number | null) {
  return {
    ...baseInclude,
    likes: userId ? { where: { userId }, select: { id: true } } : false,
  } satisfies Prisma.ArticleInclude;
}

interface FindManyOptions {
  skip: number;
  take: number;
  orderBy: Prisma.ArticleOrderByWithRelationInput;
  keyword?: string;
}

export type ArticleWithBase = Article & {
  user: Pick<User, "id" | "nickname">;
  _count: { likes: number };
};

export type ArticleDetail = ArticleWithBase & {
  likes?: { id: number }[];
};

export async function findMany({
  skip,
  take,
  orderBy,
  keyword,
}: FindManyOptions): Promise<[number, ArticleWithBase[]]> {
  const where: Prisma.ArticleWhereInput = keyword
    ? {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { content: { contains: keyword, mode: "insensitive" } },
        ],
      }
    : {};

  return Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      skip,
      take,
      orderBy,
      include: baseInclude,
    }),
  ]);
}

export async function findById(
  id: number,
  userId: number | null,
): Promise<ArticleDetail | null> {
  return prisma.article.findUnique({
    where: { id },
    include: detailInclude(userId),
  });
}

export async function create(
  data: Prisma.ArticleUncheckedCreateInput,
): Promise<ArticleWithBase> {
  return prisma.article.create({ data, include: baseInclude });
}

export async function update(
  id: number,
  userId: number,
  data: Prisma.ArticleUpdateInput,
): Promise<ArticleDetail> {
  return prisma.article.update({
    where: { id },
    data,
    include: detailInclude(userId),
  });
}

export async function remove(id: number): Promise<Article> {
  return prisma.article.delete({ where: { id } });
}

export async function addLike(
  articleId: number,
  userId: number,
): Promise<ArticleDetail | null> {
  const [, article] = await prisma.$transaction([
    prisma.like.create({ data: { articleId, userId } }),
    prisma.article.findUnique({
      where: { id: articleId },
      include: detailInclude(userId),
    }),
  ]);
  return article;
}

export async function removeLike(
  articleId: number,
  userId: number,
): Promise<ArticleDetail | null> {
  const [, article] = await prisma.$transaction([
    prisma.like.deleteMany({ where: { articleId, userId } }),
    prisma.article.findUnique({
      where: { id: articleId },
      include: detailInclude(userId),
    }),
  ]);
  return article;
}
