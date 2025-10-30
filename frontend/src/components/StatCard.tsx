import { ArrowRight } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  color: 'green' | 'blue' | 'yellow' | 'purple' | 'cyan';
  onClick?: () => void;
}

const colorClasses = {
  green: {
    bg: 'bg-green-800',
    border: 'border-green-600',
    text: 'text-green-300',
    icon: 'text-green-400',
    hover: 'hover:bg-green-700/50'
  },
  blue: {
    bg: 'bg-blue-800',
    border: 'border-blue-600',
    text: 'text-blue-300',
    icon: 'text-blue-400',
    hover: 'hover:bg-blue-700/50'
  },
  yellow: {
    bg: 'bg-yellow-800',
    border: 'border-yellow-600',
    text: 'text-yellow-300',
    icon: 'text-yellow-400',
    hover: 'hover:bg-yellow-700/50'
  },
  purple: {
    bg: 'bg-fuchsia-800',
    border: 'border-fuchsia-600',
    text: 'text-fuchsia-300',
    icon: 'text-fuchsia-400',
    hover: 'hover:bg-fuchsia-700/50'
  },
  cyan: {
    bg: 'bg-cyan-800',
    border: 'border-cyan-600',
    text: 'text-cyan-300',
    icon: 'text-cyan-400',
    hover: 'hover:bg-cyan-700/50'
  }
};

export default function StatCard({ icon, title, value, subtitle, color, onClick }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      onClick={onClick}
      className={`${colors.bg} border-4 ${colors.border} p-6 pixel-corners ${colors.hover} transition-colors ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={colors.icon}>{icon}</div>
        {onClick && (
          <ArrowRight className={`w-5 h-5 ${colors.text}`} />
        )}
      </div>
      <h3 className={`${colors.text} text-sm mb-2`}>{title}</h3>
      <div className="text-white text-3xl font-bold mb-2">{value}</div>
      <p className={`${colors.text} text-xs`}>{subtitle}</p>
    </div>
  );
}
