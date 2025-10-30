import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  label: string;
  value: number;
  value2?: number; // for stacked charts
}

interface ChartCardProps {
  title: string;
  data: ChartData[];
  color: 'cyan' | 'green' | 'yellow' | 'blue';
  type?: 'bar' | 'radar' | 'stacked'; // default to 'bar'
}

const colorMap = {
  cyan: '#00d9ff',
  green: '#00ff00',
  yellow: '#ffff00',
  blue: '#5a4a9a'
};

const colorMap2 = {
  cyan: '#0088aa',
  green: '#00bb00',
  yellow: '#dddd00',
  blue: '#7a6aba'
};

export default function ChartCard({ title, data, color, type = 'bar' }: ChartCardProps) {
  const chartColor = colorMap[color];
  const chartColor2 = colorMap2[color];

  // Radar Chart
  if (type === 'radar') {
    return (
      <div className="pixel-card border-4 border-cyan-400">
        <h3 className="neon-text text-sm font-bold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <PolarGrid stroke="rgba(0, 217, 255, 0.3)" />
            <PolarAngleAxis dataKey="label" stroke="#cccccc" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 'auto']} stroke="#cccccc" tick={{ fontSize: 10 }} />
            <Radar name={title} dataKey="value" stroke={chartColor} fill={chartColor} fillOpacity={0.6} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1d3a', border: `2px solid ${chartColor}`, borderRadius: 0 }}
              labelStyle={{ color: chartColor }}
              formatter={(value) => [`${Math.round(Number(value))}`, 'Volume']}
              cursor={{ stroke: chartColor, strokeWidth: 2 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Stacked Bar Chart
  if (type === 'stacked') {
    return (
      <div className="pixel-card border-4 border-yellow-400">
        <h3 className="neon-text text-sm font-bold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.2)" />
            <XAxis dataKey="label" stroke="#cccccc" tick={{ fontSize: 11 }} />
            <YAxis stroke="#cccccc" tick={{ fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1d3a', border: `2px solid ${chartColor}`, borderRadius: 0 }}
              labelStyle={{ color: chartColor }}
              formatter={(value) => `${Math.round(Number(value))}`}
              cursor={{ fill: 'rgba(0, 217, 255, 0.1)' }}
            />
            <Legend wrapperStyle={{ color: '#cccccc', fontSize: 11 }} />
            <Bar dataKey="value" stackId="a" fill={chartColor} name="Primary" />
            <Bar dataKey="value2" stackId="a" fill={chartColor2} name="Secondary" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default Bar Chart (simple)
  const maxValue = Math.max(...data.map(d => d.value));
  const barColor = chartColor;

  return (
    <div className="pixel-card border-4 border-cyan-400">
      <h3 className="neon-text text-sm font-bold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-cyan-300 text-xs">{item.label}</span>
              <span className="text-white text-xs font-bold">{Math.round(item.value)}</span>
            </div>
            <div className="bg-blue-200 h-6 border-2 border-cyan-50 overflow-hidden">
              <div
                className="h-full transition-all duration-500 flex items-center justify-end px-2"
                style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: barColor }}
              >
                {item.value > maxValue * 0.3 && (
                  <span className="text-blue-900 text-xs font-bold">{Math.round(item.value)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
