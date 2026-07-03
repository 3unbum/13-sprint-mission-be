import { validate } from "superstruct";

// struct를 받아 req.body를 검증하는 미들웨어를 만들어주는 함수
// 실패 시 400 에러를 만들어 에러 핸들러로 넘김
export function validateBody(struct) {
  return (req, res, next) => {
    const [error] = validate(req.body, struct);
    if (error) {
      const err = new Error(`'${error.path.join(".")}' 값이 올바르지 않아요.`);
      err.status = 400;
      return next(err);
    }
    next();
  };
}
