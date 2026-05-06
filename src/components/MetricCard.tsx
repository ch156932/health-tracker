interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit: string;
  color?: string;
  subtext?: string;
}

export default function MetricCard({ icon, label, value, unit, color = 'text-gray-800', subtext }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
      <div className="flex items-center gap-1 text-gray-500 text-xs">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`text-lg font-bold ${color}`}>
        {value}
        <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>
      </div>
      {subtext && <div className="text-xs text-gray-400">{subtext}</div>}
    </div>
  );
}
