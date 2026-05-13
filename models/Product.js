import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name 은 필수예요."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "description 은 필수예요."],
    },
    price: {
      type: Number,
      required: [true, "price 는 필수예요."],
      min: [0, "price 는 0 이상이어야 해요."],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }, // createdAt, updatedAt 자동 생성/갱신
);

const Product = mongoose.model("Product", productSchema);

export default Product;
