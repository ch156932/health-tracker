import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { ExerciseEntry, Intensity } from '../types';
import { EXERCISE_DATABASE } from '../types';

const INTENSITY_LABELS: Record<Intensity, string> = {
  low: '低强度', medium: '中强度', high: '高强度',
};
const INTENSITY_COLORS: Record<Intensity, string> = {
  low: 'bg-blue-100 text-blue-700', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-red-100 text-red-700',
};

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

interface AddExerciseModalProps {
  date: string;
  userId: string;
  userWeight: number;
  onClose: () => void;
  onAdd: (entry: Omit<ExerciseEntry, 'id'>) => void;
}

function AddExerciseModal({ date, userId, userWeight, onClose, onAdd }: AddExerciseModalProps) {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    type: '', name: '', duration: '30', caloriesBurned: '', intensity: 'medium' as Intensity,
  });

  const filtered = search
    ? EXERCISE_DATABASE.filter(e => e.name.includes(search) || e.type.includes(search)).slice(0, 8)
    : EXERCISE_DATABASE.slice(0, 6);

  const selectExercise = (ex: typeof EXERCISE_DATABASE[0]) => {
    const dur = ex.defaultDuration;
    const kcal = Math.round(ex.metValue * userWeight * dur / 60);
    setForm({ type: ex.type, name: ex.name, duration: dur.toString(), caloriesBurned: kcal.toString(), intensity: 'medium' });
    setSearch('');
  };

  const handleDurationChange = (val: string) => {
    const dur = parseFloat(val) || 0;
    const ex = EXERCISE_DATABASE.find(e => e.name === form.name);
    const kcal = ex ? Math.round(ex.metValue * userWeight * dur / 60) : parseFloat(form.caloriesBurned) || 0;
    setForm(s => ({ ...s, duration: val, caloriesBurned: kcal.toString() }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.duration) return;
    onAdd({
      userId, date,
      type: form.type || '其他',
      name: form.name,
      duration: parseFloat(form.duration) || 0,
      caloriesBurned: parseFloat(form.caloriesBurned) || 0,
      intensity: form.intensity,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">添加运动</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索运动..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm outline-none" />
        </div>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {filtered.map(ex => (
            <button key={ex.name} onClick={() => selectExercise(ex)}
              className="w-full flex justify-between items-center px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
            >
              <span>{ex.name}</span>
              <span className="text-gray-400 text-xs">{ex.type} · {ex.defaultDuration}min</span>
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
            placeholder="运动名称 *" className="w-full px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <input value={form.duration} onChange={e => handleDurationChange(e.target.value)}
              placeholder="时长(分钟)" type="number" className="px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none" />
            <input value={form.caloriesBurned} onChange={e => setForm(s => ({ ...s, caloriesBurned: e.target.value }))}
              placeholder="消耗(kcal)" type="number" className="px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none" />
          </div>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as Intensity[]).map(i => (
              <button key={i} onClick={() => setForm(s => ({ ...s, intensity: i }))}
                className={`flex-1 py-1.5 rounded-xl text-xs font-medium ${form.intensity === i ? INTENSITY_COLORS[i] : 'bg-gray-100 text-gray-500'}`}
              >
                {INTENSITY_LABELS[i]}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleSubmit}
          className="w-full bg-orange-500 text-white rounded-xl py-3 font-medium text-sm">
          添加
        </button>
      </div>
    </div>
  );
}

export default function ExerciseLog() {
  const { currentUser, exerciseEntries, addExerciseEntry, deleteExerciseEntry } = useStore();
  const [date, setDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);

  if (!currentUser) return null;
  const dateStr = formatDate(date);
  const entries = exerciseEntries.filter(e => e.userId === currentUser.id && e.date === dateStr);
  const totalCals = entries.reduce((s, e) => s + e.caloriesBurned, 0);
  const totalDur = entries.reduce((s, e) => s + e.duration, 0);
  const isToday = dateStr === formatDate(new Date());

  const adjustDate = (d: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + d);
    if (next <= new Date()) setDate(next);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-2xl p-3 flex items-center justify-between shadow-sm">
        <button onClick={() => adjustDate(-1)}><ChevronLeft size={20} className="text-gray-400" /></button>
        <span className="font-medium text-sm">{isToday ? '今天' : dateStr}</span>
        <button onClick={() => adjustDate(1)} disabled={isToday}>
          <ChevronRight size={20} className={isToday ? 'text-gray-200' : 'text-gray-400'} />
        </button>
      </div>

      {/* 汇总 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orange-50 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{Math.round(totalCals)}</div>
          <div className="text-xs text-gray-500 mt-1">消耗热量 kcal</div>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-500">{totalDur}</div>
          <div className="text-xs text-gray-500 mt-1">运动时长 分钟</div>
        </div>
      </div>

      {/* 运动列表 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {entries.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">今日暂无运动记录</div>
        ) : (
          entries.map(e => (
            <div key={e.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-lg">
                  {e.type === '有氧' ? '🏃' : e.type === '力量' ? '💪' : e.type === '球类' ? '⚽' : '🧘'}
                </div>
                <div>
                  <div className="text-sm font-medium">{e.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${INTENSITY_COLORS[e.intensity]}`}>
                      {INTENSITY_LABELS[e.intensity]}
                    </span>
                    <span className="text-xs text-gray-400">{e.duration} 分钟</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-orange-500">{e.caloriesBurned} kcal</span>
                <button onClick={() => deleteExerciseEntry(e.id)}>
                  <Trash2 size={14} className="text-gray-300 hover:text-red-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg text-white"
      >
        <Plus size={24} />
      </button>

      {showAdd && (
        <AddExerciseModal
          date={dateStr}
          userId={currentUser.id}
          userWeight={75}
          onClose={() => setShowAdd(false)}
          onAdd={addExerciseEntry}
        />
      )}
    </div>
  );
}
