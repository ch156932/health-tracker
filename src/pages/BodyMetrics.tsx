import { useState, useRef } from 'react';
import { Plus, Upload, X, Check, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { BodyMetric } from '../types';
import TrendChart from '../components/TrendChart';

interface MetricForm {
  date: string;
  weight: string;
  bodyFat: string;
  steps: string;
  heartRate: string;
  sleepHours: string;
  systolic: string;
  diastolic: string;
  bloodOxygen: string;
  proteinPercentage: string;
  bmr: string;
  bodyWater: string;
  boneMass: string;
  muscleMass: string;
  skeletalMuscleMass: string;
}

const emptyForm = (): MetricForm => ({
  date: new Date().toISOString().split('T')[0],
  weight: '', bodyFat: '', steps: '', heartRate: '',
  sleepHours: '', systolic: '', diastolic: '', bloodOxygen: '',
  proteinPercentage: '', bmr: '', bodyWater: '', boneMass: '',
  muscleMass: '', skeletalMuscleMass: '',
});

interface OCRPreviewModalProps {
  data: Partial<MetricForm>;
  onConfirm: (data: MetricForm) => void;
  onClose: () => void;
}

function OCRPreviewModal({ data, onConfirm, onClose }: OCRPreviewModalProps) {
  const [form, setForm] = useState<MetricForm>({ ...emptyForm(), ...data });
  const set = (k: keyof MetricForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(s => ({ ...s, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-10 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">确认识别数据</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 flex gap-2 text-xs text-yellow-700">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          OCR 识别结果，请核对后确认保存
        </div>
        <div className="space-y-2">
          {[
            ['日期', 'date', 'date'],
            ['体重(kg)', 'weight', 'number'],
            ['体脂(%)', 'bodyFat', 'number'],
            ['步数', 'steps', 'number'],
            ['心率(bpm)', 'heartRate', 'number'],
            ['睡眠(h)', 'sleepHours', 'number'],
            ['收缩压', 'systolic', 'number'],
            ['舒张压', 'diastolic', 'number'],
            ['血氧(%)', 'bloodOxygen', 'number'],
            ['蛋白质含量(%)', 'proteinPercentage', 'number'],
            ['基础代谢率(kcal)', 'bmr', 'number'],
            ['水分率(%)', 'bodyWater', 'number'],
            ['骨盐量(kg)', 'boneMass', 'number'],
            ['肌肉量(kg)', 'muscleMass', 'number'],
            ['骨骼肌量(kg)', 'skeletalMuscleMass', 'number'],
          ].map(([label, key, type]) => (
            <div key={key} className="flex items-center gap-2">
              <label className="w-28 text-xs text-gray-500 shrink-0">{label}</label>
              <input
                value={form[key as keyof MetricForm]}
                onChange={set(key as keyof MetricForm)}
                type={type}
                className="flex-1 px-3 py-1.5 bg-gray-100 rounded-xl text-sm outline-none"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => onConfirm(form)}
          className="w-full mt-4 bg-green-500 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2"
        >
          <Check size={16} /> 确认保存
        </button>
      </div>
    </div>
  );
}

interface AddMetricModalProps {
  userId: string;
  onAdd: (m: Omit<BodyMetric, 'id'>) => void;
  onClose: () => void;
}

function AddMetricModal({ userId, onAdd, onClose }: AddMetricModalProps) {
  const [form, setForm] = useState<MetricForm>(emptyForm());
  const set = (k: keyof MetricForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(s => ({ ...s, [k]: e.target.value }));

  const handleSubmit = () => {
    const p = (v: string) => v ? parseFloat(v) : undefined;
    const pi = (v: string) => v ? parseInt(v) : undefined;
    const m: Omit<BodyMetric, 'id'> = {
      userId, date: form.date,
      weight: p(form.weight), bodyFat: p(form.bodyFat),
      steps: pi(form.steps), heartRate: pi(form.heartRate),
      sleepHours: p(form.sleepHours), systolic: pi(form.systolic),
      diastolic: pi(form.diastolic), bloodOxygen: p(form.bloodOxygen),
      proteinPercentage: p(form.proteinPercentage),
      bmr: pi(form.bmr),
      bodyWater: p(form.bodyWater),
      boneMass: p(form.boneMass),
      muscleMass: p(form.muscleMass),
      skeletalMuscleMass: p(form.skeletalMuscleMass),
    };
    if (m.weight) m.bmi = parseFloat((m.weight / (1.75 ** 2)).toFixed(1));
    onAdd(m);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">手动录入指标</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="space-y-2">
          {[
            ['日期', 'date', 'date'],
            ['体重(kg)', 'weight', 'number'],
            ['体脂(%)', 'bodyFat', 'number'],
            ['步数', 'steps', 'number'],
            ['心率(bpm)', 'heartRate', 'number'],
            ['睡眠时长(h)', 'sleepHours', 'number'],
            ['收缩压(mmHg)', 'systolic', 'number'],
            ['舒张压(mmHg)', 'diastolic', 'number'],
            ['血氧饱和度(%)', 'bloodOxygen', 'number'],
            ['蛋白质含量(%)', 'proteinPercentage', 'number'],
            ['基础代谢率(kcal)', 'bmr', 'number'],
            ['水分率(%)', 'bodyWater', 'number'],
            ['骨盐量(kg)', 'boneMass', 'number'],
            ['肌肉量(kg)', 'muscleMass', 'number'],
            ['骨骼肌量(kg)', 'skeletalMuscleMass', 'number'],
          ].map(([label, key, type]) => (
            <div key={key} className="flex items-center gap-2">
              <label className="w-28 text-xs text-gray-500 shrink-0">{label}</label>
              <input value={form[key as keyof MetricForm]} onChange={set(key as keyof MetricForm)}
                type={type} className="flex-1 px-3 py-1.5 bg-gray-100 rounded-xl text-sm outline-none" />
            </div>
          ))}
        </div>
        <button onClick={handleSubmit}
          className="w-full mt-4 bg-blue-500 text-white rounded-xl py-3 font-medium">
          保存
        </button>
      </div>
    </div>
  );
}

function parseCSV(content: string, userId: string): Omit<BodyMetric, 'id'>[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  const metrics: Omit<BodyMetric, 'id'>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(s => s.trim().replace(/[^\d.\-]/g, ''));
    if (!cols[0]) continue;
    const weight = parseFloat(cols[1]) || undefined;
    metrics.push({
      userId,
      date: lines[i].split(',')[0].trim(),
      weight,
      bmi: weight ? parseFloat((weight / (1.75 ** 2)).toFixed(1)) : undefined,
      steps: parseInt(cols[2]) || undefined,
      heartRate: parseInt(cols[3]) || undefined,
      sleepHours: parseFloat(cols[4]) || undefined,
      bloodOxygen: parseFloat(cols[5]) || undefined,
    });
  }
  return metrics;
}

export default function BodyMetrics() {
  const { currentUser, addBodyMetric, importBodyMetrics, getBodyMetricsByUser } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [ocrData, setOcrData] = useState<Partial<MetricForm> | null>(null);
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;
  const metrics = getBodyMetricsByUser(currentUser.id).slice(-30);
  const latest = metrics[metrics.length - 1];

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const data = parseCSV(text, currentUser.id);
      if (data.length > 0) {
        importBodyMetrics(data);
        setImportMsg(`成功导入 ${data.length} 条数据`);
      } else {
        setImportMsg('未识别到有效数据，请检查格式');
      }
      setTimeout(() => setImportMsg(''), 3000);
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('chi_sim+eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      const extracted: Partial<MetricForm> = {
        date: new Date().toISOString().split('T')[0],
      };
      const patterns: [keyof MetricForm, RegExp][] = [
        ['weight', /体重[：:]\s*([\d.]+)/],
        ['steps', /步数[：:]\s*([\d,]+)/],
        ['heartRate', /心率[：:]\s*(\d+)/],
        ['sleepHours', /睡眠[：:]\s*([\d.]+)/],
        ['bloodOxygen', /血氧[：:]\s*([\d.]+)/],
        ['systolic', /收缩压[：:]\s*(\d+)/],
        ['diastolic', /舒张压[：:]\s*(\d+)/],
        ['bodyFat', /体脂[：:]\s*([\d.]+)/],
        ['proteinPercentage', /蛋白质[：:]\s*([\d.]+)/],
        ['bmr', /基础代谢[率]?[：:]\s*(\d+)/],
        ['bodyWater', /水分[率]?[：:]\s*([\d.]+)/],
        ['boneMass', /骨[盐矿]量?[：:]\s*([\d.]+)/],
        ['muscleMass', /肌肉量[：:]\s*([\d.]+)/],
        ['skeletalMuscleMass', /骨骼肌[量]?[：:]\s*([\d.]+)/],
      ];
      for (const [key, re] of patterns) {
        const m = text.match(re);
        if (m) extracted[key] = m[1].replace(',', '');
      }
      setOcrData(extracted);
    } catch {
      setImportMsg('OCR 识别失败，请确保已安装 tesseract.js');
      setTimeout(() => setImportMsg(''), 3000);
    }
  };

  const handleOCRConfirm = (form: MetricForm) => {
    const p = (v: string) => v ? parseFloat(v) : undefined;
    const pi = (v: string) => v ? parseInt(v) : undefined;
    const m: Omit<BodyMetric, 'id'> = {
      userId: currentUser.id, date: form.date,
      weight: p(form.weight), bodyFat: p(form.bodyFat),
      steps: pi(form.steps), heartRate: pi(form.heartRate),
      sleepHours: p(form.sleepHours), systolic: pi(form.systolic),
      diastolic: pi(form.diastolic), bloodOxygen: p(form.bloodOxygen),
      proteinPercentage: p(form.proteinPercentage),
      bmr: pi(form.bmr),
      bodyWater: p(form.bodyWater),
      boneMass: p(form.boneMass),
      muscleMass: p(form.muscleMass),
      skeletalMuscleMass: p(form.skeletalMuscleMass),
    };
    if (m.weight) m.bmi = parseFloat((m.weight / ((currentUser.height / 100) ** 2)).toFixed(1));
    addBodyMetric(m);
    setOcrData(null);
    setImportMsg('数据已保存');
    setTimeout(() => setImportMsg(''), 3000);
  };

  return (
    <div className="p-4 space-y-4">
      {/* 导入操作 */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => setShowAdd(true)}
          className="flex flex-col items-center gap-1 bg-blue-500 text-white rounded-2xl py-3 text-xs">
          <Plus size={18} /> 手动录入
        </button>
        <button onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center gap-1 bg-green-500 text-white rounded-2xl py-3 text-xs">
          <Upload size={18} /> 导入CSV
        </button>
        <button onClick={() => imgRef.current?.click()}
          className="flex flex-col items-center gap-1 bg-purple-500 text-white rounded-2xl py-3 text-xs">
          <Upload size={18} /> 图片OCR
        </button>
      </div>

      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
      <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

      {importMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm text-center">
          {importMsg}
        </div>
      )}

      {/* CSV 格式说明 */}
      <div className="bg-gray-50 rounded-2xl p-3 text-xs text-gray-500">
        <div className="font-medium mb-1 text-gray-700">CSV 导入格式（华为/OPPO健康）：</div>
        <code className="text-xs">日期,体重(kg),步数,心率,睡眠时长(h),血氧饱和度(%)</code>
      </div>

      {/* 最新指标 */}
      {latest && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-sm font-semibold mb-3 text-gray-700">最新数据 ({latest.date})</div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {[
              ['⚖️', '体重', latest.weight, 'kg'],
              ['📊', 'BMI', latest.bmi, ''],
              ['🔥', '体脂', latest.bodyFat, '%'],
              ['🚶', '步数', latest.steps, '步'],
              ['❤️', '心率', latest.heartRate, 'bpm'],
              ['😴', '睡眠', latest.sleepHours, 'h'],
              ['💉', '收缩压', latest.systolic, 'mmHg'],
              ['💉', '舒张压', latest.diastolic, 'mmHg'],
              ['🩸', '血氧', latest.bloodOxygen, '%'],
              ['🥩', '蛋白质', latest.proteinPercentage, '%'],
              ['⚡', '基础代谢', latest.bmr, 'kcal'],
              ['💧', '水分率', latest.bodyWater, '%'],
              ['🦴', '骨盐量', latest.boneMass, 'kg'],
              ['💪', '肌肉量', latest.muscleMass, 'kg'],
              ['🏋️', '骨骼肌', latest.skeletalMuscleMass, 'kg'],
            ].map(([icon, label, value, unit]) => value != null ? (
              <div key={label as string} className="bg-gray-50 rounded-xl p-2">
                <div>{icon}</div>
                <div className="font-bold text-gray-800">{value}{unit}</div>
                <div className="text-gray-400">{label}</div>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* 体重趋势 */}
      {metrics.length > 1 && (
        <TrendChart
          title="近30天体重趋势"
          data={metrics.map(m => ({ date: m.date, 体重: m.weight ?? 0 }))}
          lines={[{ key: '体重', color: '#22c55e', label: '体重(kg)' }]}
        />
      )}

      {/* 步数趋势 */}
      {metrics.some(m => m.steps) && (
        <TrendChart
          title="近30天步数趋势"
          data={metrics.map(m => ({ date: m.date, 步数: (m.steps ?? 0) / 1000 }))}
          lines={[{ key: '步数', color: '#3b82f6', label: '步数(千步)' }]}
        />
      )}

      {/* 体成分趋势：肌肉量 + 骨骼肌量 */}
      {metrics.some(m => m.muscleMass) && (
        <TrendChart
          title="近30天肌肉量趋势"
          data={metrics.map(m => ({
            date: m.date,
            肌肉量: m.muscleMass ?? 0,
            骨骼肌量: m.skeletalMuscleMass ?? 0,
          }))}
          lines={[
            { key: '肌肉量', color: '#f97316', label: '肌肉量(kg)' },
            { key: '骨骼肌量', color: '#8b5cf6', label: '骨骼肌量(kg)' },
          ]}
        />
      )}

      {/* 水分率 + 蛋白质含量趋势 */}
      {metrics.some(m => m.bodyWater) && (
        <TrendChart
          title="近30天水分率 / 蛋白质趋势"
          data={metrics.map(m => ({
            date: m.date,
            水分率: m.bodyWater ?? 0,
            蛋白质: m.proteinPercentage ?? 0,
          }))}
          lines={[
            { key: '水分率', color: '#06b6d4', label: '水分率(%)' },
            { key: '蛋白质', color: '#22c55e', label: '蛋白质(%)' },
          ]}
        />
      )}

      {/* 骨盐量趋势 */}
      {metrics.some(m => m.boneMass) && (
        <TrendChart
          title="近30天骨盐量趋势"
          data={metrics.map(m => ({ date: m.date, 骨盐量: m.boneMass ?? 0 }))}
          lines={[{ key: '骨盐量', color: '#a78bfa', label: '骨盐量(kg)' }]}
        />
      )}

      {/* 基础代谢率趋势 */}
      {metrics.some(m => m.bmr) && (
        <TrendChart
          title="近30天基础代谢率趋势"
          data={metrics.map(m => ({ date: m.date, 基础代谢: m.bmr ?? 0 }))}
          lines={[{ key: '基础代谢', color: '#f59e0b', label: '基础代谢(kcal)' }]}
        />
      )}

      {/* 历史记录列表 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-medium text-sm">历史记录</div>
        {[...metrics].reverse().slice(0, 10).map(m => (
          <div key={m.id} className="px-4 py-2.5 border-b border-gray-50 last:border-0 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">{m.date}</span>
              <div className="flex gap-3 text-xs">
                {m.weight && <span>⚖️ {m.weight}kg</span>}
                {m.steps && <span>🚶 {m.steps}</span>}
                {m.heartRate && <span>❤️ {m.heartRate}bpm</span>}
                {m.sleepHours && <span>😴 {m.sleepHours}h</span>}
              </div>
            </div>
          </div>
        ))}
        {metrics.length === 0 && (
          <div className="p-6 text-center text-gray-400 text-sm">暂无数据，请录入或导入</div>
        )}
      </div>

      {showAdd && (
        <AddMetricModal userId={currentUser.id} onAdd={addBodyMetric} onClose={() => setShowAdd(false)} />
      )}
      {ocrData && (
        <OCRPreviewModal data={ocrData} onConfirm={handleOCRConfirm} onClose={() => setOcrData(null)} />
      )}
    </div>
  );
}
