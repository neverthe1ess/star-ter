export type ErrorResponse = {
  message?: string;
};

export type RegisterParams = {
  email: string;
  nickname: string;
  password: string;
};

export type RegisterResponse = {
  id: string;
  nickname: string;
};

export type LoginParams = {
  email: string;
  password: string;
};

export type LoginResponse = {
  id: string;
  nickname: string;
  on_boarding_completed: boolean;
};

export type UserProfile = {
  id: string;
  nickname: string;
  on_boarding_completed: boolean;
};
