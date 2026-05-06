interface CalorieRingProps {
  intake: number;
  burned: number;
  goal: number;
}

export default function CalorieRing({ intake, burned, goal }: CalorieRingProps) {
  const net = intake - burned;
  const remaining = Math.max(0, goal - net);
  const ratio = Math.min(1, net / goal);
  const r = 48;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - ratio);

  const color = ratio > 1 ? '#ef4444' : ratio > 0.85 ? '#f59e0b' : '#22c55e';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle
            cx="64" cy="64" r={r}
            fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 64 64)"
            style={{ transition: 'stroke-dashoffset 0.5s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-500">净摄入</span>
          <span className="text-xl font-bold text-gray-800">{Math.round(net)}</span>
          <span className="text-xs text-gray-400">千卡</span>
        </div>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <div className="text-center">
          <div className="font-semibold text-green-600">{Math.round(intake)}</div>
          <div>摄入</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-orange-500">{Math.round(burned)}</div>
          <div>消耗</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-blue-600">{Math.round(remaining)}</div>
          <div>剩余</div>
        </div>
      </div>
    </div>
  );
}
