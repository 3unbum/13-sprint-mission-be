import { object, string, size } from "superstruct";

// 댓글 등록•수정 body 규칙
export const CreateComment = object({
  content: size(string(), 1, 300),
});
