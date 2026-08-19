import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/userRepository";
import * as userService from "./userService";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../types/errors";

// 리포지토리는 통째로 모킹 (DB 없이 테스트)
jest.mock("../repositories/userRepository");
const mockedRepo = userRepository as jest.Mocked<typeof userRepository>;

// bcrypt는 실제로 돌리면 해싱이 느려서(salt 10라운드) 테스트가 느려진다.
// 또한 "해시가 맞는지"가 아니라 "해싱을 호출했는지"를 검증하는 게 목적이라 모킹
jest.mock("bcrypt");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// DB에서 꺼낸 유저 (해시 비밀번호를 가지고 있음)
function makeUser(overrides = {}) {
  return {
    id: 1,
    email: "test@example.com",
    nickname: "판다",
    image: null,
    encryptedPassword: "$2b$10$해시된비밀번호",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  } as any;
}

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 토큰 발급에 필요한 환경변수를 테스트용으로 고정
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_ACCESS_EXPIRES = "1h";
    process.env.JWT_REFRESH_EXPIRES = "2w";
  });

  describe("signUp - 회원가입", () => {
    const input = {
      email: "new@example.com",
      nickname: "새판다",
      password: "password123",
    };

    test("새 이메일이면 비밀번호를 해싱해 저장한다", async () => {
      // Setup
      mockedRepo.findByEmail.mockResolvedValue(null); // 중복 없음
      mockedBcrypt.hash.mockResolvedValue("hashed!" as never);
      mockedRepo.create.mockResolvedValue(
        makeUser({ email: input.email, nickname: input.nickname }),
      );

      // Exercise
      const result = await userService.signUp(input);

      // Assertion
      expect(mockedRepo.findByEmail).toHaveBeenCalledWith(input.email);
      // salt rounds 10으로 해싱해야 한다
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(input.password, 10);
      // 평문이 아니라 해시가 저장되어야 한다
      expect(mockedRepo.create).toHaveBeenCalledWith({
        email: input.email,
        nickname: input.nickname,
        encryptedPassword: "hashed!",
      });
      expect(result.email).toBe(input.email);
    });

    test("응답에 비밀번호 해시가 포함되지 않는다", async () => {
      mockedRepo.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue("hashed!" as never);
      mockedRepo.create.mockResolvedValue(makeUser());

      const result = await userService.signUp(input);

      // 민감정보가 클라이언트로 새어나가면 안 된다
      expect(result).not.toHaveProperty("encryptedPassword");
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("nickname");
    });

    test("이미 가입된 이메일이면 ConflictError를 던진다", async () => {
      mockedRepo.findByEmail.mockResolvedValue(makeUser());

      await expect(userService.signUp(input)).rejects.toThrow(ConflictError);

      // 중복이면 해싱도 저장도 하지 않아야 한다
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(mockedRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("signIn - 로그인", () => {
    const input = { email: "test@example.com", password: "password123" };

    test("이메일과 비밀번호가 맞으면 유저 정보를 반환한다", async () => {
      mockedRepo.findByEmail.mockResolvedValue(makeUser());
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await userService.signIn(input);

      // 평문과 저장된 해시를 비교해야 한다
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        input.password,
        "$2b$10$해시된비밀번호",
      );
      expect(result.email).toBe("test@example.com");
      expect(result).not.toHaveProperty("encryptedPassword");
    });

    test("존재하지 않는 이메일이면 UnauthorizedError를 던진다", async () => {
      mockedRepo.findByEmail.mockResolvedValue(null);

      await expect(userService.signIn(input)).rejects.toThrow(
        UnauthorizedError,
      );
    });

    test("비밀번호가 틀리면 UnauthorizedError를 던진다", async () => {
      mockedRepo.findByEmail.mockResolvedValue(makeUser());
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(userService.signIn(input)).rejects.toThrow(
        UnauthorizedError,
      );
    });

    test("이메일이 틀렸을 때와 비밀번호가 틀렸을 때의 메시지가 같다", async () => {
      // 메시지가 다르면 "이 이메일은 가입되어 있다"는 정보가 새어나가
      // 계정 열거(user enumeration) 공격에 악용될 수 있다
      mockedRepo.findByEmail.mockResolvedValue(null);
      const noEmail = await userService.signIn(input).catch((e) => e.message);

      mockedRepo.findByEmail.mockResolvedValue(makeUser());
      mockedBcrypt.compare.mockResolvedValue(false as never);
      const wrongPw = await userService.signIn(input).catch((e) => e.message);

      expect(noEmail).toBe(wrongPw);
    });
  });

  describe("getAccessToken / getRefreshToken - 토큰 발급", () => {
    // 앞의 bcrypt처럼 통째로 모킹하지 않고, jwt.sign만 감시 (spy)한다
    // spyOn은 원본 모듈을 살려둔 채 특정 메서드만 가로채는 방식
    let signSpy: jest.SpyInstance;

    beforeEach(() => {
      signSpy = jest
        .spyOn(jwt, "sign")
        .mockReturnValue("fake.jwt.token" as never);
    });

    afterEach(() => {
      // spy는 원본을 복원해줘야 다른 테스트에 영향이 없음
      signSpy.mockRestore();
    });

    test("accessToken은 userId를 담아 1시간 만료로 발급된다", () => {
      const token = userService.getAccessToken({ id: 42 });

      expect(signSpy).toHaveBeenCalledWith({ userId: 42 }, "test-secret", {
        expiresIn: "1h",
      });
      expect(token).toBe("fake.jwt.token");
    });

    test("refreshToken은 더 긴 만료시간으로 발급된다", () => {
      userService.getRefreshToken({ id: 42 });

      expect(signSpy).toHaveBeenCalledWith({ userId: 42 }, "test-secret", {
        expiresIn: "2w",
      });
    });

    test("토큰 payload에 비밀번호 등 민감정보가 담기지 않는다", () => {
      userService.getAccessToken({ id: 42 });

      // JWT payload는 누구나 디코딩할 수 있으므로 userId만 담아야 한다
      const payload = signSpy.mock.calls[0][0];
      expect(payload).toEqual({ userId: 42 });
    });
  });

  describe("getMe - 내 정보 조회", () => {
    test("존재하는 유저면 정보를 반환한다 (async/await 방식)", async () => {
      mockedRepo.findById.mockResolvedValue(makeUser());

      const result = await userService.getMe(1);

      expect(mockedRepo.findById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
      expect(result).not.toHaveProperty("encryptedPassword");
    });

    // 요구사항에 명시된 done 콜백 방식
    // 교안에서는 async/await를 권장하지만, 비동기 완료를 done() 호출로
    // 알리는 방식도 요구사항에 있음
    test("존재하는 유저면 정보를 반환한다 (done 콜백 방식)", (done) => {
      mockedRepo.findById.mockResolvedValue(makeUser());

      userService
        .getMe(1)
        .then((result) => {
          expect(result.id).toBe(1);
          done(); // 여기서 테스트 종료
        })
        .catch(done); // 에러가 나면 done(error)로 실패 처리
    });

    test("없는 유저면 NotFoundError를 던진다 (done 콜백 방식)", (done) => {
      mockedRepo.findById.mockResolvedValue(null);

      userService.getMe(999).catch((error) => {
        expect(error).toBeInstanceOf(NotFoundError);
        done();
      });
    });
  });
});
