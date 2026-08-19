import { RequestHandler } from "express";

// async 컨트롤러를 감싸 에러를 next()로 넘김
export default function asyncHandler(handler: RequestHandler): RequestHandler {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
