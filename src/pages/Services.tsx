import { useState } from 'react';
import { Search, Plus, RefreshCw, Trash2, Globe, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Service } from '../types';

const mockServices: Service[] = [
  { id: '1', name: 'api-gateway', description: 'Main entry point for all API requests', status: 'running', image: 'nginx:1.25', replicas: 3, desiredReplicas: 3, cpu: 12, memory: 256, port: 80, dns: 'api.neuraops.io', createdAt: '2024-03-20' },
  { id: '2', name: 'auth-service', description: 'Handles user authentication and JWT', status: 'running', image: 'node:20-alpine', replicas: 2, desiredReplicas: 2, cpu: 45, memory: 512, port: 3000, createdAt: '2024-03-21' },
  { id: '3', name: 'payment-processor', description: 'Stripe integration and billing', status: 'pending', image: 'go:1.22', replicas: 0, desiredReplicas: 1, cpu: 0, memory: 0, port: 8080, createdAt: '2024-03-22' },
  { id: '4', name: 'worker-node-1', description: 'Background job processing', status: 'failed', image: 'python:3.11-slim', replicas: 0, desiredReplicas: 2, cpu: 0, memory: 0, port: 0, createdAt: '2024-03-19' },
  { id: '5', name: 'redis-cache', description: 'In-memory data store', status: 'running', image: 'redis:7.2', replicas: 1, desiredReplicas: 1, cpu: 5, memory: 1024, port: 6379, createdAt: '2024-03-18' },
];

const STATUS_FILTERS = ['All', 'Running', 'Pending', 'Failed', 'Stopped'];

const ResourceBar = ({ value, max = 100 }: { value: number; max?: number }) => {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct > 90 ? '#FF4444' : pct > 70 ? '#FF6B35' : '#00D9FF';
  return (
    <div className="h-[3px] w-[40px] rounded-full bg-[#1E2A38] overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
};

export const Services = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = mockServices.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="h-3.5 w-3.5" />}
            className="w-[280px]"
          />

          {/* Status pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  'rounded-[4px] px-3 py-1 font-sans text-[12px] font-medium transition-all duration-150 border-[0.5px]',
                  statusFilter === f
                    ? 'bg-[rgba(0,217,255,0.1)] text-[#00D9FF] border-[#00D9FF]/50'
                    : 'bg-[#1E2A38] text-[#4A5568] border-[#2D3E50] hover:text-[#94A3B8]'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/services/new')}
          className="whitespace-nowrap"
        >
          <Plus className="mr-2 h-4 w-4" />
          Deploy Service
        </Button>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="h-[40px] border-b-[0.5px] border-[#1E2A38] bg-[#050709]/60">
                {['Service', 'Status', 'Image', 'Replicas', 'CPU', 'Memory', 'DNS', 'Actions'].map(h => (
                  <th key={h} className="px-5 font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[#4A5568]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length > 0 ? filtered.map((svc, i) => (
                  <motion.tr
                    key={svc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/services/${svc.id}`)}
                    className={cn(
                      'group cursor-pointer h-[56px] border-b-[0.5px] border-[#1E2A38] last:border-none',
                      'hover:bg-[rgba(255,255,255,0.015)] transition-colors',
                      svc.status === 'running' && 'border-l-[2px] border-l-[#00D9FF]',
                    )}
                  >
                    {/* Service */}
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-sans text-[14px] font-medium text-[#E2E8F0]">{svc.name}</span>
                        <span className="font-sans text-[12px] text-[#4A5568] truncate max-w-[240px]">{svc.description}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <Badge
                        variant={svc.status as any}
                        pulse={svc.status === 'running'}
                      >
                        {svc.status}
                      </Badge>
                    </td>

                    {/* Image */}
                    <td className="px-5 py-3">
                      <span className="font-mono text-[12px] text-[#4A5568]">{svc.image}</span>
                    </td>

                    {/* Replicas */}
                    <td className="px-5 py-3">
                      <span className="font-mono text-[13px] text-[#94A3B8]">
                        {svc.replicas}
                        <span className="text-[#4A5568]">/{svc.desiredReplicas}</span>
                      </span>
                    </td>

                    {/* CPU */}
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[11px] text-[#4A5568]">{svc.cpu}%</span>
                        <ResourceBar value={svc.cpu} />
                      </div>
                    </td>

                    {/* Memory */}
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[11px] text-[#4A5568]">{svc.memory}mb</span>
                        <ResourceBar value={svc.memory} max={2048} />
                      </div>
                    </td>

                    {/* DNS */}
                    <td className="px-5 py-3">
                      {svc.dns ? (
                        <div
                          className="flex items-center gap-1.5 text-[#00D9FF]"
                          onClick={e => { e.stopPropagation(); window.open(`https://${svc.dns}`, '_blank'); }}
                        >
                          <Globe className="h-3 w-3 shrink-0" />
                          <span className="font-mono text-[11px]">{svc.dns}</span>
                        </div>
                      ) : (
                        <span className="font-mono text-[12px] text-[#2D3E50]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/services/${svc.id}`); }}
                          className="rounded-[4px] p-1.5 text-[#4A5568] hover:text-[#E2E8F0] hover:bg-[#1E2A38] transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); }}
                          className="rounded-[4px] p-1.5 text-[#4A5568] hover:text-[#E2E8F0] hover:bg-[#1E2A38] transition-colors"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); }}
                          className="rounded-[4px] p-1.5 text-[#4A5568] hover:text-[#FF4444] hover:bg-[rgba(255,68,68,0.08)] transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex flex-col items-center gap-4 py-16">
                        {/* Minimal server rack SVG */}
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="8" y="12" width="48" height="10" rx="2" stroke="#1E2A38" strokeWidth="1.5" fill="none" />
                          <rect x="8" y="26" width="48" height="10" rx="2" stroke="#1E2A38" strokeWidth="1.5" fill="none" />
                          <rect x="8" y="40" width="48" height="10" rx="2" stroke="#1E2A38" strokeWidth="1.5" fill="none" />
                          <circle cx="44" cy="17" r="2" fill="#2D3E50" />
                          <circle cx="50" cy="17" r="2" fill="#2D3E50" />
                          <circle cx="44" cy="31" r="2" fill="#2D3E50" />
                          <circle cx="50" cy="31" r="2" fill="#2D3E50" />
                          <circle cx="44" cy="45" r="2" fill="#2D3E50" />
                          <circle cx="50" cy="45" r="2" fill="#2D3E50" />
                          <rect x="14" y="15" width="16" height="4" rx="1" fill="#1E2A38" />
                          <rect x="14" y="29" width="16" height="4" rx="1" fill="#1E2A38" />
                          <rect x="14" y="43" width="16" height="4" rx="1" fill="#1E2A38" />
                        </svg>
                        <span className="font-[Epilogue] text-[24px] font-bold text-[#E2E8F0]">No services yet</span>
                        <p className="font-sans text-[14px] text-[#4A5568]">Deploy your first container to get started</p>
                        <button
                          onClick={() => navigate('/services/new')}
                          className="font-sans text-[14px] text-[#00D9FF] hover:text-[#00D9FF]/80 transition-colors"
                        >
                          Deploy your first service →
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
