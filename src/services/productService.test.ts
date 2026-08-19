import * as productRepository from "../repositories/productRepository";
import * as productService from "./productService";
import { NotFoundError, ForbiddenError, ConflictError } from "../types/errors";

// 리포지토리를 통째로 가자로 대체
// 이렇게 하면 DB가 없어도 서비스 로직만 따로 검증할 수 있다.
jest.mock("../repositories/productRepository");
const mockedRepo = productRepository as jest.Mocked<typeof productRepository>;

// 테스트마다 반복되는 Prisma 결과 모양을 한 곳에서 만듦.
// 레포지토리가 include로 붙여주는 user / _count / likes 까지 흉내내야
// toProductResponse 변환이 정상 동작함
function makeProduct(overrides = {}) {
  return {
    id: 1,
    name: "테스트 상품",
    description: "설명",
    price: 10000,
    tags: ["태그"],
    images: ["https://example.com/1.png"],
    userId: 100, // 작성자
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    user: { id: 100, nickname: "판다" },
    _count: { likes: 3 },
    likes: [], // 좋아요 안 누른 상태
    ...overrides,
  } as any;
}

const OWNER_ID = 100; // 상품 작성자
const OTHER_ID = 999; // 남의 상품에 손대는 사람

describe("ProductService", () => {
  beforeEach(() => {
    // 각 테스트가 서로의 호출 기록에 영향받지 않도록 초기화
    jest.clearAllMocks();
  });

  describe("getProduct - 상품 상세 조회", () => {
    test("상품이 존재하면 프론트 응답 형태로 변환해 반환한다", async () => {
      // Setup
      mockedRepo.findById.mockResolvedValue(makeProduct());

      // Exercise
      const result = await productService.getProduct(1, OWNER_ID);

      // Assertion
      expect(mockedRepo.findById).toHaveBeenCalledWith(1, OWNER_ID);
      // 관계 필드가 평탄화되어야 한다
      expect(result.ownerId).toBe(100);
      expect(result.ownerNickname).toBe("판다");
      expect(result.favoriteCount).toBe(3);
      // 원본 관계 필드는 응답에서 사라져야 한다
      expect(result).not.toHaveProperty("user");
      expect(result).not.toHaveProperty("_count");
    });

    test("좋아요를 누른 상품은 isFavorite이 true가 된다.", async () => {
      mockedRepo.findById.mockResolvedValue(
        makeProduct({ likes: [{ id: 1 }] }),
      );

      const result = await productService.getProduct(1, OWNER_ID);

      expect(result.isFavorite).toBe(true);
    });

    test("비로그인 조회(likes 미포함)는 isFavorite이 false가 된다", async () => {
      // 비로그인이면 리포지토리가 likes를 아예 include하지 않는다
      const { likes, ...withoutLikes } = makeProduct();
      mockedRepo.findById.mockResolvedValue(withoutLikes as any);

      const result = await productService.getProduct(1, null);

      expect(result.isFavorite).toBe(false);
    });

    test("존재하지 않는 상품은 NotFoundError를 던진다", async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(productService.getProduct(999, OWNER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("getProducts - 상품 목록", () => {
    test("page를 skip으로 변환해 리포지토리에 넘긴다", async () => {
      mockedRepo.findMany.mockResolvedValue([2, [makeProduct()]] as any);

      const result = await productService.getProducts({
        page: 3,
        pageSize: 10,
      });

      // 3페이지 -> skip 20
      expect(mockedRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(result.totalCount).toBe(2);
      expect(result.list).toHaveLength(1);
    });

    test("orderBy가 favorite이면 좋아요 많은 순으로 정렬한다", async () => {
      mockedRepo.findMany.mockResolvedValue([0, []] as any);

      await productService.getProducts({
        page: 1,
        pageSize: 10,
        orderBy: "favorite",
      });

      expect(mockedRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { likes: { _count: "desc" } },
        }),
      );
    });

    test("orderBy가 없으면 최신순으로 정렬한다", async () => {
      mockedRepo.findMany.mockResolvedValue([0, []] as any);

      await productService.getProducts({ page: 1, pageSize: 10 });

      expect(mockedRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
        }),
      );
    });
  });

  describe("createProduct - 상품 등록", () => {
    test("입력값에 userId를 붙여 리포지토리에 저장한다", async () => {
      // Setup
      const input = {
        name: "새 상품",
        description: "새 설명",
        price: 5000,
        tags: ["새태그"],
        images: ["https://example.com/new.png"],
      };
      mockedRepo.create.mockResolvedValue(makeProduct(input));

      // Exercise
      const result = await productService.createProduct(OWNER_ID, input);

      // Assertion - 작성자 정보가 함께 저장되어야 한다
      expect(mockedRepo.create).toHaveBeenCalledWith({
        ...input,
        userId: OWNER_ID,
      });
      expect(mockedRepo.create).toHaveBeenCalledTimes(1);
      expect(result.name).toBe("새 상품");
      expect(result.ownerId).toBe(OWNER_ID);
    });

    test("등록 직후에는 좋아요가 없는 상태로 응답한다", async () => {
      mockedRepo.create.mockResolvedValue(
        makeProduct({ _count: { likes: 0 }, likes: [] }),
      );

      const result = await productService.createProduct(OWNER_ID, {
        name: "새 상품",
        description: "설명",
        price: 5000,
        tags: [],
        images: [],
      });

      expect(result.favoriteCount).toBe(0);
      expect(result.isFavorite).toBe(false);
    });
  });

  describe("updateProduct - 상품 수정", () => {
    test("작성자 본인이면 수정에 성공한다", async () => {
      // Setup - checkOwner가 먼저 findById로 소유자를 확인한다
      mockedRepo.findById.mockResolvedValue(makeProduct());
      mockedRepo.update.mockResolvedValue(makeProduct({ name: "수정된 상품" }));

      // Exercise
      const result = await productService.updateProduct(1, OWNER_ID, {
        name: "수정된 상품",
      });

      // Assertion
      expect(mockedRepo.update).toHaveBeenCalledTimes(1);
      expect(result.name).toBe("수정된 상품");
    });

    test("작성자가 아니면 ForbiddenError를 던지고 수정하지 않는다", async () => {
      // Setup - 상품은 존재하지만 주인이 다르다
      mockedRepo.findById.mockResolvedValue(makeProduct());

      // Exercise & Assertion
      await expect(
        productService.updateProduct(1, OTHER_ID, { name: "탈취 시도" }),
      ).rejects.toThrow(ForbiddenError);

      // 권한 검사에서 막혔으므로 update가 아예 불리면 안 된다
      expect(mockedRepo.update).not.toHaveBeenCalled();
    });

    test("존재하지 않는 상품 수정은 NotFoundError를 던진다", async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(
        productService.updateProduct(999, OWNER_ID, { name: "없는 상품" }),
      ).rejects.toThrow(NotFoundError);

      expect(mockedRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteProduct - 상품 삭제", () => {
    test("작성자 본인이면 삭제에 성공한다", async () => {
      mockedRepo.findById.mockResolvedValue(makeProduct());
      mockedRepo.remove.mockResolvedValue(makeProduct());

      await productService.deleteProduct(1, OWNER_ID);

      expect(mockedRepo.remove).toHaveBeenCalledWith(1);
    });

    test("작성자가 아니면 ForbiddenError를 던지고 삭제하지 않는다", async () => {
      mockedRepo.findById.mockResolvedValue(makeProduct());

      await expect(productService.deleteProduct(1, OTHER_ID)).rejects.toThrow(
        ForbiddenError,
      );

      expect(mockedRepo.remove).not.toHaveBeenCalled();
    });

    test("존재하지 않는 상품 삭제는 NotFoundError를 던진다", async () => {
      mockedRepo.findById.mockResolvedValue(null);

      await expect(productService.deleteProduct(999, OWNER_ID)).rejects.toThrow(
        NotFoundError,
      );

      expect(mockedRepo.remove).not.toHaveBeenCalled();
    });
  });

  describe("addFavorite / removeFavorite - 좋아요", () => {
    test("좋아요를 누르지 않은 상품에 좋아요를 추가할 수 있다", async () => {
      mockedRepo.findById.mockResolvedValue(makeProduct({ likes: [] }));
      mockedRepo.addLike.mockResolvedValue(
        makeProduct({ likes: [{ id: 1 }], _count: { likes: 4 } }),
      );

      const result = await productService.addFavorite(1, OWNER_ID);

      expect(mockedRepo.addLike).toHaveBeenCalledWith(1, OWNER_ID);
      expect(result.isFavorite).toBe(true);
      expect(result.favoriteCount).toBe(4);
    });

    test("이미 좋아요한 상품에 또 누르면 ConflictError를 던진다", async () => {
      mockedRepo.findById.mockResolvedValue(
        makeProduct({ likes: [{ id: 1 }] }),
      );

      await expect(productService.addFavorite(1, OWNER_ID)).rejects.toThrow(
        ConflictError,
      );

      expect(mockedRepo.addLike).not.toHaveBeenCalled();
    });

    test("좋아요한 상품의 좋아요를 취소할 수 있다", async () => {
      mockedRepo.findById.mockResolvedValue(
        makeProduct({ likes: [{ id: 1 }] }),
      );
      mockedRepo.removeLike.mockResolvedValue(
        makeProduct({ likes: [], _count: { likes: 2 } }),
      );

      const result = await productService.removeFavorite(1, OWNER_ID);

      expect(mockedRepo.removeLike).toHaveBeenCalledWith(1, OWNER_ID);
      expect(result.isFavorite).toBe(false);
    });

    test("좋아요하지 않은 상품을 취소하면 ConflictError를 던진다", async () => {
      mockedRepo.findById.mockResolvedValue(makeProduct({ likes: [] }));

      await expect(productService.removeFavorite(1, OWNER_ID)).rejects.toThrow(
        ConflictError,
      );

      expect(mockedRepo.removeLike).not.toHaveBeenCalled();
    });

    test("좋아요 처리 중 상품이 삭제되면 NotFoundError를 던진다", async () => {
      // 트랜잭션 사이에 상품이 사라진 경쟁 상황
      mockedRepo.findById.mockResolvedValue(makeProduct({ likes: [] }));
      mockedRepo.addLike.mockResolvedValue(null as any);

      await expect(productService.addFavorite(1, OWNER_ID)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
