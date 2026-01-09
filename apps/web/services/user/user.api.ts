import type {
  UpdateOnboardingParams,
  GetPersonalizationResponse,
  UpdateProfileParams,
  UpdateProfileResponse,
} from './user.api.types';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type ErrorResponse = {
  message?: string;
};

export async function updateOnboarding(
  params: UpdateOnboardingParams,
): Promise<void> {
  const response = await fetch(`${baseUrl}/users/onboarding`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    try {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData?.message || '온보딩 저장에 실패했습니다.');
    } catch {
      throw new Error('온보딩 저장에 실패했습니다.');
    }
  }
}

export async function getPersonalization(): Promise<GetPersonalizationResponse> {
  const response = await fetch(`${baseUrl}/users/personalization`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    try {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData?.message || '개인화 정보 조회에 실패했습니다.');
    } catch {
      throw new Error('개인화 정보 조회에 실패했습니다.');
    }
  }

  return response.json() as Promise<GetPersonalizationResponse>;
}

export async function updateProfile(
  params: UpdateProfileParams,
): Promise<UpdateProfileResponse> {
  const formData = new FormData();
  if (params.nickname) {
    formData.append('nickname', params.nickname);
  }
  if (params.file) {
    formData.append('file', params.file);
  }

  const response = await fetch(`${baseUrl}/users/profile`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    try {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData?.message || '프로필 저장에 실패했습니다.');
    } catch {
      throw new Error('프로필 저장에 실패했습니다.');
    }
  }

  return response.json() as Promise<UpdateProfileResponse>;
}
