import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./models/Product.js";

dotenv.config();

const seedData = [
  {
    name: "맥북 프로 16 M2 Pro",
    description:
      "2023년 구매한 맥북 프로 16인치, 16GB/512GB. 박스, 충전기 풀구성. 사용감 적고 키보드 깨끗합니다.",
    price: 2800000,
    tags: ["전자제품", "노트북", "애플"],
  },
  {
    name: "아이폰 14 Pro 256GB 딥퍼플",
    description:
      "배터리 성능 89%, 액정 무파손. 케이스 끼고 사용해서 외관 깨끗해요. 직거래 선호합니다.",
    price: 850000,
    tags: ["전자제품", "스마트폰", "애플"],
  },
  {
    name: "에어팟 프로 2세대",
    description:
      "선물 받았는데 사용하지 않아 판매합니다. 미개봉 새상품이고 영수증 있어요.",
    price: 270000,
    tags: ["전자제품", "이어폰", "미개봉"],
  },
  {
    name: "닌텐도 스위치 OLED",
    description:
      "화이트 색상, 박스풀구성. 젤다 카트리지 같이 드려요. 화면 기스 없습니다.",
    price: 320000,
    tags: ["전자제품", "게임기", "닌텐도"],
  },
  {
    name: "다이슨 V12 무선청소기",
    description:
      "1년 사용했고 필터 새로 교체했어요. 헤드 4개 풀세트 포함. 이사로 인한 처분.",
    price: 480000,
    tags: ["가전", "청소기", "다이슨"],
  },
  {
    name: "이케아 말름 4단 서랍장",
    description:
      "화이트 색상, 큰 흠집 없어요. 직접 가지러 오시는 분께 드립니다. 마포구 합정동.",
    price: 50000,
    tags: ["가구", "수납", "이케아"],
  },
  {
    name: "허먼밀러 에어론 사이즈 B",
    description:
      "리마스터드 모델, 풀로디드 옵션. 4년 사용했으나 상태 매우 좋음. 12년 보증서 양도 가능.",
    price: 1200000,
    tags: ["가구", "의자", "사무용품"],
  },
  {
    name: "나이키 에어포스1 270mm",
    description:
      "두 번 신었어요. 사이즈 안 맞아서 판매합니다. 박스 있고 더스트백 포함.",
    price: 95000,
    tags: ["패션", "신발", "나이키"],
  },
  {
    name: "유니클로 후리스 자켓 L",
    description:
      "작년 겨울 구매, 몇 번 안 입었습니다. 네이비 색상이고 보풀 거의 없어요.",
    price: 25000,
    tags: ["패션", "의류", "겨울옷"],
  },
  {
    name: "캐논 EOS R6 바디",
    description:
      "셔터수 8000컷 미만. 박스, 배터리 2개, 충전기 포함. 입문자에게 추천드립니다.",
    price: 1850000,
    tags: ["전자제품", "카메라", "캐논"],
  },
  {
    name: "스탠리 텀블러 30oz",
    description:
      "한정판 색상이고 사용감 거의 없어요. 손잡이 흠집 없습니다.",
    price: 35000,
    tags: ["생활용품", "텀블러"],
  },
  {
    name: "해리포터 양장본 전권 세트",
    description:
      "1~7권 전권 세트. 책장에 보관만 했어요. 책날개 깨끗합니다.",
    price: 80000,
    tags: ["도서", "소설", "전집"],
  },
  {
    name: "LG 그램 17 2024",
    description:
      "i7-1360P/16GB/512GB. 가벼워서 출퇴근용으로 사용했습니다. 정품 파우치 포함.",
    price: 1450000,
    tags: ["전자제품", "노트북", "LG"],
  },
  {
    name: "스타벅스 다이어리 2026",
    description:
      "미사용 새 상품. 그린 컬러이고 굿즈 모두 포함되어 있어요.",
    price: 18000,
    tags: ["문구", "다이어리", "굿즈"],
  },
  {
    name: "스피닝 자전거 (실내용)",
    description:
      "코로나 때 구매해서 거의 안 썼어요. 직접 가지러 오시는 분만 가능합니다. 서울 강남.",
    price: 150000,
    tags: ["스포츠", "운동기구"],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ DB 연결 성공");

  await Product.deleteMany({});
  console.log("🗑️  기존 데이터 삭제 완료");

  await Product.insertMany(seedData);
  console.log(`🌱 시드 데이터 ${seedData.length}개 삽입 완료`);

  await mongoose.disconnect();
  console.log("👋 DB 연결 종료");
}

seed();
