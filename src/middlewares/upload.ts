import multer, { FileFilterCallback } from "multer";
import multerS3 from "multer-s3";
import type { Request } from "express";
import path from "path";
import { s3 } from "../config/s3";
import { env } from "../config/env";
import { BadRequestError } from "../types/errors";

// 이미지 mimetype만 허용
function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) {
  if (file.mimetype.startsWith("image/")) return cb(null, true);
  cb(new BadRequestError("이미지 파일만 업로드할 수 있어요."));
}

export const upload = multer({
  // 기존 diskStorage(서버 디스크)에서 S3로 교체
  // EC2가 교체•재배포되어도 이미지가 남아있어야 하므로 서버 밖에 저장한다
  storage: multerS3({
    s3,
    bucket: env.aws.publicBucket,
    // 원본 파일의 Content-Type을 그대로 보존
    // 이게 없으면 브라우저가 이미지를 다운로드로 처리할 수 있음
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      // 파일명 충돌 방지: 타임스탬프-랜덤 + 원본 확장자
      // (한글 파일명이 S3 키로 들어가면 URL 인코딩 문제가 생겨 원본명은 안 씀)
      const ext = path.extname(file.originalname);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `public/${unique}${ext}`);
    },
  }),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
