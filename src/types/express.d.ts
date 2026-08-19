// express-jwt가 채워주는 req.auth를 Request 타입에 추가한다
declare global {
  namespace Express {
    export interface Request {
      auth?: {
        userId: number;
      };
    }
  }
}

export {};
