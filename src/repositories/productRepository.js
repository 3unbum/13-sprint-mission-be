import prisma from "../config/prisma.js";

// 작성자•좋아요 수는 모든 조회에서 함께 가져옴
const baseInclude = {
  user: { select: { id: true, nickname: true } },
  _count: { select: { likes: true } },
};

// 목록 + 총개수 (offset 페이지네이션, 병렬 조회)
export async function findMany({ skip, take, orderBy, keyword }) {
  const where = keyword
    ? {
        OR: [
          { name: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } },
        ],
      }
    : {};
  return Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: baseInclude,
    }),
  ]);
}

// 상세 : 댓글 리스트 + 내 좋아요 여부 (likes를 내 것만 필터)까지 포함
export async function findById(id, userId) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      ...baseInclude,
      likes: { where: { userId }, select: { id: true } },
      comments: {
        orderBy: { id: "desc" },
        include: {
          user: { select: { id: true, nickname: true, image: true } },
        },
      },
    },
  });
}

export async function create(data) {
  return prisma.product.create({ data, include: baseInclude });
}

export async function update(id, userId, data) {
  return prisma.product.update({
    where: { id },
    data,
    include: {
      ...baseInclude,
      likes: { where: { userId }, select: { id: true } },
    },
  });
}

export async function remove(id) {
  return prisma.product.delete({ where: { id } });
}
