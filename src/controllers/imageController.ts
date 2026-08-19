import asyncHandler from "../middlewares/asyncHandler";
import { BadRequestError } from "../types/errors";

// POST /images/upload - 앞단의 multer가 파일을 저장하고 req.file을 채워줌
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("이미지 파일을 함께 보내주세요.");
  }
  const { location } = req.file as Express.MulterS3.File;
  res.status(201).json({ url: location });
});
