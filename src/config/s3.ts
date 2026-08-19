import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

// S3 클라이언트 싱글톤
// 요청마다 새로 만들면 커넥션이 낭비되므로 한 번만 생성해 재사용
export const s3 = new S3Client({
  region: env.aws.region,
  credentials: {
    accessKeyId: env.aws.accessKeyId,
    secretAccessKey: env.aws.secretAccessKey,
  },
});
