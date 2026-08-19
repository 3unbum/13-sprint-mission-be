import type { Product, User, Comment } from "@prisma/client";
import * as productRepository from "../repositories/productRepository";
import { NotFoundError, ForbiddenError, ConflictError } from "../types/errors";

// 상세 조회에만 붙는 댓글 (목록에는 없음)
type CommentWithUser = Comment & {
  user: Pick<User, "id" | "nickname" | "image">;
};

// 리포지토리가 include로 붙여주는 부가 정보
type ProductWithRelations = Product & {
  user: Pick<User, "id" | "nickname">;
  _count: { likes: number };
  // 비로그인 상세조회는 likes: false라 아예 빠짐
  likes?: { id: number }[];
  // 상세(findById)에만 포함
  comments?: CommentWithUser[];
};

// 응답의 댓글 형태 (user -> writer)
type CommentResponse = Comment & {
  writer: Pick<User, "id" | "nickname" | "image">;
};

// 프론트로 나가는 형태 (관계 필드를 평탄화해 치환)
type ProductResponse = Product & {
  ownerId: number;
  ownerNickname: string;
  favoriteCount: number;
  isFavorite: boolean;
  comments?: CommentResponse[];
};

interface ProductListParams {
  page: number;
  pageSize: number;
  orderBy?: string;
  keyword?: string;
}

interface ProductListResult {
  list: ProductResponse[];
  totalCount: number;
}

// 등록•수정 입력 (수정은 일부만 보낼 수 있어 Partial로 감싸 사용)
type ProductInput = Pick<
  Product,
  "name" | "description" | "price" | "tags" | "images"
>;

// Prisma 결과를 프론트가 기대하는 형태로 변환
// (user -> ownerId/ownerNickname, _count.likes -> favoriteCount, likes -> isFavorite)
function toProductResponse(product: ProductWithRelations): ProductResponse {
  const { user, _count, likes, comments, ...rest } = product;
  return {
    ...rest,
    ownerId: user.id,
    ownerNickname: user.nickname,
    favoriteCount: _count.likes,
    isFavorite: likes ? likes.length > 0 : false,
    ...(comments && {
      comments: comments.map(({ user: writer, ...c }) => ({
        ...c,
        writer,
      })),
    }),
  };
}

// 존재 확인 (404) + 작성자 본인 확인 (403)
async function checkOwner(id: number, userId: number) {
  const product = await productRepository.findById(id, userId);
  if (!product) {
    throw new NotFoundError("상품을 찾을 수 없어요.");
  }
  if (product.userId !== userId) {
    throw new ForbiddenError("본인이 등록한 상품만 수정•삭제할 수 있어요.");
  }
}

export async function getProducts({
  page,
  pageSize,
  orderBy,
  keyword,
}: ProductListParams): Promise<ProductListResult> {
  const orderOption =
    orderBy === "favorite"
      ? { likes: { _count: "desc" as const } } // 좋아요 많은 순
      : { createdAt: "desc" as const }; // 최신순

  const [totalCount, products] = await productRepository.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderOption,
    keyword,
  });

  return {
    list: products.map(toProductResponse),
    totalCount,
  };
}

export async function getProduct(
  id: number,
  userId: number | null,
): Promise<ProductResponse> {
  const product = await productRepository.findById(id, userId);
  if (!product) {
    throw new NotFoundError("상품을 찾을 수 없어요.");
  }
  return toProductResponse(product);
}

export async function createProduct(
  userId: number,
  { name, description, price, tags, images }: ProductInput,
): Promise<ProductResponse> {
  const product = await productRepository.create({
    name,
    description,
    price,
    tags,
    images,
    userId,
  });
  return toProductResponse(product);
}

export async function updateProduct(
  id: number,
  userId: number,
  { name, description, price, tags, images }: Partial<ProductInput>,
): Promise<ProductResponse> {
  await checkOwner(id, userId);
  const product = await productRepository.update(id, userId, {
    name,
    description,
    price,
    tags,
    images,
  });
  return toProductResponse(product);
}

export async function deleteProduct(id: number, userId: number): Promise<void> {
  await checkOwner(id, userId);
  await productRepository.remove(id);
}

// 좋아요 추가 (없는 상품 404, 이미 누른 상품 409)
export async function addFavorite(
  productId: number,
  userId: number,
): Promise<ProductResponse> {
  const product = await productRepository.findById(productId, userId);
  if (!product) {
    throw new NotFoundError("상품을 찾을 수 없어요.");
  }
  if ((product.likes ?? []).length > 0) {
    throw new ConflictError("이미 좋아요를 누른 상품이에요.");
  }
  const updated = await productRepository.addLike(productId, userId);
  if (!updated) {
    throw new NotFoundError("상품을 찾을 수 없어요.");
  }
  return toProductResponse(updated);
}

// 좋아요 취소 (없는 상품 404, 안 누른 상품 409)
export async function removeFavorite(
  productId: number,
  userId: number,
): Promise<ProductResponse> {
  const product = await productRepository.findById(productId, userId);
  if (!product) {
    throw new NotFoundError("상품을 찾을 수 없어요.");
  }
  if ((product.likes ?? []).length === 0) {
    throw new ConflictError("좋아요를 누르지 않은 상품이에요.");
  }
  const updated = await productRepository.removeLike(productId, userId);
  if (!updated) {
    throw new NotFoundError("상품을 찾을 수 없어요.");
  }
  return toProductResponse(updated);
}
