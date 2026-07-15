import * as userService from "../services/userService.js";
import asyncHandler from "../middlewares/asyncHandler.js";

// POST /auth/signUp
export const signUp = asyncHandler(async (req, res) => {
  const user = await userService.signUp(req.body);
  const accessToken = userService.getAccessToken(user);
  const refreshToken = userService.getRefreshToken(user);

  res.status(201).json({ accessToken, refreshToken, user });
});

// POST /auth/singIn
export const signIn = asyncHandler(async (req, res) => {
  const user = await userService.signIn(req.body);
  const accessToken = userService.getAccessToken(user);
  const refreshToken = userService.getRefreshToken(user);

  res.json({ accessToken, refreshToken, user });
});
