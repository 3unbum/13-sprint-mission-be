import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger.js";

import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import imageRouter from "./routes/imageRouter.js";
import commentRouter from "./routes/commentRouter.js";
import articleRouter from "./routes/articleRouter.js";

const app = express();

// ── 전역 미들웨어 ──────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL, // 프론트(localhost:3000)만 허용
  }),
);
app.use(express.json()); // JSON 요청 본문 파싱
app.use("/uploads", express.static("uploads")); // 업로드된 이미지 정적 제공

// ── 헬스체크 ───────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "판다마켓 API 서버가 살아있어요 🐼" });
});

// ── 라우터 ─────────────────────────────
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/images", imageRouter);
app.use("/comments", commentRouter);
app.use("/articles", articleRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── 에러 핸들러 (모든 라우터 뒤에 위치) ─
// ErrorRequestHandler 타입을 붙이면 err•req•res•next 타입이 한 번에 추론된다.
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err.name === "MulterError") {
    return res.status(400).json({
      message: "파일 업로드에 실패했어요. (5MB 이하 이미지만 가능해요)",
    });
  }
  const status = err.status ?? 500;

  // 우리가 의도한 에러 (4xx)만 메시지를 그대로 전달한다.
  // 500은 Prisma 쿼리문·제약조건명 같은 내부 정보가 섞일 수 있어 서버 로그로만 남긴다.
  if (status >= 500) {
    console.error("[500]", req.method, req.originalUrl, err);
    return res.status(500).json({ message: "서버 오류가 발생했어요." });
  }

  res.status(status).json({ message: err.message });
};

app.use(errorHandler);

// ── 서버 시작 ──────────────────────────
const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중 : http://localhost:${PORT}`);
});

export default app;
