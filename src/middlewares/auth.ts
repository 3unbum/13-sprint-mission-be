import { expressjwt } from "express-jwt";

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
