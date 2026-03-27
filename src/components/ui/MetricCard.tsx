import { motion } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; isUp: boolean };
  chartData?: { value: number }[];
  color?: string;
  highlight?: boolean;
  index?: number;
}

export const MetricCard = ({
  label,
  value,
  trend,
  chartData,
  color = '#4A5568',
  highlight,
  index = 0,
}: MetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
      className={cn(
        'relative rounded-[10px] bg-[#0D1117] border-[0.5px] border-[#1E2A38] p-5 overflow-hidden',
        'flex flex-col gap-3'
      )}
    >
      {/* Label */}
      <span className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#4A5568]">
        {label}
      </span>

      {/* Value */}
      <span
        className="font-mono text-[48px] font-[500] leading-none"
        style={{ color: highlight ? '#00D9FF' : '#E2E8F0' }}
      >
        {value}
      </span>

      {/* Bottom row: trend + sparkline */}
      <div className="flex items-end justify-between mt-auto">
        {trend && (
          <span
            className={cn(
              'font-mono text-[11px]',
              trend.isUp ? 'text-[#00DF99]' : 'text-[#FF6B35]'
            )}
          >
            {trend.isUp ? '↑' : '↓'} {trend.value}%
          </span>
        )}

        {chartData && chartData.length > 0 && (
          <div className="h-[48px] w-[80px] ml-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`sparkGrad-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={1}
                  fill={`url(#sparkGrad-${label})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
};
