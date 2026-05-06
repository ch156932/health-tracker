import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { FoodEntry, MealType } from '../types';
import { FOOD_DATABASE } from '../types';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '零食',
};
const MEAL_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

interface AddFoodModalProps {
  date: string;
  userId: string;
  onClose: () => void;
  onAdd: (entry: Omit<FoodEntry, 'id'>) => void;
}

const PORTION_OPTIONS = [
  { label: '半份', mult: 0.5 },
  { label: '1份', mult: 1 },
  { label: '1.5份', mult: 1.5 },
  { label: '2份', mult: 2 },
];

function AddFoodModal({ date, userId, onClose, onAdd }: AddFoodModalProps) {
  const [meal, setMeal] = useState<MealType>('lunch');
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState<typeof FOOD_DATABASE[0] | null>(null);
  const [portionMult, setPortionMult] = useState(1);
  const [customG, setCustomG] = useState('');
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });

  const filtered = search
    ? FOOD_DATABASE.filter(f => f.name.includes(search)).slice(0, 8)
    : FOOD_DATABASE.slice(0, 6);

  const calcFromFood = (f: typeof FOOD_DATABASE[0], mult: number, grams?: number) => {
    const g = grams ?? f.portion * mult;
    return {
      name: f.name,
      calories: Math.round(f.calories * g / 100).toString(),
      protein: (f.protein * g / 100).toFixed(1),
      carbs: (f.carbs * g / 100).toFixed(1),
      fat: (f.fat * g / 100).toFixed(1),
    };
  };

  const selectFood = (f: typeof FOOD_DATABASE[0]) => {
    setSelectedFood(f);
    setPortionMult(1);
    setCustomG('');
    setForm(calcFromFood(f, 1));
    setSearch('');
  };

  const handlePortionMult = (mult: number) => {
    setPortionMult(mult);
    setCustomG('');
    if (selectedFood) setForm(calcFromFood(selectedFood, mult));
  };

  const handleCustomG = (val: string) => {
    setCustomG(val);
    if (selectedFood && val) setForm(calcFromFood(selectedFood, 1, parseFloat(val)));
  };

  const handleSubmit = () => {
    if (!form.name || !form.calories) return;
    onAdd({
      userId, date, mealType: meal,
      name: form.name,
      calories: parseFloat(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fat: parseFloat(form.fat) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-10 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">添加饮食</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {/* 餐次选择 */}
        <div className="flex gap-2">
          {(Object.keys(MEAL_LABELS) as MealType[]).map(m => (
            <button key={m} onClick={() => setMeal(m)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-medium ${meal === m ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {MEAL_ICONS[m]} {MEAL_LABELS[m]}
            </button>
          ))}
        </div>
        {/* 搜索食物 */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索食物（如：酸辣汤、鸡蛋、米饭…）"
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm outline-none" />
        </div>
        {/* 食物列表 */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {filtered.map(f => (
            <button key={f.name} onClick={() => selectFood(f)}
              className={`w-full flex justify-between items-center px-3 py-2.5 text-sm border-b border-gray-100 last:border-0 ${selectedFood?.name === f.name ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
              <span className="font-medium">{f.name}</span>
              <span className="text-gray-400 text-xs">{Math.round(f.calories * f.portion / 100)}kcal / {f.portion}g(1份)</span>
            </button>
          ))}
          {search && filtered.length === 0 && (
            <div className="px-3 py-3 text-xs text-gray-400 text-center">未找到"{search}"，可手动填写</div>
          )}
        </div>
        {/* 份量选择（选中食物后显示） */}
        {selectedFood && (
          <div className="bg-green-50 rounded-2xl p-3 space-y-2">
            <div className="text-xs text-green-700 font-medium">已选：{selectedFood.name}（1份={selectedFood.portion}g）</div>
            <div className="flex gap-2">
              {PORTION_OPTIONS.map(p => (
                <button key={p.label} onClick={() => handlePortionMult(p.mult)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-medium ${portionMult === p.mult && !customG ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 shrink-0">自定义：</span>
              <input value={customG} onChange={e => handleCustomG(e.target.value)}
                type="number" placeholder="输入克数(g)"
                className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm outline-none" />
              <span className="text-xs text-gray-400">g</span>
            </div>
          </div>
        )}
        {/* 营养数值（可编辑） */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500 font-medium">营养信息（可手动修改）</div>
          <input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
            placeholder="食物名称 *" className="w-full px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none" />
          <div className="grid grid-cols-2 gap-2">
            {[
              ['卡路里(kcal) *', 'calories'],
              ['蛋白质(g)', 'protein'],
              ['碳水(g)', 'carbs'],
              ['脂肪(g)', 'fat'],
            ].map(([ph, key]) => (
              <input key={key} value={form[key as keyof typeof form]}
                onChange={e => setForm(s => ({ ...s, [key]: e.target.value }))}
                placeholder={ph} type="number"
                className="px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none" />
            ))}
          </div>
        </div>
        <button onClick={handleSubmit}
          className="w-full bg-green-500 text-white rounded-xl py-3 font-medium text-sm">
          添加记录
        </button>
      </div>
    </div>
  );
}

export default function FoodLog() {
  const { currentUser, foodEntries, addFoodEntry, deleteFoodEntry } = useStore();
  const [date, setDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);

  if (!currentUser) return null;
  const dateStr = formatDate(date);
  const entries = foodEntries.filter(e => e.userId === currentUser.id && e.date === dateStr);
  const totalCals = entries.reduce((s, e) => s + e.calories, 0);
  const progress = Math.min(1, totalCals / currentUser.dailyCalorieGoal);

  const adjustDate = (d: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + d);
    if (next <= new Date()) setDate(next);
  };

  const isToday = dateStr === formatDate(new Date());

  return (
    <div className="p-4 space-y-4">
      {/* 日期导航 */}
      <div className="bg-white rounded-2xl p-3 flex items-center justify-between shadow-sm">
        <button onClick={() => adjustDate(-1)}><ChevronLeft size={20} className="text-gray-400" /></button>
        <span className="font-medium text-sm">{isToday ? '今天' : dateStr}</span>
        <button onClick={() => adjustDate(1)} disabled={isToday}>
          <ChevronRight size={20} className={isToday ? 'text-gray-200' : 'text-gray-400'} />
        </button>
      </div>

      {/* 卡路里进度 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">今日摄入</span>
          <span className="font-semibold">{Math.round(totalCals)} / {currentUser.dailyCalorieGoal} kcal</span>
        </div>
        <div className="bg-gray-100 rounded-full h-2.5">
          <div className="h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%`, background: progress > 1 ? '#ef4444' : '#22c55e' }} />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-center text-gray-500">
          {[
            ['蛋白质', entries.reduce((s, e) => s + e.protein, 0).toFixed(1), 'g', 'text-blue-600'],
            ['碳水', entries.reduce((s, e) => s + e.carbs, 0).toFixed(1), 'g', 'text-yellow-600'],
            ['脂肪', entries.reduce((s, e) => s + e.fat, 0).toFixed(1), 'g', 'text-red-500'],
          ].map(([label, v, u, color]) => (
            <div key={label as string}>
              <div className={`font-bold text-sm ${color}`}>{v}{u}</div>
              <div>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 按餐次展示 */}
      {(Object.keys(MEAL_LABELS) as MealType[]).map(mealType => {
        const mealEntries = entries.filter(e => e.mealType === mealType);
        const mealCals = mealEntries.reduce((s, e) => s + e.calories, 0);
        return (
          <div key={mealType} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-medium text-sm">{MEAL_ICONS[mealType]} {MEAL_LABELS[mealType]}</span>
              <span className="text-xs text-gray-400">{Math.round(mealCals)} kcal</span>
            </div>
            {mealEntries.map(e => (
              <div key={e.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm">{e.name}</div>
                  <div className="text-xs text-gray-400">
                    P:{e.protein.toFixed(1)}g  C:{e.carbs.toFixed(1)}g  F:{e.fat.toFixed(1)}g
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-green-600">{e.calories} kcal</span>
                  <button onClick={() => deleteFoodEntry(e.id)}>
                    <Trash2 size={14} className="text-gray-300 hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
            {mealEntries.length === 0 && (
              <div className="px-4 py-2 text-xs text-gray-300">暂无记录</div>
            )}
          </div>
        );
      })}

      {/* 添加按钮 */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 right-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg text-white"
      >
        <Plus size={24} />
      </button>

      {showAdd && (
        <AddFoodModal
          date={dateStr}
          userId={currentUser.id}
          onClose={() => setShowAdd(false)}
          onAdd={addFoodEntry}
        />
      )}
    </div>
  );
}
