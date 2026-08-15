import { validate, type Struct } from "superstruct";
import type { RequestHandler } from "express";
import { BadRequestError } from "../types/errors";

// struct를 받아 req.body를 검증하는 미들웨어를 만들어주는 함수
// 실패 시 400 에러를 만들어 에러 핸들러로 넘김
// 제네릭으로 어떤 struct든 받을 수 있게 함
export function validateBody<T, S>(struct: Struct<T, S>): RequestHandler {
  return (req, res, next) => {
    const [error] = validate(req.body, struct);
    if (error) {
      return next(
        new BadRequestError(`'${error.path.join(".")}' 값이 올바르지 않아요.`),
      );
    }
    next();
  };
}
