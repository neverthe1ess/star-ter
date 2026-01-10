import type { UpdateOnboardingParams } from './user.api.types';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type ErrorResponse = {
  message?: string;
};

export type OnboardingData = {
  age: string | null;
  region: string | null;
  operatingTime: string | null;
  capital: string | null;
  completed: boolean;
};

export async function getOnboarding(): Promise<OnboardingData | null> {
  try {
    const response = await fetch(`${baseUrl}/users/onboarding`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as OnboardingData;
  } catch {
    return null;
  }
}

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
