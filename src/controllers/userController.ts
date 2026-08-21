import * as userService from "../services/userService";
import asyncHandler from "../middlewares/asyncHandler";
import { getUserId } from "../middlewares/auth";

// GET /users/me (인증 필요)
// verifyAccessToken 미들웨어가 req.auth.userId를 채워준다.
export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMe(getUserId(req));
  res.json(user);
});
