import { object, string, size, partial } from "superstruct";

export const CreateArticle = object({
  title: size(string(), 1, 50),
  content: size(string(), 1, 1000),
});

export const UpdateArticle = partial(CreateArticle);
