import { InvalidIdError } from "./parseId.js";

export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      // 잘못된 id 입력 (NaN・음수・0・소수)
      if (e instanceof InvalidIdError) {
        return res.status(400).json({ message: e.message });
      }
      // Prisma의 not found 에러
      if (e.code === "P2025") {
        return res.status(404).json({ message: "리소스를 찾을 수 없어요." });
      }
      // 유니크 제약 위반
      if (e.code === "P2002") {
        return res.status(409).json({ message: "중복된 값이에요." });
      }
      // 그 외
      console.error(e);
      res.status(500).json({ message: "서버 오류" });
    }
  };
};
