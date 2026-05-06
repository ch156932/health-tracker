import { useStore } from '../store/useStore';
import { generateAdvice, type Advice, type AdviceLevel, type HealthScore } from '../store/adviceEngine';

const LEVEL_STYLES: Record<AdviceLevel, { bg: string; border: string; badge: string; dot: string }> = {
  danger:  { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-500 text-white',    dot: 'bg-red-500' },
  warning: { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-400 text-white',  dot: 'bg-amber-400' },
  success: { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-500 text-white',  dot: 'bg-green-500' },
  tip:     { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-400 text-white',   dot: 'bg-blue-400' },
};

const LEVEL_LABELS: Record<AdviceLevel, string> = {
  danger: '需立即改善', warning: '需要注意', success: '保持良好', tip: '小建议',
};

function ScoreRing({ score, label, size = 64 }: { score: number; label: string; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={size * 0.1} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size * 0.1}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset 0.6s' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

function HealthScoreCard({ score }: { score: HealthScore }) {
  const color = score.total >= 75 ? 'text-green-600' : score.total >= 50 ? 'text-amber-500' : 'text-red-500';
  const label = score.total >= 80 ? '优秀' : score.total >= 65 ? '良好' : score.total >= 50 ? '一般' : '需改善';
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">综合健康评分</h3>
      <div className="flex items-center gap-4">
        {/* 总分大圆环 */}
        <div className="relative w-24 h-24 shrink-0">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="36" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle cx="48" cy="48" r="36" fill="none"
              stroke={score.total >= 75 ? '#22c55e' : score.total >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 36}
              strokeDashoffset={2 * Math.PI * 36 * (1 - score.total / 100)}
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
              style={{ transition: 'stroke-dashoffset 0.6s' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${color}`}>{score.total}</span>
            <span className={`text-xs font-medium ${color}`}>{label}</span>
          </div>
        </div>
        {/* 分项小环 */}
        <div className="grid grid-cols-5 gap-1 flex-1">
          <ScoreRing score={score.weight}   label="体重" />
          <ScoreRing score={score.diet}     label="饮食" />
          <ScoreRing score={score.exercise} label="运动" />
          <ScoreRing score={score.sleep}    label="睡眠" />
          <ScoreRing score={score.body}     label="体成分" />
        </div>
      </div>
    </div>
  );
}

function AdviceCard({ advice }: { advice: Advice }) {
  const s = LEVEL_STYLES[advice.level];
  return (
    <div className={`rounded-2xl border p-4 ${s.bg} ${s.border}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">{advice.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm text-gray-800">{advice.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${s.badge}`}>{LEVEL_LABELS[advice.level]}</span>
            <span className="text-xs text-gray-400">{advice.category}</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-2">{advice.detail}</p>
          <div className="flex items-start gap-1.5">
            <span className="text-xs font-medium text-gray-500 shrink-0 mt-0.5">💡 建议：</span>
            <p className="text-xs text-gray-700 leading-relaxed">{advice.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SmartAdvice() {
  const { currentUser, getBodyMetricsByUser, foodEntries, exerciseEntries } = useStore();

  if (!currentUser) return null;

  const metrics = getBodyMetricsByUser(currentUser.id);
  const userFood = foodEntries.filter(e => e.userId === currentUser.id);
  const userExercise = exerciseEntries.filter(e => e.userId === currentUser.id);

  if (metrics.length === 0 && userFood.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
        <div className="text-4xl mb-3">🤖</div>
        <div className="font-semibold text-gray-700 mb-1">数据不足，无法生成建议</div>
        <div className="text-sm text-gray-400">请先录入至少7天的体重、饮食和运动数据</div>
      </div>
    );
  }

  const { advices, score } = generateAdvice({
    user: currentUser,
    metrics,
    foodEntries: userFood,
    exerciseEntries: userExercise,
  });

  const dangerCount = advices.filter(a => a.level === 'danger').length;
  const warningCount = advices.filter(a => a.level === 'warning').length;
  const successCount = advices.filter(a => a.level === 'success').length;

  return (
    <div className="space-y-4">
      {/* 评分卡 */}
      <HealthScoreCard score={score} />

      {/* 统计摘要 */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-red-50 rounded-xl py-2 border border-red-100">
          <div className="text-lg font-bold text-red-500">{dangerCount}</div>
          <div className="text-red-400">需立即改善</div>
        </div>
        <div className="bg-amber-50 rounded-xl py-2 border border-amber-100">
          <div className="text-lg font-bold text-amber-500">{warningCount}</div>
          <div className="text-amber-400">需要注意</div>
        </div>
        <div className="bg-green-50 rounded-xl py-2 border border-green-100">
          <div className="text-lg font-bold text-green-500">{successCount}</div>
          <div className="text-green-400">保持良好</div>
        </div>
      </div>

      {/* 建议列表 */}
      <div className="space-y-3">
        {advices.map(advice => (
          <AdviceCard key={advice.id} advice={advice} />
        ))}
      </div>

      {/* 免责说明 */}
      <div className="text-xs text-gray-400 text-center pb-2">
        以上建议基于历史数据的规则分析，仅供参考，不构成医疗建议。
      </div>
    </div>
  );
}
