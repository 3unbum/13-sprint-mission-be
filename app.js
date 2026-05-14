import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import Product from "./models/Product.js";
import { asyncHandler } from "./utils/asyncHandler.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.REACT_APP_URL || "http://localhost:3000",
  }),
);
app.use(express.json());
(async () => {
  await connectDB();
  // 여기에 라우트들이 들어갈 자리
  app.post(
    "/products",
    asyncHandler(async (req, res) => {
      const { name, description, price, tags } = req.body;
      const newProduct = await Product.create({
        name,
        description,
        price,
        tags,
      });
      res.status(201).json(newProduct);
    }),
  );

  app.get(
    "/products",
    asyncHandler(async (req, res) => {
      const offset = Math.max(0, parseInt(req.query.offset) || 0);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const sortWhitelist = ["recent"];
      const sort = sortWhitelist.includes(req.query.sort)
        ? req.query.sort
        : "recent";
      const keyword = (req.query.keyword || "").trim().slice(0, 100);

      const filter = keyword
        ? {
            $or: [
              // 안에 든 조건 중 하나라도 맞으면 매칭.
              { name: { $regex: keyword, $options: "i" } }, // $regex: keyword - 해당 필드에 keyword가 부분 문자열로 포함되는지 검사.
              { description: { $regex: keyword, $options: "i" } }, // $options: "i" - 대소문자 무시 (case-insensitive). "Mouse"든 "mouse"든 매칭.
              // keyword가 비어있으면(""는 falsy) filter = {} - 전체 조회.
            ],
          }
        : {};

      const sortOption = sort === "recent" ? { createdAt: -1 } : {};

      const totalCount = await Product.countDocuments(filter);

      const products = await Product.find(filter)
        .sort(sortOption)
        .skip(offset)
        .limit(limit)
        .select("name price createdAt");

      res.json({ list: products, totalCount });
    }),
  );

  app.get(
    "/products/:id",
    asyncHandler(async (req, res) => {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "상품을 찾을 수 없어요." });
      }
      res.json(product);
    }),
  );

  app.patch(
    "/products/:id",
    asyncHandler(async (req, res) => {
      const { name, description, price, tags } = req.body;
      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        { name, description, price, tags },
        {
          returnDocument: "after", // 기본값이 false라서 업데이트 이전 문서가 반환됨. true로 줘야 업데이트 이후 문서가 반환. new 말고 returnDocument 쓰라고함.
          runValidators: true, // 기본값은 false라서 업데이트 시 스키마 검증을 안 함. true로 줘야 검증 함.
        },
      );
      if (!updated) {
        return res.status(404).json({ message: "상품을 찾을 수 없어요." });
      }
      res.json(updated);
    }),
  );

  app.delete(
    "/products/:id",
    asyncHandler(async (req, res) => {
      const deleted = await Product.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "상품을 찾을 수 없어요." });
      }
      res.json({ message: "삭제되었어요.", data: deleted });
    }),
  );

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중이에요! 🚀`);
  });
})();
