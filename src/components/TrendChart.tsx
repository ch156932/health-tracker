import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendChartProps {
  data: { date: string; [key: string]: number | string }[];
  lines: { key: string; color: string; label: string }[];
  title?: string;
  height?: number;
}

export default function TrendChart({ data, lines, title, height = 200 }: TrendChartProps) {
  const formatDate = (d: string) => d.slice(5); // MM-DD

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            labelFormatter={(l) => l}
          formatter={(v: unknown) => {
            const n = typeof v === 'number' ? v : Number(v);
            return [n.toFixed(1), ''] as [string, string];
          }}
          />
          {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {lines.map(({ key, color, label }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              dot={data.length <= 14 ? { r: 3 } : false}
              name={label}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
