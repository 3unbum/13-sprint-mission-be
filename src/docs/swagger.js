// 판다마켓 API OpenAPI 3.0 명세
// swagger-ui-express가 이 객체를 읽어 /docs 페이지를 렌더링한다.
// ※ 이 파일은 문서 데이터라 Claude가 생성함 (2026-07-05). 엔드포인트가 바뀌면 여기도 갱신할 것.

const errorResponse = (description) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
    },
  },
});

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "판다마켓 API",
    version: "1.0.0",
    description:
      "코드잇 스프린트 미션 9 — 중고마켓/자유게시판 백엔드 API 명세입니다. 🐼\n\n인증이 필요한 요청은 로그인 후 받은 accessToken을 오른쪽 위 **Authorize** 버튼에 넣고 테스트하세요.",
  },
  servers: [{ url: "http://localhost:4000", description: "로컬 개발 서버" }],
  tags: [
    { name: "Auth", description: "회원가입 / 로그인" },
    { name: "Users", description: "유저 정보" },
    { name: "Products", description: "중고마켓 상품" },
    { name: "Articles", description: "자유게시판 게시글" },
    { name: "Comments", description: "댓글 (상품/게시글 공용)" },
    { name: "Images", description: "이미지 업로드" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "로그인/회원가입 응답의 accessToken",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          message: { type: "string", example: "상품을 찾을 수 없어요." },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          email: { type: "string", example: "codeit@test.com" },
          nickname: { type: "string", example: "판다" },
          image: { type: "string", nullable: true, example: null },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
          refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "아이패드 미니 6" },
          description: { type: "string", example: "깨끗하게 썼어요." },
          price: { type: "integer", example: 500000 },
          tags: {
            type: "array",
            items: { type: "string" },
            example: ["전자제품", "애플"],
          },
          images: {
            type: "array",
            items: { type: "string" },
            example: ["http://localhost:4000/uploads/1783072608903.png"],
          },
          ownerId: { type: "integer", example: 1 },
          ownerNickname: { type: "string", example: "판다" },
          favoriteCount: { type: "integer", example: 3 },
          isFavorite: {
            type: "boolean",
            example: false,
            description: "요청한 사용자의 좋아요 여부",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductDetail: {
        allOf: [
          { $ref: "#/components/schemas/Product" },
          {
            type: "object",
            properties: {
              comments: {
                type: "array",
                items: { $ref: "#/components/schemas/Comment" },
                description: "상품 댓글 리스트 (최신순)",
              },
            },
          },
        ],
      },
      ProductInput: {
        type: "object",
        required: ["name", "description", "price"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 30 },
          description: { type: "string", minLength: 1, maxLength: 1000 },
          price: { type: "integer", minimum: 0 },
          tags: {
            type: "array",
            items: { type: "string", maxLength: 20 },
          },
          images: {
            type: "array",
            items: { type: "string" },
            maxItems: 3,
            description: "이미지 URL 최대 3개 (POST /images/upload 응답 사용)",
          },
        },
      },
      ProductList: {
        type: "object",
        properties: {
          list: {
            type: "array",
            items: { $ref: "#/components/schemas/Product" },
          },
          totalCount: { type: "integer", example: 42 },
        },
      },
      Article: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "첫 게시글이에요" },
          content: { type: "string", example: "자유게시판 글입니다." },
          image: { type: "string", nullable: true, example: null },
          ownerId: { type: "integer", example: 1 },
          nickname: { type: "string", example: "판다" },
          likeCount: { type: "integer", example: 5 },
          isLiked: {
            type: "boolean",
            example: false,
            description: "요청한 사용자의 좋아요 여부 (비로그인이면 false)",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ArticleInput: {
        type: "object",
        required: ["title", "content"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 50 },
          content: { type: "string", minLength: 1, maxLength: 1000 },
        },
      },
      ArticleList: {
        type: "object",
        properties: {
          list: {
            type: "array",
            items: { $ref: "#/components/schemas/Article" },
          },
          totalCount: { type: "integer", example: 10 },
        },
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          content: { type: "string", example: "아직 판매하나요?" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          userId: { type: "integer", example: 2 },
          productId: { type: "integer", nullable: true, example: 1 },
          articleId: { type: "integer", nullable: true, example: null },
          writer: {
            type: "object",
            properties: {
              id: { type: "integer", example: 2 },
              nickname: { type: "string", example: "남남" },
              image: { type: "string", nullable: true, example: null },
            },
          },
        },
      },
      CommentInput: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string", minLength: 1, maxLength: 300 },
        },
      },
      CommentList: {
        type: "object",
        properties: {
          list: {
            type: "array",
            items: { $ref: "#/components/schemas/Comment" },
          },
          nextCursor: {
            type: "integer",
            nullable: true,
            example: 7,
            description: "다음 페이지 cursor (더 없으면 null)",
          },
        },
      },
    },
    parameters: {
      idParam: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer" },
        description: "리소스 id",
      },
      pageParam: {
        name: "page",
        in: "query",
        schema: { type: "integer", default: 1, minimum: 1 },
      },
      pageSizeParam: {
        name: "pageSize",
        in: "query",
        schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
      },
      keywordParam: {
        name: "keyword",
        in: "query",
        schema: { type: "string", maxLength: 100 },
        description: "검색어 (이름/설명 또는 제목/내용)",
      },
      cursorParam: {
        name: "cursor",
        in: "query",
        schema: { type: "integer" },
        description: "이전 응답의 nextCursor",
      },
      limitParam: {
        name: "limit",
        in: "query",
        schema: { type: "integer", default: 10, minimum: 1, maximum: 50 },
      },
    },
  },
  paths: {
    "/auth/signUp": {
      post: {
        tags: ["Auth"],
        summary: "회원가입",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "nickname", "password"],
                properties: {
                  email: { type: "string", example: "codeit@test.com" },
                  nickname: { type: "string", example: "판다" },
                  password: { type: "string", example: "12345678" },
                  passwordConfirmation: {
                    type: "string",
                    example: "12345678",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "가입 성공",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          422: errorResponse("이미 사용 중인 이메일"),
        },
      },
    },
    "/auth/signIn": {
      post: {
        tags: ["Auth"],
        summary: "로그인",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "codeit@test.com" },
                  password: { type: "string", example: "12345678" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "로그인 성공",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          401: errorResponse("이메일 또는 비밀번호 불일치"),
        },
      },
    },
    "/users/me": {
      get: {
        tags: ["Users"],
        summary: "내 정보 조회",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "내 정보",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          401: errorResponse("토큰 없음/만료"),
        },
      },
    },
    "/products": {
      get: {
        tags: ["Products"],
        summary: "상품 목록 조회 (비로그인 가능)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/pageSizeParam" },
          { $ref: "#/components/parameters/keywordParam" },
          {
            name: "orderBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["recent", "favorite"],
              default: "recent",
            },
            description: "recent: 최신순, favorite: 좋아요 많은 순",
          },
        ],
        responses: {
          200: {
            description: "상품 목록",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductList" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "상품 등록",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" },
            },
          },
        },
        responses: {
          201: {
            description: "등록된 상품",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          400: errorResponse("입력값 검증 실패"),
          401: errorResponse("토큰 없음/만료"),
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "상품 상세 조회 (댓글 리스트 + 좋아요 여부 포함)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "상품 상세",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductDetail" },
              },
            },
          },
          401: errorResponse("토큰 없음/만료"),
          404: errorResponse("상품 없음"),
        },
      },
      patch: {
        tags: ["Products"],
        summary: "상품 수정 (작성자만)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" },
            },
          },
        },
        responses: {
          200: {
            description: "수정된 상품",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          400: errorResponse("입력값 검증 실패"),
          403: errorResponse("작성자 아님"),
          404: errorResponse("상품 없음"),
        },
      },
      delete: {
        tags: ["Products"],
        summary: "상품 삭제 (작성자만)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          204: { description: "삭제 성공 (본문 없음)" },
          403: errorResponse("작성자 아님"),
          404: errorResponse("상품 없음"),
        },
      },
    },
    "/products/{id}/favorite": {
      post: {
        tags: ["Products"],
        summary: "상품 좋아요 추가",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          201: {
            description: "갱신된 상품 (favoriteCount/isFavorite 반영)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          404: errorResponse("상품 없음"),
          409: errorResponse("이미 좋아요 누름"),
        },
      },
      delete: {
        tags: ["Products"],
        summary: "상품 좋아요 취소",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "갱신된 상품",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          404: errorResponse("상품 없음"),
          409: errorResponse("좋아요 안 누른 상태"),
        },
      },
    },
    "/products/{id}/comments": {
      get: {
        tags: ["Comments"],
        summary: "상품 댓글 목록 (cursor 페이지네이션)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/idParam" },
          { $ref: "#/components/parameters/cursorParam" },
          { $ref: "#/components/parameters/limitParam" },
        ],
        responses: {
          200: {
            description: "댓글 목록",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CommentList" },
              },
            },
          },
          404: errorResponse("상품 없음"),
        },
      },
      post: {
        tags: ["Comments"],
        summary: "상품 댓글 등록",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentInput" },
            },
          },
        },
        responses: {
          201: {
            description: "등록된 댓글",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Comment" },
              },
            },
          },
          400: errorResponse("입력값 검증 실패"),
          404: errorResponse("상품 없음"),
        },
      },
    },
    "/articles": {
      get: {
        tags: ["Articles"],
        summary: "게시글 목록 조회 (비로그인 가능)",
        parameters: [
          { $ref: "#/components/parameters/pageParam" },
          { $ref: "#/components/parameters/pageSizeParam" },
          { $ref: "#/components/parameters/keywordParam" },
          {
            name: "orderBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["recent", "like"],
              default: "recent",
            },
            description: "recent: 최신순, like: 좋아요 많은 순",
          },
        ],
        responses: {
          200: {
            description: "게시글 목록",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ArticleList" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Articles"],
        summary: "게시글 등록",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ArticleInput" },
            },
          },
        },
        responses: {
          201: {
            description: "등록된 게시글",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Article" },
              },
            },
          },
          400: errorResponse("입력값 검증 실패"),
          401: errorResponse("토큰 없음/만료"),
        },
      },
    },
    "/articles/{id}": {
      get: {
        tags: ["Articles"],
        summary: "게시글 상세 조회 (비로그인 가능, 로그인 시 isLiked 반영)",
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "게시글 상세",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Article" },
              },
            },
          },
          404: errorResponse("게시글 없음"),
        },
      },
      patch: {
        tags: ["Articles"],
        summary: "게시글 수정 (작성자만)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ArticleInput" },
            },
          },
        },
        responses: {
          200: {
            description: "수정된 게시글",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Article" },
              },
            },
          },
          400: errorResponse("입력값 검증 실패"),
          403: errorResponse("작성자 아님"),
          404: errorResponse("게시글 없음"),
        },
      },
      delete: {
        tags: ["Articles"],
        summary: "게시글 삭제 (작성자만)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          204: { description: "삭제 성공 (본문 없음)" },
          403: errorResponse("작성자 아님"),
          404: errorResponse("게시글 없음"),
        },
      },
    },
    "/articles/{id}/like": {
      post: {
        tags: ["Articles"],
        summary: "게시글 좋아요 추가",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          201: {
            description: "갱신된 게시글 (likeCount/isLiked 반영)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Article" },
              },
            },
          },
          404: errorResponse("게시글 없음"),
          409: errorResponse("이미 좋아요 누름"),
        },
      },
      delete: {
        tags: ["Articles"],
        summary: "게시글 좋아요 취소",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          200: {
            description: "갱신된 게시글",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Article" },
              },
            },
          },
          404: errorResponse("게시글 없음"),
          409: errorResponse("좋아요 안 누른 상태"),
        },
      },
    },
    "/articles/{id}/comments": {
      get: {
        tags: ["Comments"],
        summary: "게시글 댓글 목록 (비로그인 가능, cursor 페이지네이션)",
        parameters: [
          { $ref: "#/components/parameters/idParam" },
          { $ref: "#/components/parameters/cursorParam" },
          { $ref: "#/components/parameters/limitParam" },
        ],
        responses: {
          200: {
            description: "댓글 목록",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CommentList" },
              },
            },
          },
          404: errorResponse("게시글 없음"),
        },
      },
      post: {
        tags: ["Comments"],
        summary: "게시글 댓글 등록",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentInput" },
            },
          },
        },
        responses: {
          201: {
            description: "등록된 댓글",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Comment" },
              },
            },
          },
          400: errorResponse("입력값 검증 실패"),
          404: errorResponse("게시글 없음"),
        },
      },
    },
    "/comments/{id}": {
      patch: {
        tags: ["Comments"],
        summary: "댓글 수정 (작성자만)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentInput" },
            },
          },
        },
        responses: {
          200: {
            description: "수정된 댓글",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Comment" },
              },
            },
          },
          403: errorResponse("작성자 아님"),
          404: errorResponse("댓글 없음"),
        },
      },
      delete: {
        tags: ["Comments"],
        summary: "댓글 삭제 (작성자만)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/idParam" }],
        responses: {
          204: { description: "삭제 성공 (본문 없음)" },
          403: errorResponse("작성자 아님"),
          404: errorResponse("댓글 없음"),
        },
      },
    },
    "/images/upload": {
      post: {
        tags: ["Images"],
        summary: "이미지 업로드 (multipart, 5MB 이하 이미지만)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                    description: "이미지 파일 (필드명 image)",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "업로드 성공",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    url: {
                      type: "string",
                      example:
                        "http://localhost:4000/uploads/1783072608903-505475047.png",
                    },
                  },
                },
              },
            },
          },
          400: errorResponse("파일 없음 / 이미지 아님 / 5MB 초과"),
        },
      },
    },
  },
};

export default swaggerSpec;
