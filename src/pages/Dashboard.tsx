import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import CalorieRing from '../components/CalorieRing';
import MetricCard from '../components/MetricCard';
import TrendChart from '../components/TrendChart';

const today = new Date().toISOString().split('T')[0];

export default function Dashboard() {
  const { currentUser, getFoodEntriesByDate, getExerciseEntriesByDate, getBodyMetricsByUser, getLatestMetric } = useStore();
  const navigate = useNavigate();

  if (!currentUser) return <div className="p-4 text-center text-gray-400">请先添加用户</div>;

  const foodToday = getFoodEntriesByDate(currentUser.id, today);
  const exerciseToday = getExerciseEntriesByDate(currentUser.id, today);
  const metrics = getBodyMetricsByUser(currentUser.id);
  const latest = getLatestMetric(currentUser.id);

  const totalIntake = foodToday.reduce((s, e) => s + e.calories, 0);
  const totalBurned = exerciseToday.reduce((s, e) => s + e.caloriesBurned, 0);

  // 最近7天体重趋势
  const last7 = metrics.slice(-7).map(m => ({ date: m.date, 体重: m.weight ?? 0 }));

  return (
    <div className="p-4 space-y-4">
      {/* 欢迎 */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 text-white">
        <div className="text-lg font-bold">你好，{currentUser.avatar} {currentUser.name}</div>
        <div className="text-sm opacity-80 mt-0.5">目标体重 {currentUser.targetWeight} kg · 今日目标 {currentUser.dailyCalorieGoal} kcal</div>
      </div>

      {/* 卡路里环 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
        <CalorieRing intake={totalIntake} burned={totalBurned} goal={currentUser.dailyCalorieGoal} />
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate('/food')}
            className="flex items-center gap-2 bg-green-500 text-white rounded-xl px-4 py-2 text-sm font-medium"
          >
            <Plus size={16} /> 记录饮食
          </button>
          <button
            onClick={() => navigate('/exercise')}
            className="flex items-center gap-2 bg-orange-500 text-white rounded-xl px-4 py-2 text-sm font-medium"
          >
            <Plus size={16} /> 记录运动
          </button>
          <button
            onClick={() => navigate('/metrics')}
            className="flex items-center gap-2 bg-blue-500 text-white rounded-xl px-4 py-2 text-sm font-medium"
          >
            <Plus size={16} /> 记录指标
          </button>
        </div>
      </div>

      {/* 今日关键指标 */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon="⚖️" label="当前体重" value={latest?.weight ?? '--'} unit="kg"
          color={latest?.weight && latest.weight > currentUser.targetWeight ? 'text-orange-500' : 'text-green-600'}
          subtext={latest?.weight ? `目标差 ${(latest.weight - currentUser.targetWeight).toFixed(1)} kg` : undefined}
        />
        <MetricCard icon="🚶" label="今日步数" value={latest?.steps ?? '--'} unit="步"
          color={(latest?.steps ?? 0) >= 8000 ? 'text-green-600' : 'text-gray-800'}
          subtext={(latest?.steps ?? 0) >= 8000 ? '已达标' : '目标 8000 步'}
        />
        <MetricCard icon="❤️" label="心率" value={latest?.heartRate ?? '--'} unit="bpm"
          color="text-red-500"
        />
        <MetricCard icon="😴" label="昨晚睡眠" value={latest?.sleepHours ?? '--'} unit="h"
          color={(latest?.sleepHours ?? 0) >= 7 ? 'text-blue-600' : 'text-orange-500'}
        />
      </div>

      {/* 体重趋势 */}
      {last7.length > 0 && (
        <TrendChart
          title="近7天体重趋势"
          data={last7}
          lines={[{ key: '体重', color: '#22c55e', label: '体重(kg)' }]}
        />
      )}

      {/* 今日饮食/运动摘要 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-3 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">今日饮食</div>
          <div className="text-base font-bold text-green-600">{Math.round(totalIntake)} kcal</div>
          <div className="text-xs text-gray-400">{foodToday.length} 条记录</div>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">今日运动</div>
          <div className="text-base font-bold text-orange-500">{Math.round(totalBurned)} kcal</div>
          <div className="text-xs text-gray-400">
            {exerciseToday.reduce((s, e) => s + e.duration, 0)} 分钟
          </div>
        </div>
      </div>
    </div>
  );
}
