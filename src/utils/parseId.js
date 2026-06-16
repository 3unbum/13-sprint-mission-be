// 라우트 파라미터(id)를 안전하게 양의 정수로 변환한다.
// "abc"(NaN), "-1"(음수), "0", "1.5"(소수) 같은 잘못된 입력은
// 에러를 던지고, asyncHandler가 이를 400으로 변환한다.
export class InvalidIdError extends Error {
  constructor(message = "유효하지 않은 ID예요.") {
    super(message);
    this.name = "InvalidIdError";
  }
}

export function parseId(raw) {
  const id = Number(raw);
  // 정수가 아니거나 (NaN・소수 포함) 1 미만이면 거부
  if (!Number.isInteger(id) || id < 1) {
    throw new InvalidIdError();
  }
  return id;
}
