import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`TRUNCATE TABLE "products", "articles", "comments" RESTART IDENTITY CASCADE`;

  // 2. Product 생성 (중고마켓)
  await prisma.product.createMany({
    data: [
      {
        name: "맥북 프로 14인치 M2",
        description: "2023년 구매, 박스풀, 상태 좋음",
        price: 1800000,
        tags: ["전자기기", "노트북", "애플"],
      },
      {
        name: "에어팟 프로 2세대",
        description: "거의 새 제품, 사용 2개월. 케이스 살짝 기스 있음",
        price: 220000,
        tags: ["전자기기", "이어폰", "애플"],
      },
      {
        name: "닌텐도 스위치 OLED",
        description: "젤다 게임 포함, 추가 컨트롤러 1개 같이 드려요",
        price: 350000,
        tags: ["전자기기", "게임기", "닌텐도"],
      },
      {
        name: "허먼밀러 에어론 의자",
        description: "리퍼브 제품, 등받이 메쉬 깨끗합니다",
        price: 900000,
        tags: ["가구", "의자", "사무용"],
      },
      {
        name: "유니클로 히트텍 라운드넥 (남성 L)",
        description: "새 제품, 사이즈 안 맞아서 양도",
        price: 8000,
        tags: ["의류", "남성", "겨울"],
      },
      {
        name: "다이슨 V15 무선청소기",
        description: "1년 사용, 배터리 상태 양호. 모든 헤드 포함",
        price: 650000,
        tags: ["가전", "청소기", "다이슨"],
      },
      {
        name: "스타벅스 텀블러 (한정판)",
        description: "2024 벚꽃 시즌 텀블러, 미개봉",
        price: 35000,
        tags: ["생활용품", "텀블러", "스타벅스"],
      },
      {
        name: "아이폰 15 Pro 256GB 티타늄",
        description: "케이스+필름 사용, 무흠집. 통신 락 없음",
        price: 1250000,
        tags: ["전자기기", "스마트폰", "애플"],
      },
      {
        name: "한강 자전거 (삼천리 헬리오스)",
        description: "주말에만 탔어요. 안장 새 거로 교체함",
        price: 95000,
        tags: ["스포츠", "자전거", "야외활동"],
      },
      {
        name: "원두커피 1kg (에티오피아 예가체프)",
        description: "로스팅 2주 이내, 직접 로스팅한 원두예요",
        price: 18000,
        tags: ["식품", "커피", "원두"],
      },
    ],
  });

  // 3. Article 생성 (자유게시판)
  await prisma.article.createMany({
    data: [
      {
        title: "강아지 키우는 분들 정보 공유해요",
        content:
          "최근에 골든 리트리버를 입양했는데 사료 추천이나 산책 코스 같은 정보 나누면 좋을 것 같아요. 강남쪽 모임 어떠세요?",
      },
      {
        title: "이번 주말에 한강에서 피크닉 같이 가실 분?",
        content:
          "토요일 오후에 뚝섬한강공원에서 피크닉 계획 중입니다. 함께하실 분 댓글 남겨주세요!",
      },
      {
        title: "ChatGPT vs Claude 사용 후기",
        content:
          "두 달간 둘 다 써본 결과를 공유합니다. 코딩은 Claude가 더 잘하는 느낌이고, 일반 글쓰기는 비슷한 듯해요.",
      },
      {
        title: "강남 점심 맛집 추천 받습니다",
        content:
          "회사가 강남으로 이전해서 점심 메뉴 고르기가 힘드네요. 1만원 내외로 추천해주세요!",
      },
      {
        title: "재택근무 vs 출근, 어느 게 더 좋으세요?",
        content:
          "팀에서 다음 달부터 풀출근으로 바뀐다는데 다들 어떻게 생각하시는지 궁금해요.",
      },
      {
        title: "헬스 초보 운동 루틴 공유",
        content:
          "헬스 3개월차 28세 남자입니다. PT 안 받고 짠 루틴인데 피드백 환영해요. (월수금 분할 / 화목 유산소)",
      },
      {
        title: "넷플릭스 추천작 좀 알려주세요",
        content:
          "주말에 볼 만한 드라마나 영화 추천해주세요. 스릴러나 SF 좋아해요!",
      },
      {
        title: "전세 vs 월세, 지금 시기 고민",
        content:
          "결혼 준비 중인데 부동산 시장이 너무 불안정해서 결정을 못 하겠어요. 비슷한 고민 해보신 분?",
      },
      {
        title: "30대에 시작한 영어공부, 6개월 후기",
        content:
          "토익 500점에서 시작해서 어제 모의고사 750점 나왔어요. 사용한 교재랑 루틴 공유합니다.",
      },
      {
        title: "에어컨 청소 셀프로 가능할까요?",
        content:
          "스탠드형 에어컨인데 청소 업체 부르면 10만원이라고 해서요. 직접 해보신 분 있으시면 후기 부탁드려요.",
      },
    ],
  });

  // 4. Comment 생성 (★ FK 주의)
  await prisma.comment.createMany({
    data: [
      // Product 1 (맥북) 댓글
      { content: "혹시 충전기는 포함인가요?", productId: 1 },
      { content: "직거래 가능한 지역이 어디세요?", productId: 1 },
      { content: "사용 기간이 어느정도 되시나요?", productId: 1 },

      // Product 2 (에어팟) 댓글
      { content: "노이즈캔슬링 잘 되나요?", productId: 2 },

      // Product 3 (닌텐도) 댓글
      { content: "젤다 외에 다른 게임 카트리지도 있나요?", productId: 3 },
      { content: "조이콘 드리프트 없죠?", productId: 3 },

      // Product 6 (다이슨) 댓글
      { content: "구매 영수증 있으시면 a/s에 좋을 텐데요", productId: 6 },

      // Product 8 (아이폰) 댓글
      { content: "배터리 효율 몇 % 인가요?", productId: 8 },
      { content: "혹시 자급제인가요?", productId: 8 },

      // Product 10 (원두) 댓글
      { content: "산미는 어느 정도인가요?", productId: 10 },

      // Article 1 (강아지) 댓글
      { content: "저도 골든 키워요! 정보 공유해요 🐶", articleId: 1 },
      {
        content: "강남쪽이면 양재천 산책로 자주 가요. 함께 가요!",
        articleId: 1,
      },

      // Article 2 (피크닉) 댓글
      { content: "저 참여하고 싶어요! 몇 시쯤 모이시나요?", articleId: 2 },

      // Article 3 (ChatGPT vs Claude) 댓글
      {
        content: "저는 둘 다 유료로 쓰는데 Claude가 한국어 자연스러운 듯해요",
        articleId: 3,
      },
      {
        content: "코딩 작업에서 Claude의 컨텍스트가 길어서 좋더라구요",
        articleId: 3,
      },

      // Article 4 (강남 점심) 댓글
      {
        content: "역삼역 근처 '봉피양' 추천드려요. 평양냉면 맛집!",
        articleId: 4,
      },

      // Article 6 (헬스 루틴) 댓글
      {
        content: "주 5일이면 회복이 부족할 수도. 분할 다시 짜보세요",
        articleId: 6,
      },

      // Article 9 (영어공부) 댓글
      {
        content:
          "와 6개월에 250점 올리신 거 진짜 대단하네요. 교재 좀 알려주세요!",
        articleId: 9,
      },
    ],
  });

  console.log("✅ 시드 완료");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
