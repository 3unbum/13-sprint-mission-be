import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = "uploads";
fs.mkdirSync(UPLOAD_DIR, { recursive: true }); // 폴더 없으면 생성 (gitignore 대상이라)

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // 파일명 충돌 방지 : 타임스탬프-랜덤 + 원본 확장자
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

// 이미지 mimetype만 허용
function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith("image/")) return cb(null, true);
  const error = new Error("이미지 파일만 업로드할 수 있어요.");
  error.status = 400;
  cb(error);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
