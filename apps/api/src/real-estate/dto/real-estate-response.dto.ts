export interface RealEstateResponseDto {
  id: string;
  address_name: string | null;
  address_road_name: string | null;
  address_x: number | null;
  address_y: number | null;
  deposit: number | null;
  monthly_rent: number | null;
  premium: number | null;
  floor_info: string | null;
}
