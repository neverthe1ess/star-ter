export type UpdateOnboardingParams = {
  age: string;
  region: string;
  operatingTime: string;
  capital: string;
  industryCode?: string | null;
};

export type UpdateOnboardingResponse = {
  ok: boolean;
};
