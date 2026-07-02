import express from "express";
import cors from "cors";
import "dotenv/config";

import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";

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

// ── 에러 핸들러 (모든 라우터 뒤에 위치) ─
// 매개변수 4개(err, req, res, next)여야 Express가 에러 핸들러로 인식한다.
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.status ?? 500;
  res.status(status).json({
    message: err.message ?? "서버 오류가 발생햇어요.",
  });
});

// ── 서버 시작 ──────────────────────────
const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중 : http://localhost:${PORT}`);
});

export default app;
