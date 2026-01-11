export const MACRO_CATEGORIES = {
  I2: '음식',
  P1: '교육',
  Q1: '의료·건강',
  R1: '오락·스포츠',
  S2: '생활서비스',
  I1: '숙박',
  G2: '소매',
} as const;

export type MacroCategoryCode = keyof typeof MACRO_CATEGORIES;

export const INDUSTRY_MAPPING: Record<string, MacroCategoryCode> = {
  // 음식 (I2)
  CS100001: 'I2', // 한식음식점
  CS100002: 'I2', // 중식음식점
  CS100003: 'I2', // 일식음식점
  CS100004: 'I2', // 양식음식점
  CS100005: 'I2', // 제과점
  CS100006: 'I2', // 패스트푸드점
  CS100007: 'I2', // 치킨전문점
  CS100008: 'I2', // 분식전문점
  CS100009: 'I2', // 호프-간이주점
  CS100010: 'I2', // 커피-음료

  // 교육 (P1)
  CS200001: 'P1', // 일반교습학원
  CS200002: 'P1', // 외국어학원
  CS200003: 'P1', // 예술학원
  CS200005: 'P1', // 스포츠 강습

  // 의료·건강 (Q1)
  CS200006: 'Q1', // 일반의원
  CS200007: 'Q1', // 치과의원
  CS200008: 'Q1', // 한의원

  // 오락·스포츠 (R1)
  CS200016: 'R1', // 당구장
  CS200017: 'R1', // 골프연습장
  CS200019: 'R1', // PC방
  CS200024: 'R1', // 스포츠클럽
  CS200037: 'R1', // 노래방

  // 소매 (G2)
  CS300011: 'G2', // 일반의류
  CS300014: 'G2', // 신발
  CS300015: 'G2', // 가방
  CS300016: 'G2', // 안경
  CS300017: 'G2', // 시계및귀금속
  CS300022: 'G2', // 화장품
  CS300001: 'G2', // 슈퍼마켓
  CS300006: 'G2', // 미곡판매
  CS300007: 'G2', // 육류판매
  CS300008: 'G2', // 수산물판매
  CS300009: 'G2', // 청과상
  CS300010: 'G2', // 반찬가게
  CS300031: 'G2', // 가구
  CS300032: 'G2', // 가전제품
  CS300033: 'G2', // 철물점
  CS300035: 'G2', // 인테리어
  CS300036: 'G2', // 조명용품
  CS300018: 'G2', // 의약품
  CS300019: 'G2', // 의료기기
  CS200025: 'S2', // 자동차수리
  CS200026: 'S2', // 자동차미용
  CS200028: 'S2', // 미용실
  CS200029: 'S2', // 네일숍
  CS200030: 'S2', // 피부관리실
  CS200031: 'S2', // 세탁소
  CS200032: 'S2', // 가전제품수리
  CS200033: 'S2', // 부동산중개업
  CS200034: 'I1', // 모텔/여관
  CS200036: 'I1', // 고시원
  CS300002: 'G2', // 편의점
  CS300003: 'G2', // 컴퓨터및주변장치판매
  CS300004: 'G2', // 핸드폰
  CS300020: 'G2', // 서적
  CS300021: 'G2', // 문구
  CS300024: 'G2', // 운동/경기용품
  CS300025: 'G2', // 자전거 및 기타운송장비
  CS300026: 'G2', // 완구
  CS300027: 'G2', // 섬유제품
  CS300028: 'G2', // 화초
  CS300029: 'G2', // 애완동물
  CS300043: 'G2', // 전자상거래업
};

export type IndustryOption = {
  code: string;
  name: string;
  macro: MacroCategoryCode;
};

export const INDUSTRY_OPTIONS: IndustryOption[] = [
  // 음식 (I2)
  { code: 'CS100001', name: '한식음식점', macro: 'I2' },
  { code: 'CS100002', name: '중식음식점', macro: 'I2' },
  { code: 'CS100003', name: '일식음식점', macro: 'I2' },
  { code: 'CS100004', name: '양식음식점', macro: 'I2' },
  { code: 'CS100005', name: '제과점', macro: 'I2' },
  { code: 'CS100006', name: '패스트푸드점', macro: 'I2' },
  { code: 'CS100007', name: '치킨전문점', macro: 'I2' },
  { code: 'CS100008', name: '분식전문점', macro: 'I2' },
  { code: 'CS100009', name: '호프-간이주점', macro: 'I2' },
  { code: 'CS100010', name: '커피-음료', macro: 'I2' },

  // 교육 (P1)
  { code: 'CS200001', name: '일반교습학원', macro: 'P1' },
  { code: 'CS200002', name: '외국어학원', macro: 'P1' },
  { code: 'CS200003', name: '예술학원', macro: 'P1' },
  { code: 'CS200005', name: '스포츠 강습', macro: 'P1' },

  // 의료·건강 (Q1)
  { code: 'CS200006', name: '일반의원', macro: 'Q1' },
  { code: 'CS200007', name: '치과의원', macro: 'Q1' },
  { code: 'CS200008', name: '한의원', macro: 'Q1' },

  // 오락·스포츠 (R1)
  { code: 'CS200016', name: '당구장', macro: 'R1' },
  { code: 'CS200017', name: '골프연습장', macro: 'R1' },
  { code: 'CS200019', name: 'PC방', macro: 'R1' },
  { code: 'CS200024', name: '스포츠클럽', macro: 'R1' },
  { code: 'CS200037', name: '노래방', macro: 'R1' },

  // 소매 (G2)
  { code: 'CS300011', name: '일반의류', macro: 'G2' },
  { code: 'CS300014', name: '신발', macro: 'G2' },
  { code: 'CS300015', name: '가방', macro: 'G2' },
  { code: 'CS300016', name: '안경', macro: 'G2' },
  { code: 'CS300017', name: '시계및귀금속', macro: 'G2' },
  { code: 'CS300022', name: '화장품', macro: 'G2' },
  { code: 'CS300001', name: '슈퍼마켓', macro: 'G2' },
  { code: 'CS300006', name: '미곡판매', macro: 'G2' },
  { code: 'CS300007', name: '육류판매', macro: 'G2' },
  { code: 'CS300008', name: '수산물판매', macro: 'G2' },
  { code: 'CS300009', name: '청과상', macro: 'G2' },
  { code: 'CS300010', name: '반찬가게', macro: 'G2' },
  { code: 'CS300031', name: '가구', macro: 'G2' },
  { code: 'CS300032', name: '가전제품', macro: 'G2' },
  { code: 'CS300033', name: '철물점', macro: 'G2' },
  { code: 'CS300035', name: '인테리어', macro: 'G2' },
  { code: 'CS300036', name: '조명용품', macro: 'G2' },
  { code: 'CS300018', name: '의약품', macro: 'G2' },
  { code: 'CS300019', name: '의료기기', macro: 'G2' },
  { code: 'CS200025', name: '자동차수리', macro: 'S2' },
  { code: 'CS200026', name: '자동차미용', macro: 'S2' },
  { code: 'CS200028', name: '미용실', macro: 'S2' },
  { code: 'CS200029', name: '네일숍', macro: 'S2' },
  { code: 'CS200030', name: '피부관리실', macro: 'S2' },
  { code: 'CS200031', name: '세탁소', macro: 'S2' },
  { code: 'CS200032', name: '가전제품수리', macro: 'S2' },
  { code: 'CS200033', name: '부동산중개업', macro: 'S2' },
  { code: 'CS200034', name: '모텔/여관', macro: 'I1' },
  { code: 'CS200036', name: '고시원', macro: 'I1' },
  { code: 'CS300002', name: '편의점', macro: 'G2' },
  { code: 'CS300003', name: '컴퓨터및주변장치판매', macro: 'G2' },
  { code: 'CS300004', name: '핸드폰', macro: 'G2' },
  { code: 'CS300020', name: '서적', macro: 'G2' },
  { code: 'CS300021', name: '문구', macro: 'G2' },
  { code: 'CS300024', name: '운동/경기용품', macro: 'G2' },
  { code: 'CS300025', name: '자전거 및 기타운송장비', macro: 'G2' },
  { code: 'CS300026', name: '완구', macro: 'G2' },
  { code: 'CS300027', name: '섬유제품', macro: 'G2' },
  { code: 'CS300028', name: '화초', macro: 'G2' },
  { code: 'CS300029', name: '애완동물', macro: 'G2' },
  { code: 'CS300043', name: '전자상거래업', macro: 'G2' },
];
