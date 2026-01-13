import { getScoreColor } from './constants';

interface ScoreRowProps {
  label: string;
  score: number;
  explanation: string;
  userValue: string;
}

export function ScoreRow({
  label,
  score,
  explanation,
  userValue,
}: ScoreRowProps) {
  const { text, bg } = getScoreColor(score);
  const percentage = Math.round(score * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-900">{label}</h4>
            <span className={`text-lg font-black ${text}`}>{percentage}%</span>
          </div>

          {/* 프로그레스 바 */}
          <div className="h-2 bg-slate-100 rounded-full mb-3 overflow-hidden">
            <div
              className={`h-full ${bg} rounded-full transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <span className="text-slate-400 shrink-0">사장님 선택:</span>
            <span className="font-medium text-slate-600">{userValue}</span>
          </div>
          <p className="text-slate-700 mt-2 leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  );
}
