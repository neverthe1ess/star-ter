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

export type GetPersonalizationResponse = UpdateOnboardingParams;

export type UpdateProfileParams = {
  nickname?: string;
  file?: File;
};

export type UpdateProfileResponse = {
  nickname?: string;
  profile_image_key?: string | null;
};
