import {
  getScoreColor,
  formatMoney,
  CAPITAL_VALUES,
  USER_LABELS,
} from './constants';

interface CostComparisonRowProps {
  score: number;
  explanation: string;
  userCapital: string;
  actualDeposit: number;
  actualRent: number;
}

export function CostComparisonRow({
  score,
  explanation,
  userCapital,
  actualDeposit,
  actualRent,
}: CostComparisonRowProps) {
  const { text, bg } = getScoreColor(score);
  const percentage = Math.round(score * 100);

  const userBudget = CAPITAL_VALUES[userCapital] || 50000000;
  const actualCost = actualDeposit + actualRent * 12; // 보증금 + 연 임대료
  const maxValue = Math.max(userBudget, actualCost, 1);

  const userBarWidth = Math.min((userBudget / maxValue) * 100, 100);
  const actualBarWidth = Math.min((actualCost / maxValue) * 100, 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-900">창업 비용</h4>
            <span className={`text-lg font-black ${text}`}>{percentage}%</span>
          </div>

          {/* 프로그레스 바 */}
          <div className="h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
            <div
              className={`h-full ${bg} rounded-full transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* 비교 막대 그래프 */}
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-500">사장님 예산</span>
                <span className="font-bold text-emerald-600">
                  {formatMoney(userBudget)}
                </span>
              </div>
              <div className="h-6 bg-slate-100 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-lg flex items-center justify-end pr-2"
                  style={{ width: `${userBarWidth}%` }}
                >
                  {userBarWidth > 30 && (
                    <span className="text-xs text-white font-bold">
                      {USER_LABELS.capital[userCapital]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-500">예상 초기 비용</span>
                <span
                  className={`font-bold ${actualCost > userBudget ? 'text-rose-600' : 'text-blue-600'}`}
                >
                  {formatMoney(actualCost)}
                </span>
              </div>
              <div className="h-6 bg-slate-100 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${actualCost > userBudget ? 'bg-rose-400' : 'bg-blue-400'} rounded-lg flex items-center justify-end pr-2`}
                  style={{ width: `${actualBarWidth}%` }}
                >
                  {actualBarWidth > 30 && (
                    <span className="text-xs text-white font-bold">
                      보증금+연임대료
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="text-slate-700 text-sm leading-relaxed">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
