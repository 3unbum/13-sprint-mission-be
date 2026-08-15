import type { Prisma, Product, User, Comment } from "@prisma/client";
import prisma from "../config/prisma";

// 작성자•좋아요 수는 모든 조회에서 함께 가져옴
const baseInclude = {
  user: { select: { id: true, nickname: true } },
  _count: { select: { likes: true } },
} satisfies Prisma.ProductInclude;

// 목록 조회 파라미터
interface FindManyOptions {
  skip: number;
  take: number;
  orderBy: Prisma.ProductOrderByWithRelationInput;
  keyword?: string;
}

// 서비스가 쓰는 관계 포함 타입들
export type ProductWithBase = Product & {
  user: Pick<User, "id" | "nickname">;
  _count: { likes: number };
};

export type ProductWithLikes = ProductWithBase & {
  likes: { id: number }[];
};

export type ProductDetail = ProductWithBase & {
  likes?: { id: number }[];
  comments: (Comment & { user: Pick<User, "id" | "nickname" | "image"> })[];
};

// 목록 + 총개수 (offset 페이지네이션, 병렬 조회)
export async function findMany({
  skip,
  take,
  orderBy,
  keyword,
}: FindManyOptions): Promise<[number, ProductWithBase[]]> {
  const where: Prisma.ProductWhereInput = keyword
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
export async function findById(
  id: number,
  userId: number | null,
): Promise<ProductDetail | null> {
  return prisma.product.findUnique({
    where: { id },
    include: {
      ...baseInclude,
      // userId가 undefined면 Prisma가 "조건 없음"으로 해석해 남의 좋아요까지 가져온다
      likes: userId ? { where: { userId }, select: { id: true } } : false,
      comments: {
        orderBy: { id: "desc" },
        include: {
          user: { select: { id: true, nickname: true, image: true } },
        },
      },
    },
  });
}

export async function create(
  data: Prisma.ProductUncheckedCreateInput,
): Promise<ProductWithBase> {
  return prisma.product.create({ data, include: baseInclude });
}

export async function update(
  id: number,
  userId: number,
  data: Prisma.ProductUpdateInput,
): Promise<ProductWithLikes> {
  return prisma.product.update({
    where: { id },
    data,
    include: {
      ...baseInclude,
      likes: { where: { userId }, select: { id: true } },
    },
  });
}

export async function remove(id: number): Promise<Product> {
  return prisma.product.delete({ where: { id } });
}

// 좋아요 이후의 최신 상품 조회용 include (내 좋아요 여부 포함)
function favoriteInclude(userId: number) {
  return {
    ...baseInclude,
    likes: { where: { userId }, select: { id: true } },
  };
}

// 좋아요 추가 + 갱신된 상품 조회를 하나의 트랜잭션으로
// (배열 형태 $transaction: 순서대로 실행되고, 하나라도 실패하면 전부 롤백)
export async function addLike(
  productId: number,
  userId: number,
): Promise<ProductWithLikes | null> {
  const [, product] = await prisma.$transaction([
    prisma.like.create({ data: { productId, userId } }),
    prisma.product.findUnique({
      where: { id: productId },
      include: favoriteInclude(userId),
    }),
  ]);
  return product;
}

// 좋아요 취소 + 갱신된 상품 조회 (트랜잭션)
export async function removeLike(
  productId: number,
  userId: number,
): Promise<ProductWithLikes | null> {
  const [, product] = await prisma.$transaction([
    prisma.like.deleteMany({ where: { productId, userId } }),
    prisma.product.findUnique({
      where: { id: productId },
      include: favoriteInclude(userId),
    }),
  ]);
  return product;
}
