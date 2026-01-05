export interface RealEstateResponseDto {
  id: string;
  address_name: string | null;
  address_road_name: string | null;
  address_x: number | null;
  address_y: number | null;
  deposit: number | null;
  monthly_rent: number | null;
  premium: number | null;
  price_per_pyeong: number | null;
  area: number | null;
  maintenance_fee: number | null;
  phone_number: string | null;
  floor_info: string | null;
}
