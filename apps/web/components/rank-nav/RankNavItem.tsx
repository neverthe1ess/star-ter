import { RankItem } from '@/hooks/useRevenueRanking';

type RankNavItemProps = {
  item: RankItem;
  rank: number;
  onClick: () => void;
  disabled: boolean;
  formatAmount: (amount: number) => string;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  fluctuation: number;
};

const changeLabelMap: Record<string, string> = {
  HH: '정체 상권',
  LL: '변동 상권',
  HL: '위험 상권',
  LH: '뜨는 상권',
};

export default function RankNavItem({
  item,
  rank,
  onClick,
  disabled,
  formatAmount,
  fluctuation,
}: RankNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid grid-cols-11 gap-4 w-full items-center rounded-xl border border-transparent bg-gray-50/80 px-2 py-4 text-left transition hover:border-gray-200 hover:bg-white disabled:cursor-wait disabled:opacity-70 group"
      disabled={disabled}
    >
      {/* Rank & Name Section */}
      <div className="col-span-4 flex items-center gap-3 overflow-hidden">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
          {rank}
        </span>

        <span className="truncate text-base font-semibold text-gray-900">
          {item.name}
        </span>
      </div>

      {/* Value */}
      <div className="col-span-3 text-right">
        <span className="text-base font-bold text-gray-900">
          {formatAmount(item.amount)}
        </span>
      </div>

      {/* Fluctuation */}
      <div className="col-span-2 flex justify-end">
        <div
          className={`flex items-center text-xs font-bold ${
            fluctuation > 0
              ? 'text-red-500'
              : fluctuation < 0
                ? 'text-blue-500'
                : 'text-gray-500'
          }`}
        >
          {fluctuation > 0 ? '▲' : fluctuation < 0 ? '▼' : '-'}
          <span className="ml-1">{Math.abs(fluctuation)}%</span>
        </div>
      </div>

      {/* Badge */}
      <div className="col-span-2 flex justify-end">
        {(() => {
          const label =
            changeLabelMap[item.changeType || ''] ||
            item.changeType ||
            '정보 없음';
          let badgeClass = 'bg-gray-100 text-gray-700';

          if (label.includes('뜨는') || label.includes('축소')) {
            badgeClass = 'bg-blue-100 text-blue-700';
          } else if (label.includes('위험') || label.includes('확장')) {
            badgeClass = 'bg-red-100 text-red-700';
          } else if (label.includes('변동')) {
            badgeClass = 'bg-amber-100 text-amber-700';
          }

          return (
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-bold text-nowrap ${badgeClass}`}
            >
              {label}
            </span>
          );
        })()}
      </div>
    </button>
  );
}
