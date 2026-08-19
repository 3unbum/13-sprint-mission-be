// jest.config.js
const { createDefaultPreset } = require("ts-jest");

// ts-jest가 .ts 파일을 자동으로 변환해주는 기본 설정을 가져온다.
// Jest 자체는 TypeScript를 모르기 때문에 변환기가 필요함
const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  // Express 서버용 - 브라우저 (jsdom)가 아닌 Node 환경에서 테스트함
  testEnvironment: "node",

  transform: {
    ...tsJestTransformCfg,
  },

  // 소스와 나란히 둔 *.test.ts 파일만 테스트로 인식한다.
  testMatch: ["**/src/**/*.test.ts"],

  // 커버리지 측정 대상
  // 테스트 파일 자신과 타입 선언 파일은 제외
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/**/*.test.{js,ts}",
    "!src/**/*.d.ts",
  ],
};
