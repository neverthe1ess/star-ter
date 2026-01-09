import {
  Building2,
  Home,
  ShoppingBag,
  GraduationCap,
  Train,
  Map,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Clock,
} from "lucide-react";

export type OnboardingData = {
  age: string;
  region: string;
  operatingTime: string;
  capital: string;
};

export const AGE_OPTIONS = [
  { value: "20s", label: "20대", desc: "젊은 층을 위한 트렌디한 업종" },
  { value: "30s", label: "30대", desc: "안정적인 수익 창출이 가능한 업종" },
  { value: "40s", label: "40대", desc: "경험을 활용할 수 있는 업종" },
  { value: "50s", label: "50대", desc: "노하우 기반의 전문 업종" },
  { value: "60s", label: "60대 이상", desc: "여유로운 운영이 가능한 업종" },
] as const;

export const REGION_OPTIONS = [
  { value: "office", label: "오피스 밀집", Icon: Building2 },
  { value: "residential", label: "주거 밀집", Icon: Home },
  { value: "commercial", label: "상업 지역", Icon: ShoppingBag },
  { value: "university", label: "대학가", Icon: GraduationCap },
  { value: "station", label: "역세권", Icon: Train },
  { value: "tourist", label: "관광지", Icon: Map },
] as const;

export const OPERATING_TIME_OPTIONS = [
  { value: "morning", label: "오전", time: "06:00 - 12:00", Icon: Sunrise },
  { value: "afternoon", label: "오후", time: "12:00 - 18:00", Icon: Sun },
  { value: "evening", label: "저녁", time: "18:00 - 24:00", Icon: Sunset },
  { value: "night", label: "야간", time: "24:00 - 06:00", Icon: Moon },
  { value: "allday", label: "종일", time: "06:00 - 24:00", Icon: Clock },
] as const;

export const CAPITAL_OPTIONS = [
  { value: "10M", label: "1천만원 미만" },
  { value: "30M", label: "1천만원 ~ 3천만원" },
  { value: "50M", label: "3천만원 ~ 5천만원" },
  { value: "100M", label: "5천만원 ~ 1억원" },
  { value: "200M", label: "1억원 ~ 2억원" },
  { value: "200M+", label: "2억원 이상" },
] as const;
