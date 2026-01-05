import { API_ENDPOINTS } from '@/config/api';

export interface RegisterRealEstateParams {
  address_name: string;
  address_road_name: string;
  address_x: number;
  address_y: number;
  deposit?: number;
  monthly_rent?: number;
  maintenance_fee?: number;
  premium?: number;
  area?: number;
  price_per_pyeong?: number;
  floor_info?: string;
  phone_number?: string;
}

export const realEstateService = {
  async register(params: RegisterRealEstateParams) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(API_ENDPOINTS.REAL_ESTATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('LOGOUT_REQUIRED');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '부동산 등록에 실패했습니다.');
    }

    return response.json();
  },
};
