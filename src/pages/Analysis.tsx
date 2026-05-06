import { useState } from 'react';
import { useStore } from '../store/useStore';
import TrendChart from '../components/TrendChart';
import CompareChart from '../components/CompareChart';
import SmartAdvice from '../components/SmartAdvice';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

type Mode = 'advice' | 'trend' | 'compare';
type Period = 30 | 60 | 90;
type TrendMetric = 'weight' | 'bmi' | 'bodyFat' | 'steps' | 'heartRate'
  | 'muscleMass' | 'skeletalMuscleMass' | 'bodyWater' | 'proteinPercentage' | 'boneMass' | 'bmr';

const METRIC_LABELS: Record<TrendMetric, string> = {
  weight: '体重(kg)', bmi: 'BMI', bodyFat: '体脂(%)', steps: '步数', heartRate: '心率',
  muscleMass: '肌肉量(kg)', skeletalMuscleMass: '骨骼肌量(kg)',
  bodyWater: '水分率(%)', proteinPercentage: '蛋白质(%)',
  boneMass: '骨盐量(kg)', bmr: '基础代谢(kcal)',
};
const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

export default function Analysis() {
  const { users, currentUser, getBodyMetricsByUser, getFoodEntriesByDate, getExerciseEntriesByDate } = useStore();
  const [mode, setMode] = useState<Mode>('advice');
  const [period, setPeriod] = useState<Period>(30);
  const [metric, setMetric] = useState<TrendMetric>('weight');

  if (!currentUser) return null;

  // 个人趋势数据
  const userMetrics = getBodyMetricsByUser(currentUser.id);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - period);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const trendData = userMetrics
    .filter(m => m.date >= cutoffStr)
    .map(m => ({ date: m.date, [metric]: m[metric] ?? 0 }));

  // 横向对比：所有用户最新指标
  const compareMetrics: { title: string; data: { name: string; value: number }[]; unit: string }[] = [
    {
      title: '体重对比', unit: 'kg',
      data: users.map(u => {
        const m = getBodyMetricsByUser(u.id).slice(-1)[0];
        return { name: u.name, value: m?.weight ?? 0 };
      }),
    },
    {
      title: '步数对比', unit: '步',
      data: users.map(u => {
        const m = getBodyMetricsByUser(u.id).slice(-1)[0];
        return { name: u.name, value: m?.steps ?? 0 };
      }),
    },
    {
      title: '体脂率对比', unit: '%',
      data: users.map(u => {
        const m = getBodyMetricsByUser(u.id).slice(-1)[0];
        return { name: u.name, value: m?.bodyFat ?? 0 };
      }),
    },
  ];

  // 近7天营养素饼图
  const last7 = getLast7Days();
  const nutrientTotals = { 蛋白质: 0, 碳水: 0, 脂肪: 0 };
  for (const date of last7) {
    const entries = getFoodEntriesByDate(currentUser.id, date);
    for (const e of entries) {
      nutrientTotals['蛋白质'] += e.protein;
      nutrientTotals['碳水'] += e.carbs;
      nutrientTotals['脂肪'] += e.fat;
    }
  }
  const nutrientData = Object.entries(nutrientTotals).map(([name, value]) => ({
    name, value: Math.round(value),
  }));

  // 近7天卡路里收支
  const calorieData = last7.map(date => {
    const intake = getFoodEntriesByDate(currentUser.id, date).reduce((s, e) => s + e.calories, 0);
    const burned = getExerciseEntriesByDate(currentUser.id, date).reduce((s, e) => s + e.caloriesBurned, 0);
    return { date: date.slice(5), 摄入: Math.round(intake), 消耗: Math.round(burned) };
  });

  return (
    <div className="p-4 space-y-4">
      {/* 模式切换 */}
      <div className="flex bg-gray-100 rounded-2xl p-1">
        <button
          onClick={() => setMode('advice')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'advice' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
        >
          🤖 智能建议
        </button>
        <button
          onClick={() => setMode('trend')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'trend' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
        >
          个人趋势
        </button>
        <button
          onClick={() => setMode('compare')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${mode === 'compare' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
        >
          多人对比
        </button>
      </div>

      {mode === 'advice' && <SmartAdvice />}

      {mode === 'trend' && (
        <>
          {/* 时间段选择 */}
          <div className="flex gap-2">
            {([30, 60, 90] as Period[]).map(p => (
              <button key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-medium ${period === p ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                {p}天
              </button>
            ))}
          </div>

          {/* 指标选择 */}
          <div className="flex gap-1.5 flex-wrap">
            {(Object.keys(METRIC_LABELS) as TrendMetric[]).map(m => (
              <button key={m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${metric === m ? 'bg-green-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
              >
                {METRIC_LABELS[m]}
              </button>
            ))}
          </div>

          {/* 趋势图 */}
          {trendData.length > 0 ? (
            <TrendChart
              title={`${currentUser.name} · ${METRIC_LABELS[metric]} · 近${period}天`}
              data={trendData}
              lines={[{ key: metric, color: '#22c55e', label: METRIC_LABELS[metric] }]}
              height={220}
            />
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm shadow-sm">
              暂无数据
            </div>
          )}

          {/* 营养素分析 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">近7天营养素比例</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={nutrientData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                  dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {nutrientData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: unknown) => { const n = typeof v === 'number' ? v : Number(v); return [`${n}g`, ''] as [string, string]; }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 卡路里收支 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">近7天卡路里收支</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={calorieData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="摄入" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="消耗" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {mode === 'compare' && (
        <>
          {compareMetrics.map(({ title, data, unit }) => (
            <CompareChart key={title} title={title} data={data} unit={unit} height={160} />
          ))}
          {/* BMI 对比 */}
          <CompareChart
            title="BMI 对比"
            unit=""
            height={160}
            data={users.map(u => {
              const m = getBodyMetricsByUser(u.id).slice(-1)[0];
              return { name: u.name, value: m?.bmi ?? 0 };
            })}
          />
        </>
      )}
    </div>
  );
}
