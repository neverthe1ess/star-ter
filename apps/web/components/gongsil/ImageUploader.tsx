'use client';

interface ImageUploaderProps {
  images: string[];
  onChange: (newImages: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* 이미지 미리보기 리스트 */}
        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
          <span className="text-2xl text-gray-400">+</span>
        </div>
      </div>
      <p className="text-xs text-gray-500">사진은 최대 10장까지 업로드 가능합니다.</p>
    </div>
  );
}
