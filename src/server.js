import "dotenv/config";
import express from "express";
import cors from "cors";
import productRouter from "./routes/product.routes.js";
import articleRouter from "./routes/article.routes.js";
import commentRouter from "./routes/comment.routes.js";
import prisma from "./lib/prisma.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: process.env.REACT_APP_URL || "http://localhost:3000" }));
app.use(express.json());
app.get("/health", (req, res) => res.json({ status: "OK" }));

app.use("/products", productRouter);
app.use("/articles", articleRouter);
app.use("/comments", commentRouter);

// Prisma는 첫 쿼리 때 연결을 시작하는 lazy 방식이라,
// cold start 환경에서 첫 요청이 연결 비용을 다 떠안는다.
// 미리 연결을 맺은 뒤 서버를 listen 한다.
async function start() {
  await prisma.$connect();
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`서버가 http://localhost:${PORT}에서 실행 중이에요! 🚀`),
  );
}

start();
