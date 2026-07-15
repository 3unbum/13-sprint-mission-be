import prisma from "../config/prisma.js";

// 이메일로 유저 찾기 (로그인•중복확인용)
export async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

// id로 유저 찾기 (내 정보 조회용)
export async function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

// 유저 생성 (회원가입)
export async function create(data) {
  return prisma.user.create({ data });
}
