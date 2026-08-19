import {
  object,
  string,
  integer,
  array,
  size,
  min,
  optional,
  partial,
} from "superstruct";

// 상품 등록 body 규칙
// - size(문자열, 최소, 최대) : 길이 제한
// - min(integer(), 0) : 0 이상 정수
// - 이미지 최대 3개는 스키마가 아니라 여기서 검증 (요구사항)
export const CreateProduct = object({
  name: size(string(), 1, 30),
  description: size(string(), 1, 1000),
  price: min(integer(), 0),
  tags: optional(array(size(string(), 1, 20))),
  images: optional(size(array(string()), 0, 3)),
});

// 수정은 모든 필드가 선택 (보내는 필드만 검증)
export const UpdateProduct = partial(CreateProduct);
