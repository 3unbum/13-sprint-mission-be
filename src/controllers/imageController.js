import asyncHandler from "../middlewares/asyncHandler.js";

// POST /images/upload - 앞단의 multer가 파일을 저장하고 req.file을 채워줌
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error("이미지 파일을 함께 보내주세요.");
    error.status = 400;
    throw error;
  }
  // app.js의 express.static("/uploads")로 접근 가능한 URL을 만들어 반환
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});
