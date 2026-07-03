import * as productRepository from "../repositories/productRepository.js";

// Prisma 결과를 프론트가 기대하는 형태로 변환
// (user -> ownerId/ownerNickname, _count.likes -> favoriteCount, likes -> isFavorite)
function toProductResponse(product) {
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
async function checkOwner(id, userId) {
  const product = await productRepository.findById(id, userId);
  if (!product) {
    const error = new Error("상품을 찾을 수 없어요.");
    error.status = 404;
    throw error;
  }
  if (product.userId !== userId) {
    const error = new Error("본인이 등록한 상품만 수정•삭제할 수 있어요.");
    error.status = 403;
    throw error;
  }
}

export async function getProducts({ page, pageSize, orderBy, keyword }) {
  const orderOption =
    orderBy === "favorite"
      ? { likes: { _count: "desc" } } // 좋아요 많은 순
      : { createdAt: "desc" }; // 최신순

  const [totalCount, products] = await productRepository.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderOption,
    keyword,
  });

  return { list: products.map(toProductResponse), totalCount };
}

export async function getProduct(id, userId) {
  const product = await productRepository.findById(id, userId);
  if (!product) {
    const error = new Error("상품을 찾을 수 없어요.");
    error.status = 404;
    throw error;
  }
  return toProductResponse(product);
}

export async function createProduct(
  userId,
  { name, description, price, tags, images },
) {
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
  id,
  userId,
  { name, description, price, tags, images },
) {
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

export async function deleteProduct(id, userId) {
  await checkOwner(id, userId);
  await productRepository.remove(id);
}
