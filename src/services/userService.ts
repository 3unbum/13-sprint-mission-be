import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";
import * as userRepository from "../repositories/userRepository.js";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../types/errors";

// 비밀번호 해시를 제외한 응답용 유저 타입
type SafeUser = Omit<User, "encryptedPassword">;

// 응답에선 비밀번호 해시는 절대 내보내지 않음
function filterSensitiveUserData(user: User): SafeUser {
  const { encryptedPassword, ...rest } = user;
  return rest;
}

// accessToken 발급 (payload에 userId만 담는다)
// 토큰 발급에 필요한 건 id 하나뿐이라 Pick으로 최소한만 받는다
function createToken(
  user: Pick<User, "id">,
  type: "access" | "refresh" = "access",
): string {
  const payload = { userId: user.id };
  const options: jwt.SignOptions = {
    expiresIn: (type === "refresh"
      ? process.env.JWT_REFRESH_EXPIRES
      : process.env.JWT_ACCESS_EXPIRES) as jwt.SignOptions["expiresIn"],
  };
  // JWT_SECRET은 string | undefined라 단언 필요
  return jwt.sign(payload, process.env.JWT_SECRET as string, options);
}

// 회원가입
export async function signUp({
  email,
  nickname,
  password,
}: Pick<User, "email" | "nickname"> & { password: string }): Promise<SafeUser> {
  // 이메일 중복 체크 (409 Conflict - 현재 리소스 상태와 충돌)
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new ConflictError("이미 사용 중인 이메일이에요.");
  }

  // 비밀번호 해싱 (salt rounds 10)
  const encryptedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.create({
    email,
    nickname,
    encryptedPassword,
  });

  return filterSensitiveUserData(user);
}

// 로그인 (신원 확인)
export async function signIn({
  email,
  password,
}: Pick<User, "email"> & { password: string }): Promise<SafeUser> {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError("이메일 또는 비밀번호가 올바르지 않아요.");
  }

  const isValid = await bcrypt.compare(password, user.encryptedPassword);
  if (!isValid) {
    throw new UnauthorizedError("이메일 또는 비밀번호가 올바르지 않아요.");
  }

  return filterSensitiveUserData(user);
}

// 내 정보 조회
export async function getMe(userId: number): Promise<SafeUser> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError("유저를 찾을 수 없어요.");
  }
  return filterSensitiveUserData(user);
}

// 토큰 발급 (컨트롤러에서 사용)
export function getAccessToken(user: Pick<User, "id">): string {
  return createToken(user, "access");
}
export function getRefreshToken(user: Pick<User, "id">): string {
  return createToken(user, "refresh");
}
