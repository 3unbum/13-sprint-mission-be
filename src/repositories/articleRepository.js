import prisma from "../config/prisma.js";

const baseInclude = {
  user: { select: { id: true, nickname: true } },
  _count: { select: { likes: true } },
};

// 로그인 상태면 내 좋아요만 필터해 포함, 비로그인(userId 없음)이면 아예 제외
// (where: { userId: undefined }는 "조건 없음"이 되어 남의 좋아요까지 다 가져오므로 주의)
function detailInclude(userId) {
  return {
    ...baseInclude,
    likes: userId ? { where: { userId }, select: { id: true } } : false,
  };
}

export async function findMany({ skip, take, orderBy, keyword }) {
  const where = keyword
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

export async function findById(id, userId) {
  return prisma.article.findUnique({
    where: { id },
    include: detailInclude(userId),
  });
}

export async function create(data) {
  return prisma.article.create({ data, include: baseInclude });
}

export async function update(id, userId, data) {
  return prisma.article.update({
    where: { id },
    data,
    include: detailInclude(userId),
  });
}

export async function remove(id) {
  return prisma.article.delete({ where: { id } });
}

export async function addLike(articleId, userId) {
  const [, article] = await prisma.$transaction([
    prisma.like.create({ data: { articleId, userId } }),
    prisma.article.findUnique({
      where: { id: articleId },
      include: detailInclude(userId),
    }),
  ]);
  return article;
}

export async function removeLike(articleId, userId) {
  const [, article] = await prisma.$transaction([
    prisma.like.deleteMany({ where: { articleId, userId } }),
    prisma.article.findUnique({
      where: { id: articleId },
      include: detailInclude(userId),
    }),
  ]);
  return article;
}
