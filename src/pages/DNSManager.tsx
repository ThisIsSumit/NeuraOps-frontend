import { useState } from 'react';
import { Plus, Search, RefreshCw, Trash2, Copy, Check, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { RecordTypeBadge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const DNS_RECORDS = [
  { id: '1', type: 'A', name: '@', value: '104.21.15.2', ttl: '300', proxied: true },
  { id: '2', type: 'CNAME', name: 'api', value: 'lb-01.neuraops.io', ttl: '300', proxied: true },
  { id: '3', type: 'CNAME', name: 'www', value: 'neuraops.io', ttl: '300', proxied: true },
  { id: '4', type: 'MX', name: '@', value: 'mail.neuraops.io', ttl: '3600', proxied: false },
  { id: '5', type: 'TXT', name: '@', value: 'v=spf1 include:_spf.google.com ~all', ttl: '3600', proxied: false },
  { id: '6', type: 'AAAA', name: 'ipv6', value: '2001:db8::1', ttl: '300', proxied: false },
];

const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT'];

interface NewRecord {
  type: string;
  name: string;
  value: string;
  ttl: string;
  proxied: boolean;
}

export const DNSManager = () => {
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [records, setRecords] = useState(DNS_RECORDS);
  const [newRecord, setNewRecord] = useState<NewRecord>({
    type: 'A', name: '', value: '', ttl: '300', proxied: true,
  });
  const [saving, setSaving] = useState(false);

  const filtered = records.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.value.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (id: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setRecords(prev => [
      ...prev,
      { id: String(Date.now()), ...newRecord },
    ]);
    setSaving(false);
    setDrawerOpen(false);
    setNewRecord({ type: 'A', name: '', value: '', ttl: '300', proxied: true });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Records', val: records.length.toString(), color: '#E2E8F0' },
          { label: 'Proxied', val: records.filter(r => r.proxied).length.toString(), color: '#FF6B35' },
          { label: 'DNS Zone', val: 'neuraops.io', color: '#00D9FF' },
          { label: 'Last Sync', val: '2min ago', color: '#94A3B8' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="flex flex-col gap-1.5 rounded-[10px] bg-[#0D1117] border-[0.5px] border-[#1E2A38] p-4"
          >
            <span className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">{stat.label}</span>
            <span className="font-mono text-[22px] font-medium leading-none" style={{ color: stat.color }}>
              {stat.val}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Input
          placeholder="Search records..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search className="h-3.5 w-3.5" />}
          className="w-[280px]"
        />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Sync Zone
          </Button>
          <Button variant="primary" size="sm" onClick={() => setDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Record
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-[40px] bg-[#050709]/60 border-b-[0.5px] border-[#1E2A38]">
                {['Type', 'Name', 'Value', 'TTL', 'Proxy', 'Actions'].map(h => (
                  <th key={h} className="px-5 font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[#4A5568]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((record, i) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group h-[52px] border-b-[0.5px] border-[#1E2A38] last:border-none hover:bg-[rgba(255,255,255,0.015)] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <RecordTypeBadge type={record.type} />
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-[13px] text-[#00D9FF]">{record.name}</span>
                      <span className="font-mono text-[12px] text-[#4A5568]">.neuraops.io</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] text-[#94A3B8] max-w-[280px] truncate">
                          {record.value}
                        </span>
                        <button
                          onClick={() => handleCopy(record.id, record.value)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#4A5568] hover:text-[#E2E8F0]"
                        >
                          {copiedId === record.id
                            ? <Check className="h-3 w-3 text-[#00DF99]" />
                            : <Copy className="h-3 w-3" />
                          }
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-[12px] text-[#4A5568]">{record.ttl}s</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className={cn(
                        'inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5',
                        'font-mono text-[10px] border-[0.5px]',
                        record.proxied
                          ? 'text-[#FF6B35] bg-[rgba(255,107,53,0.08)] border-[rgba(255,107,53,0.3)]'
                          : 'text-[#4A5568] bg-[#1E2A38] border-[#2D3E50]'
                      )}>
                        {record.proxied ? '◈ CF PROXY' : 'DNS ONLY'}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="rounded-[4px] p-1.5 text-[#4A5568] hover:text-[#FF4444] hover:bg-[rgba(255,68,68,0.08)] transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center font-mono text-[13px] text-[#4A5568]">
                    No records match "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Drawer Backdrop */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-[#090C10]/70 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 280 }}
              className="fixed right-0 top-0 z-50 h-screen w-full max-w-[420px] flex flex-col bg-[#0D1117] border-l-[0.5px] border-[#1E2A38]"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b-[0.5px] border-[#1E2A38] px-6 py-4">
                <h2 className="font-[Epilogue] text-[18px] font-bold text-[#E2E8F0]">New DNS Record</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-[6px] p-1.5 text-[#4A5568] hover:bg-[#1E2A38] hover:text-[#E2E8F0] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex flex-col gap-5 flex-1 overflow-y-auto p-6">
                {/* Record type */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">Record Type</label>
                  <div className="flex flex-wrap gap-2">
                    {RECORD_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => setNewRecord(p => ({ ...p, type: t }))}
                        className={cn(
                          'rounded-[4px] px-3 py-1.5 font-mono text-[12px] uppercase tracking-wider transition-all border-[0.5px]',
                          newRecord.type === t
                            ? 'bg-[rgba(0,217,255,0.1)] text-[#00D9FF] border-[#00D9FF]/50'
                            : 'bg-[#1E2A38] text-[#4A5568] border-[#2D3E50] hover:text-[#94A3B8]'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zone */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">Zone</label>
                  <div className="flex items-center h-[36px] rounded-[6px] bg-[#070A0E] border-[0.5px] border-[#1E2A38] px-3 font-mono text-[13px] text-[#4A5568]">
                    neuraops.io
                  </div>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">Name</label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="@, www, api..."
                      value={newRecord.name}
                      onChange={e => setNewRecord(p => ({ ...p, name: e.target.value }))}
                    />
                    <span className="font-mono text-[12px] whitespace-nowrap text-[#4A5568]">.neuraops.io</span>
                  </div>
                </div>

                {/* Value */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">
                    {newRecord.type === 'MX' ? 'Mail Server' : newRecord.type === 'TXT' ? 'Text Content' : 'IP / Target'}
                  </label>
                  <Input
                    placeholder={
                      newRecord.type === 'A' ? '192.168.1.1'
                      : newRecord.type === 'CNAME' ? 'target.example.com'
                      : newRecord.type === 'TXT' ? 'v=spf1 ...'
                      : 'Enter value'
                    }
                    value={newRecord.value}
                    onChange={e => setNewRecord(p => ({ ...p, value: e.target.value }))}
                  />
                </div>

                {/* TTL */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">TTL</label>
                  <select
                    value={newRecord.ttl}
                    onChange={e => setNewRecord(p => ({ ...p, ttl: e.target.value }))}
                    className="h-[36px] w-full rounded-[6px] bg-[#070A0E] border-[0.5px] border-[#1E2A38]
                      px-3 font-mono text-[13px] text-[#E2E8F0] outline-none focus:border-[#00D9FF]
                      transition-all cursor-pointer"
                  >
                    <option value="300">5 minutes (300s)</option>
                    <option value="3600">1 hour (3600s)</option>
                    <option value="86400">24 hours (86400s)</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                {/* Proxy */}
                <div className="flex items-center justify-between rounded-[8px] bg-[#131820] border-[0.5px] border-[#1E2A38] p-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans text-[13px] font-medium text-[#E2E8F0]">Cloudflare Proxy</span>
                    <span className="font-mono text-[11px] text-[#4A5568]">Enable WAF + CDN protection</span>
                  </div>
                  <button
                    onClick={() => setNewRecord(p => ({ ...p, proxied: !p.proxied }))}
                    className={cn(
                      'relative inline-flex h-5 w-9 rounded-full transition-colors',
                      newRecord.proxied ? 'bg-[#FF6B35]' : 'bg-[#1E2A38]'
                    )}
                  >
                    <span className={cn(
                      'absolute top-[2px] h-4 w-4 rounded-full bg-white shadow transition-transform',
                      newRecord.proxied ? 'translate-x-[18px]' : 'translate-x-[2px]'
                    )} />
                  </button>
                </div>

                {/* Preview */}
                <div className="rounded-[8px] bg-[#050709] border-[0.5px] border-[#1E2A38] p-4">
                  <span className="font-mono text-[10px] text-[#4A5568] uppercase tracking-widest mb-2 block">Preview</span>
                  <code className="font-mono text-[12px] text-[#94A3B8] leading-relaxed break-all">
                    <span className="text-[#00D9FF]">{newRecord.name || '@'}</span>
                    <span className="text-[#4A5568]">.neuraops.io</span>
                    {' '}
                    <span className="text-[#FF6B35]">{newRecord.ttl}s</span>
                    {' '}
                    <span className="text-[#A78BFA]">IN {newRecord.type}</span>
                    {' '}
                    <span className="text-[#E2E8F0]">{newRecord.value || '...'}</span>
                  </code>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="flex items-center justify-between gap-3 border-t-[0.5px] border-[#1E2A38] px-6 py-4">
                <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>Cancel</Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={saving}
                  onClick={handleSave}
                  disabled={!newRecord.name || !newRecord.value}
                >
                  {saving ? 'Propagating...' : 'Save Record'}
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
