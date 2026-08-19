import "dotenv/config";

// 필수 환경변수를 읽고, 없으면 서버 시작 시점에 바로 죽임
// (런타임에 undefined로 조용히 흘러가 이상한 곳에서 터지는 걸 막음)
function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `환경변수 ${key}가 설정되지 않았어요. .env를 확인해주세요.`,
    );
  }
  return value;
}

// 선택 환경변수 (없으면 기본값)
function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  nodeEnv: optional("NODE_ENV", "development"),
  isProduction: process.env.NODE_ENV === "production",

  port: Number(optional("PORT", "4000")),
  clientUrl: optional("CLIENT_URL", "http://localhost:3000"),

  jwt: {
    secret: required("JWT_SECRET"),
    accessExpires: optional("JWT_ACCESS_EXPIRES", "1h"),
    refreshExpires: optional("JWT_REFRESH_EXPIRES", "2w"),
  },

  aws: {
    region: optional("AWS_REGION", "ap-northeast-2"),
    accessKeyId: required("AWS_ACCESS_KEY_ID"),
    secretAccessKey: required("AWS_SECRET_ACCESS_KEY"),
    publicBucket: required("AWS_PUBLIC_BUCKET_NAME"),
    privateBucket: optional("AWS_PRIVATE_BUCKET_NAME", ""),
  },
};
