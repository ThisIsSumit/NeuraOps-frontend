import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RefreshCw, Trash2, Globe, Activity, Eye, EyeOff,
  Download, PlusCircle, ArrowLeft
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Toggle } from '../components/ui/Toggle';
import { CodeBlock } from '../components/ui/CodeBlock';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const mockMetrics = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  cpu: Math.floor(Math.random() * 40) + 5,
  memory: Math.floor(Math.random() * 200) + 250,
  networkIn: Math.floor(Math.random() * 100),
  networkOut: Math.floor(Math.random() * 80),
}));

const rawLogLines = `[2024-03-23 15:40:01.000] [INFO] Starting NeuraOps Service v1.2.5... (PID: 1042)
[2024-03-23 15:40:01.050] [DEBUG] Loading configuration from /etc/neuraops/config.yaml
[2024-03-23 15:40:01.890] [INFO] Connecting to database cluster at db.cluster.local:5432
[2024-03-23 15:40:02.105] [INFO] Database connected. Initializing Redis cache.
[2024-03-23 15:40:02.400] [WARN] Cache miss rate exceeding 15% threshold. Tuning GC.
[2024-03-23 15:40:03.000] [INFO] HTTP server listening on 0.0.0.0:80
[2024-03-23 15:42:15.550] [WARN] Slow query detected on /api/v1/users (took 850ms)
[2024-03-23 15:44:30.220] [INFO] Incoming request: GET /health (Status: 200 OK)
[2024-03-23 15:45:00.111] [ERROR] Failed to process background job #12345: timeout
[2024-03-23 15:45:01.000] [INFO] Retrying job #12345 (Attempt 2/3)
[2024-03-23 15:45:05.330] [INFO] Job #12345 completed successfully in 4320ms.
[2024-03-23 15:45:06.000] [INFO] Watching for new requests...`;

const TABS = ['Overview', 'Logs', 'Metrics', 'Environment', 'DNS'];

const CHART_CONFIGS = [
  { title: 'CPU (mCPU)', dataKey: 'cpu', color: '#00D9FF' },
  { title: 'Memory (MB)', dataKey: 'memory', color: '#A78BFA' },
  { title: 'Network In (KB/s)', dataKey: 'networkIn', color: '#00D9FF', dashed: true },
  { title: 'Network Out (KB/s)', dataKey: 'networkOut', color: '#FF6B35' },
];

const TIME_RANGES = ['15m', '1h', '6h', '24h'];

const ENV_VARS = [
  { key: 'DATABASE_URL', value: 'postgresql://user:pass@db.cluster:5432/main', secret: true },
  { key: 'NODE_ENV', value: 'production', secret: false },
  { key: 'API_KEY', value: 'nops_live_82349823498234', secret: true },
  { key: 'PORT', value: '80', secret: false },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[6px] bg-[#131820] border-[0.5px] border-[#2D3E50] p-2.5">
      <p className="font-mono text-[11px] text-[#4A5568] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-mono text-[12px]" style={{ color: p.color }}>
          {p.value}
        </p>
      ))}
    </div>
  );
};

export const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [streamLogs, setStreamLogs] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');

  const service = {
    id: id || '1', name: 'api-gateway', description: 'Main entry point for all API requests',
    status: 'running', image: 'nginx:1.25', replicas: 3, desiredReplicas: 3,
    cpu: 12, memory: 256, port: 80, dns: 'api.neuraops.io', createdAt: '2024-03-20',
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/services')}
        className="flex items-center gap-2 font-mono text-[12px] text-[#4A5568] hover:text-[#94A3B8] transition-colors w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Services
      </button>

      {/* Header */}
      <Card className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-[Epilogue] text-[28px] font-[800] text-[#E2E8F0]">{service.name}</h1>
            <Badge variant="running" pulse>Running</Badge>
            <span className="font-mono text-[12px] text-[#4A5568]">{service.replicas} containers</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Restart
            </Button>
            <Button variant="ghost-cyan" size="sm">Scale</Button>
            <Button variant="ghost-danger" size="sm">
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 pt-4 border-t-[0.5px] border-[#1E2A38]">
          {[
            { label: 'image', val: service.image },
            { label: 'port', val: service.port },
            { label: 'replicas', val: `${service.replicas}/${service.desiredReplicas}` },
            { label: 'deployed', val: '2h ago' },
          ].map(m => (
            <span key={m.label} className="font-mono text-[12px] text-[#4A5568]">
              {m.label}:{' '}
              <span className="text-[#94A3B8]">{m.val}</span>
            </span>
          ))}
          {service.dns && (
            <span className="font-mono text-[12px] text-[#4A5568]">
              dns: <span className="text-[#00D9FF]">{service.dns}</span>
            </span>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b-[0.5px] border-[#1E2A38] overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'relative px-5 py-3 font-sans text-[14px] font-medium whitespace-nowrap transition-colors',
              activeTab === tab ? 'text-[#E2E8F0]' : 'text-[#4A5568] hover:text-[#94A3B8]'
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="service-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00D9FF]"
                style={{ boxShadow: '0 0 8px rgba(0,217,255,0.4)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'Overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Mini metrics */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'CPU', value: `${service.cpu}%`, color: '#00D9FF' },
                  { label: 'Memory', value: `${service.memory}MB`, color: '#A78BFA' },
                  { label: 'Uptime SLA', value: '99.9%', color: '#00DF99' },
                ].map((m, i) => (
                  <div key={m.label} className="rounded-[8px] bg-[#0D1117] border-[0.5px] border-[#1E2A38] p-4">
                    <span className="font-sans text-[11px] uppercase tracking-widest text-[#4A5568]">{m.label}</span>
                    <div className="font-mono text-[28px] font-medium mt-1 leading-none" style={{ color: m.color }}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Events */}
              <Card className="p-0">
                <div className="px-5 py-4 border-b-[0.5px] border-[#1E2A38]">
                  <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#00D9FF]">
                    System Events
                  </h3>
                </div>
                {[
                  { icon: Activity, text: 'Service restarted successfully (SIGTERM → INIT)', time: '10:42:01' },
                  { icon: RefreshCw, text: 'Deploying manifest diff (image: v1.2.5 → v1.2.6)', time: '08:15:30' },
                ].map((ev, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3 border-b-[0.5px] border-[#1E2A38] last:border-none font-mono text-[13px]">
                    <ev.icon className="h-4 w-4 text-[#00D9FF] shrink-0" />
                    <span className="text-[#94A3B8] flex-1">{ev.text}</span>
                    <span className="text-[#4A5568] text-[11px]">{ev.time}</span>
                  </div>
                ))}
              </Card>
            </div>

            {/* Diagnostics */}
            <Card className="flex flex-col gap-4">
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#00D9FF]">
                Diagnostics
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'State', value: 'HEALTHY', valueColor: '#00D9FF', pulse: true },
                  { label: 'Latency (p99)', value: '124ms', valueColor: '#E2E8F0' },
                  { label: 'Packet Loss', value: '0.02%', valueColor: '#FF6B35' },
                  { label: 'Uptime', value: '14d 08h 12m', valueColor: '#E2E8F0' },
                ].map(d => (
                  <div key={d.label} className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#4A5568]">{d.label}</span>
                    <span className="font-mono text-[12px] font-medium flex items-center gap-1.5" style={{ color: d.valueColor }}>
                      {d.pulse && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-[#00D9FF] opacity-75 animate-ping" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00D9FF]" />
                        </span>
                      )}
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 border-t-[0.5px] border-[#1E2A38] pt-4">
                <div className="flex items-start gap-2 rounded-[6px] bg-[#00D9FF]/05 p-3 border-[0.5px] border-[#00D9FF]/15">
                  <Activity className="h-4 w-4 text-[#00D9FF] shrink-0 mt-0.5" />
                  <p className="font-mono text-[11px] text-[#94A3B8] leading-relaxed">
                    Auto-scaling threshold set to 80% CPU utilization.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'Logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Log controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    placeholder="Filter by regex..."
                    className={cn(
                      'h-[34px] w-[240px] rounded-[6px] bg-[#070A0E]',
                      'border-[0.5px] border-[#1E2A38] px-3 font-mono text-[12px]',
                      'text-[#E2E8F0] placeholder:text-[#4A5568]',
                      'focus:border-[#00D9FF] outline-none transition-all'
                    )}
                  />
                </div>
                {/* Level filters */}
                <div className="flex gap-1 bg-[#0D1117] p-1 rounded-[6px] border-[0.5px] border-[#1E2A38]">
                  {['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'].map(lvl => (
                    <button
                      key={lvl}
                      className={cn(
                        'px-2.5 py-1 rounded-[4px] font-mono text-[10px] uppercase tracking-wider transition-colors',
                        lvl === 'ALL'
                          ? 'bg-[#1E2A38] text-[#E2E8F0]'
                          : lvl === 'INFO' ? 'text-[#00D9FF]/60 hover:text-[#00D9FF]'
                          : lvl === 'WARN' ? 'text-[#FF6B35]/60 hover:text-[#FF6B35]'
                          : lvl === 'ERROR' ? 'text-[#FF4444]/60 hover:text-[#FF4444]'
                          : 'text-[#4A5568] hover:text-[#94A3B8]'
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-[#4A5568]">Follow</span>
                  <Toggle checked={streamLogs} onCheckedChange={setStreamLogs} />
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export
                </Button>
              </div>
            </div>

            {/* Terminal */}
            <div className="relative rounded-[8px] overflow-hidden bg-[#050709] border-[0.5px] border-[#1E2A38]">
              {/* macOS dots */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b-[0.5px] border-[#1E2A38] bg-[#0D1117]">
                <div className="h-2.5 w-2.5 rounded-full bg-[#FF4444]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#FFB000]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#00D9FF]" />
                <span className="ml-3 font-mono text-[10px] uppercase tracking-widest text-[#4A5568]">
                  api-gateway-78dfb9f69b-xzt4q
                </span>
                {streamLogs && (
                  <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-[#00D9FF]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00D9FF] animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>

              <pre className="h-[480px] overflow-y-auto p-5 font-mono text-[13px] leading-[1.9]">
                {rawLogLines.split('\n').map((line, i) => {
                  const tsMatch = line.match(/^\[([^\]]+)\]/);
                  const levelMatch = line.match(/\[(INFO|WARN|ERROR|DEBUG)\]/);
                  const level = levelMatch?.[1] || '';
                  const levelColors: Record<string, string> = {
                    INFO: '#00D9FF', WARN: '#FF6B35', ERROR: '#FF4444', DEBUG: '#4A5568'
                  };
                  if (tsMatch) {
                    const ts = tsMatch[0];
                    const rest = line.slice(ts.length);
                    return (
                      <span key={i} className="block hover:bg-[rgba(255,255,255,0.015)] -mx-5 px-5 rounded">
                        <span className="text-[#2D3E50]">{ts}</span>
                        <span style={{ color: levelColors[level] || '#94A3B8' }}>{rest}</span>
                      </span>
                    );
                  }
                  return <span key={i} className="block text-[#94A3B8]">{line}</span>;
                })}
              </pre>
            </div>
          </motion.div>
        )}

        {activeTab === 'Metrics' && (
          <motion.div
            key="metrics"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 gap-5 lg:grid-cols-2"
          >
            {CHART_CONFIGS.map(chart => (
              <Card key={chart.title} className="flex flex-col gap-4 h-[280px]">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#E2E8F0]">
                    {chart.title}
                  </h4>
                  <div className="flex gap-1">
                    {TIME_RANGES.map(r => (
                      <button
                        key={r}
                        onClick={() => setTimeRange(r)}
                        className={cn(
                          'rounded-[4px] px-2 py-0.5 font-mono text-[10px] transition-colors',
                          timeRange === r
                            ? 'bg-[rgba(0,217,255,0.1)] text-[#00D9FF]'
                            : 'text-[#4A5568] hover:text-[#94A3B8]'
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockMetrics} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`grad-${chart.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chart.color} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E2A38" vertical={false} />
                      <XAxis dataKey="time" stroke="#4A5568" fontSize={9} tickLine={false} axisLine={false}
                        fontFamily='"JetBrains Mono", monospace' />
                      <YAxis stroke="#4A5568" fontSize={9} tickLine={false} axisLine={false}
                        fontFamily='"JetBrains Mono", monospace' />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey={chart.dataKey}
                        stroke={chart.color}
                        strokeWidth={1.5}
                        strokeDasharray={chart.dashed ? '4 2' : undefined}
                        fill={`url(#grad-${chart.dataKey})`}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {activeTab === 'Environment' && (
          <motion.div
            key="env"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="flex justify-end">
              <Button variant="ghost-cyan" size="sm">
                <PlusCircle className="mr-2 h-3.5 w-3.5" />
                Inject Variable
              </Button>
            </div>
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="h-[40px] bg-[#050709]/60 border-b-[0.5px] border-[#1E2A38]">
                    <th className="px-6 font-mono text-[10px] uppercase tracking-widest text-[#4A5568] font-medium">Key</th>
                    <th className="px-6 font-mono text-[10px] uppercase tracking-widest text-[#4A5568] font-medium">Value</th>
                    <th className="px-6 w-[60px]" />
                  </tr>
                </thead>
                <tbody className="divide-y-[0.5px] divide-[#1E2A38]">
                  {ENV_VARS.map(env => (
                    <tr key={env.key} className="group hover:bg-[#070A0E]/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-[13px] text-[#00D9FF]">{env.key}</td>
                      <td className="px-6 py-4 font-mono text-[13px] text-[#94A3B8]">
                        <span className={cn(env.secret && !showSecrets[env.key] && 'blur-[4px] select-none')}>
                          {env.value}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {env.secret && (
                          <button
                            onClick={() => setShowSecrets(p => ({ ...p, [env.key]: !p[env.key] }))}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[#4A5568] hover:text-[#E2E8F0]"
                          >
                            {showSecrets[env.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </motion.div>
        )}

        {activeTab === 'DNS' && (
          <motion.div
            key="dns"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5"
          >
            <Card className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#00D9FF]/10 text-[#00D9FF] border-[0.5px] border-[#00D9FF]/20">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-[14px] font-bold text-[#E2E8F0]">api.neuraops.io</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#4A5568]">Cloudflare Proxy Route</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="cyan">Synced</Badge>
                  <Button variant="ghost-danger" size="icon"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-4 border-t-[0.5px] border-[#1E2A38]">
                {[
                  { label: 'Protocol', val: 'CNAME' },
                  { label: 'Target', val: 'lb-01.neuraops.io' },
                  { label: 'TTL', val: 'Auto' },
                  { label: 'WAF Proxy', val: 'Active', color: '#00D9FF' },
                ].map(d => (
                  <div key={d.label} className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] uppercase text-[#4A5568] tracking-widest">{d.label}</span>
                    <span className="font-mono text-[13px]" style={{ color: d.color || '#94A3B8' }}>{d.val}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Button variant="ghost" className="w-fit" size="sm">
              <PlusCircle className="mr-2 h-3.5 w-3.5" />
              Add DNS Record
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
