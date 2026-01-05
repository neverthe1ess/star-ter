import { API_ENDPOINTS } from '@/config/api';

export interface RegisterRealEstateParams {
  name?: string;
  address?: string;
  roadaddress?: string;
  centerlatitude: number;
  centerlongitude: number;
  title?: string;
  deposit?: number;
  monthlyrent?: number;
  maintenancefee?: number;
  premium?: number;
  areaprice?: number;
  size?: number;
  floor?: number;
  groundfloor?: number;
  businesslargecodename?: string;
  businessmiddlecodename?: string;
  nearsubwaystation?: string;
  ismoveindate?: boolean;
  moveindate?: string;
  previewphotourl?: string;
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
