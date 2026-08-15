import type { Prisma, User } from "@prisma/client";
import prisma from "../config/prisma";

// 이메일로 유저 찾기 (로그인•중복확인용)
export async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

// id로 유저 찾기 (내 정보 조회용)
export async function findById(id: number): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

// 유저 생성 (회원가입)
export async function create(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({ data });
}
