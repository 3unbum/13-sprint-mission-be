import { expressjwt } from "express-jwt";
import type { Request } from "express";
import { UnauthorizedError } from "../types/errors";

// process.env는 string | undefined라 단언 필요
const JWT_SECRET = process.env.JWT_SECRET as string;

// Authorization 헤더의 Bearer 토큰을 검증하고,
// 성공하면 payload를 req.auth 에 넣어줌 (우리 payload = {userId})
// 검증 실패 시 express-jwt가 401 에러를 throw -> 에러 핸들러로 감
export const verifyAccessToken = expressjwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"],
});

// 토큰이 있으면 검증해 req.auth를 채우고, 없어도 통과 (공개 조회용)
// 비로그인이면 req.auth === undefined
export const optionalAuth = expressjwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"],
  credentialsRequired: false,
});

// 인증이 필수인 핸들러에서 userId를 꺼냄
// verifyAccessToken을 안 거친 라우트에 실수로 붙여도 여기서 401로 막힘
// (req.auth!.userId 단언은 미들웨어 누락을 컴파일 타임에도 런타임에도 못 잡음)
export function getUserId(req: Request): number {
  if (!req.auth) {
    throw new UnauthorizedError("인증이 필요해요.");
  }
  return req.auth.userId;
}
