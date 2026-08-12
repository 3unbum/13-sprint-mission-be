import asyncHandler from "../middlewares/asyncHandler.js";

// POST /images/upload - 앞단의 multer가 파일을 저장하고 req.file을 채워줌
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error("이미지 파일을 함께 보내주세요.");
    error.status = 400;
    throw error;
  }
  // 배포 환경에선 req.get("host")가 내부 호스트로 잡힐 수 있어 환경변수로 고정
  const baseUrl =
    process.env.SERVER_URL ?? `${req.protocol}://${req.get("host")}`;
  const url = `${baseUrl}/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});
