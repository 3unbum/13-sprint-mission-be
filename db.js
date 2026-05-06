import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB 연결 성공!");
  } catch (error) {
    console.error("❌ MongoDB 연결 실패:", error.message);
    process.exit(1); // 연결 실패 시 서버 종료
  }
}

export default connectDB;
