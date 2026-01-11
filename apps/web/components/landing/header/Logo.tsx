'use client';

export function Logo({ className = 'h-8' }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-2xl font-bold text-blue-900">Starter</span>
    </div>
  );
}
