import { motion } from 'motion/react';
import { MetricCard } from '../components/ui/MetricCard';
import { Card } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area
} from 'recharts';
import { cn } from '../lib/utils';

const mockChartData = [
  { value: 10 }, { value: 15 }, { value: 12 }, { value: 18 },
  { value: 14 }, { value: 20 }, { value: 16 }, { value: 19 },
];

const mockPieData = [
  { name: 'Running', value: 8, color: '#00D9FF' },
  { name: 'Failed', value: 1, color: '#FF6B35' },
  { name: 'Pending', value: 2, color: '#FBBF24' },
  { name: 'Stopped', value: 3, color: '#1E2A38' },
];

const mockEvents = [
  { id: '1', type: 'deploy', service: 'api-gateway', description: 'deployed successfully', time: '2m' },
  { id: '2', type: 'warning', service: 'auth-service', description: 'High CPU usage detected', time: '15m' },
  { id: '3', type: 'dns', service: 'api.neuraops.io', description: 'DNS record updated', time: '1h' },
  { id: '4', type: 'failure', service: 'worker-node-1', description: 'Deployment failed', time: '3h' },
  { id: '5', type: 'ai', service: 'AI Agent', description: 'Infrastructure health report generated', time: '4h' },
  { id: '6', type: 'deploy', service: 'redis-cache', description: 'scaled to 2 replicas', time: '6h' },
];

const mockServices = [
  { id: '1', name: 'api-gateway', status: 'running', cpu: 12, memory: 256 },
  { id: '2', name: 'auth-service', status: 'running', cpu: 45, memory: 512 },
  { id: '3', name: 'payment-processor', status: 'pending', cpu: 0, memory: 0 },
  { id: '4', name: 'worker-node-1', status: 'failed', cpu: 0, memory: 0 },
  { id: '5', name: 'redis-cache', status: 'running', cpu: 5, memory: 1024 },
];

const eventDotColors: Record<string, string> = {
  deploy: '#00D9FF',
  warning: '#FF6B35',
  failure: '#FF4444',
  dns: '#A78BFA',
  ai: '#A78BFA',
};

export const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Services"
          value="12"
          trend={{ value: 8, isUp: true }}
          chartData={mockChartData}
          color="#4A5568"
          index={0}
        />
        <MetricCard
          label="Running"
          value="8"
          trend={{ value: 2, isUp: true }}
          chartData={mockChartData}
          color="#00D9FF"
          highlight
          index={1}
        />
        <MetricCard
          label="DNS Records"
          value="24"
          trend={{ value: 1, isUp: true }}
          chartData={mockChartData}
          color="#FF6B35"
          index={2}
        />
        <MetricCard
          label="Events Today"
          value="156"
          trend={{ value: 12, isUp: false }}
          chartData={mockChartData}
          color="#4A5568"
          index={3}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Activity Feed */}
        <div className="lg:col-span-3 flex flex-col gap-0">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-[0.5px] border-[#1E2A38]">
              <h2 className="font-[Epilogue] text-[16px] font-semibold text-[#E2E8F0]">Events</h2>
              <button className="font-mono text-[11px] text-[#00D9FF] hover:text-[#00D9FF]/70 transition-colors">
                View raw stream →
              </button>
            </div>
            <div>
              {mockEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className={cn(
                    'group flex items-center gap-4 h-[48px] px-5',
                    'border-b-[0.5px] border-[#1E2A38] last:border-none',
                    'hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-default'
                  )}
                >
                  {/* Dot */}
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: eventDotColors[event.type] || '#4A5568' }}
                  />

                  {/* Description */}
                  <p className="flex-1 font-sans text-[14px] text-[#94A3B8] truncate">
                    <span className="font-mono text-[#00D9FF] text-[13px]">{event.service}</span>
                    {' '}{event.description}
                  </p>

                  {/* Time */}
                  <span className="font-mono text-[11px] text-[#4A5568] shrink-0">{event.time}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Cluster Health */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="flex flex-col gap-5">
            <h2 className="font-[Epilogue] text-[16px] font-semibold text-[#E2E8F0]">Cluster Health</h2>

            {/* Donut */}
            <div className="relative h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockPieData}
                    innerRadius={60}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    startAngle={90}
                    endAngle={450}
                  >
                    {mockPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#131820',
                      border: '0.5px solid #2D3E50',
                      borderRadius: '6px',
                      padding: '6px 10px',
                    }}
                    itemStyle={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '12px',
                      color: '#E2E8F0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-mono text-[32px] font-medium text-[#E2E8F0] leading-none">14</span>
                <span className="font-sans text-[11px] text-[#4A5568] mt-1">services</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2.5">
              {mockPieData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-sans text-[13px] text-[#94A3B8]">{item.name}</span>
                  </div>
                  <span className="font-mono text-[13px] text-[#E2E8F0]">{item.value}</span>
                </div>
              ))}
            </div>

            {/* AI Insight */}
            <div className="border-l-[2px] border-[rgba(167,139,250,0.4)] pl-4 py-2">
              <p className="font-sans text-[13px] italic text-[#94A3B8] leading-relaxed">
                <span className="text-[#A78BFA] not-italic font-medium">◈ </span>
                Cluster nominal. 8 nodes healthy. GC spikes on{' '}
                <span className="font-mono text-[#E2E8F0] not-italic">auth-service</span>;
                recommend vertical scaling.
              </p>
            </div>
          </Card>

          {/* Services quick-scroll */}
          <div>
            <h3 className="mb-3 font-[Epilogue] text-[14px] font-semibold text-[#4A5568] uppercase tracking-widest">
              Services
            </h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {mockServices.map((svc) => (
                <motion.button
                  key={svc.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(`/services/${svc.id}`)}
                  className={cn(
                    'group flex-none w-[200px] rounded-[10px] bg-[#0D1117] p-3',
                    'border-[0.5px] border-[#1E2A38] text-left',
                    'hover:border-[#00D9FF]/50 hover:shadow-[0_0_16px_rgba(0,217,255,0.08)]',
                    'transition-all duration-200'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-sans text-[13px] font-medium text-[#E2E8F0] truncate mr-2">
                      {svc.name}
                    </span>
                    <span className={cn(
                      'h-1.5 w-1.5 rounded-full shrink-0 mt-1',
                      svc.status === 'running' ? 'bg-[#00D9FF]' : '',
                      svc.status === 'failed' ? 'bg-[#FF4444]' : '',
                      svc.status === 'pending' ? 'bg-[#FBBF24]' : '',
                      svc.status === 'stopped' ? 'bg-[#4A5568]' : '',
                    )} />
                  </div>
                  <span className="font-mono text-[11px] text-[#4A5568]">
                    cpu: {svc.cpu}% · ram: {svc.memory}mb
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
