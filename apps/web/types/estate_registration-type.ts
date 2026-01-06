export interface EstateRegistration {
  user_id: string;           // 계정 (ID)
  address_name: string;      // 주소명 (지번)
  address_road_name: string; // 도로명 주소
  address_x: number;         // 경도 (x)
  address_y: number;         // 위도 (y)
  
  deposit: number | string;      // 보증금
  monthly_rent: number | string; // 월 임대료
  maintenance_fee: number | string; // 관리비
  premium: number | string;         // 권리금
  price_per_pyeong: number | string; // 평당 가격
  
  area: number | string;  // 평수
  floor_info: string;     // 층 위치
  phone_number: string;   // 연락처
  description: string;    // 설명
  images: string[];       // 사진
}