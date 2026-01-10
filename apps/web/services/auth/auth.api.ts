import type {
  ErrorResponse,
  RegisterParams,
  RegisterResponse,
  LoginParams,
  LoginResponse,
  UserProfile,
} from './auth.api.types';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export async function regist(params: RegisterParams): Promise<RegisterResponse> {
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    try {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData?.message || '회원가입에 실패했습니다.');
    } catch {
      throw new Error('회원가입에 실패했습니다.');
    }
  }

  return response.json() as Promise<RegisterResponse>;
}

export async function login(params: LoginParams): Promise<LoginResponse> {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    try {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData?.message || '로그인에 실패했습니다.');
    } catch {
      throw new Error('로그인에 실패했습니다.');
    }
  }

  return response.json() as Promise<LoginResponse>;
}

export async function logout(): Promise<void> {
  const response = await fetch(`${baseUrl}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    try {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData?.message || '로그아웃에 실패했습니다.');
    } catch {
      throw new Error('로그아웃에 실패했습니다.');
    }
  }
}

export async function getProfile(): Promise<UserProfile> {
  const response = await fetch(`${baseUrl}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    try {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData?.message || '사용자 정보 조회에 실패했습니다.');
    } catch {
      throw new Error('사용자 정보 조회에 실패했습니다.');
    }
  }

  return response.json() as Promise<UserProfile>;
}
