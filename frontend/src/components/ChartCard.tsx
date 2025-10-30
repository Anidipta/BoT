interface ChartData {
  label: string;
  value: number;
}

interface ChartCardProps {
  title: string;
  data: ChartData[];
  color: 'cyan' | 'green' | 'yellow' | 'blue';
}

const colorClasses = {
  cyan: 'bg-cyan-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-500'
};

export default function ChartCard({ title, data, color }: ChartCardProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const barColor = colorClasses[color];

  return (
    <div className="bg-blue-800 border-4 border-blue-600 p-6 pixel-corners">
      <h3 className="text-yellow-400 text-lg mb-6">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-300 text-xs">{item.label}</span>
              <span className="text-white text-xs font-bold">{Math.round(item.value)}</span>
            </div>
            <div className="bg-blue-900 h-8 pixel-corners overflow-hidden">
              <div
                className={`${barColor} h-full transition-all duration-500 pixel-corners flex items-center justify-end px-2`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              >
                {item.value > maxValue * 0.3 && (
                  <span className="text-white text-xs font-bold">{Math.round(item.value)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
