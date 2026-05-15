import "dotenv/config";
import express from "express";
import cors from "cors";
import productRouter from "./routes/product.routes.js";
import articleRouter from "./routes/article.routes.js";
import commentRouter from "./routes/comment.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: process.env.REACT_APP_URL || "http://localhost:3000" }));
app.use(express.json());
app.get("/health", (req, res) => res.json({ status: "OK" }));

app.use("/products", productRouter);
app.use("/articles", articleRouter);
app.use("/comments", commentRouter);

app.listen(PORT, "0.0.0.0", () =>
  console.log(`서버가 http://localhost:${PORT}에서 실행 중이에요! 🚀`),
);
