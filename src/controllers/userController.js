import * as userService from "../services/userService.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// GET /users/me (인증 필요)
// verifyAccessToken 미들웨어가 req.auth.userId를 채워준다.
export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMe(req.auth.userId);
  res.json(user);
});
