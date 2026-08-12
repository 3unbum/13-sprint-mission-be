import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/userRepository.js";

// 응답에선 비밀번호 해시는 절대 내보내지 않음
function filterSensitiveUserData(user) {
  const { encryptedPassword, ...rest } = user;
  return rest;
}

// accessToken 발급 (payload에 userId만 담는다)
function createToken(user, type = "access") {
  const payload = { userId: user.id };
  const options = {
    expiresIn:
      type === "refresh"
        ? process.env.JWT_REFRESH_EXPIRES
        : process.env.JWT_ACCESS_EXPIRES,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

// 회원가입
export async function signUp({ email, nickname, password }) {
  // 이메일 중복 체크 (409 Conflict - 현재 리소스 상태와 충돌)
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const error = new Error("이미 사용 중인 이메일이에요.");
    error.status = 409;
    throw error;
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
export async function signIn({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error("이메일 또는 비밀번호가 올바르지 않아요.");
    error.status = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.encryptedPassword);
  if (!isValid) {
    const error = new Error("이메일 또는 비밀번호가 올바르지 않아요.");
    error.status = 401;
    throw error;
  }

  return filterSensitiveUserData(user);
}

// 내 정보 보회
export async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error("유저를 찾을 수 없어요.");
    error.status = 404;
    throw error;
  }
  return filterSensitiveUserData(user);
}

// 토큰 발급 (컨트롤러에서 사용)
export function getAccessToken(user) {
  return createToken(user, "access");
}
export function getRefreshToken(user) {
  return createToken(user, "refresh");
}
