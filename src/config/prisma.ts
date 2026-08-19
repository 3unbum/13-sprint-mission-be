// Prisma 클라이언트 싱글톤
// PrismaClient를 여러 번 new 하면 DB 커넥션이 계속 늘어나므로,
// 앱 전체에서 이 인스턴스 하나만 import 해서 재사용함
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
