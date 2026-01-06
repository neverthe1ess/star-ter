const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface UploadResponse {
  success: boolean;
  url: string;
  key: string;
}

export const uploadService = {
  async uploadImage(file: File): Promise<UploadResponse> {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '이미지 업로드에 실패했습니다.');
    }

    return response.json();
  },
};
