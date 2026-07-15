// async 컨틀롤러를 감싸 에러를 next()로 넘김
// 이걸 쓰면 컨트롤러마다 try/catch를 반복하지 않아도 됨
export default function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
