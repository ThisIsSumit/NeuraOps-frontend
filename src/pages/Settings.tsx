import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Toggle } from '../components/ui/Toggle';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { User, Key, Bell, Globe, Shield, Webhook, Trash2, Plus, Download, Eye, EyeOff } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Webhook },
];

const DANGER_ZONE = [
  { title: 'Export all data', desc: 'Download a JSON snapshot of all infrastructure state', action: 'Export', icon: Download, color: '#94A3B8', variant: 'ghost' as const },
  { title: 'Reset configuration', desc: 'Clear all service configs. Cannot be undone.', action: 'Reset', icon: Trash2, color: '#FF6B35', variant: 'ghost-danger' as const },
];

const API_KEYS = [
  { id: '1', name: 'Production API', prefix: 'nops_live_xxxx', created: '2024-01-15', lastUsed: '2h ago', status: 'active' },
  { id: '2', name: 'CI/CD Pipeline', prefix: 'nops_ci_xxxx', created: '2024-02-20', lastUsed: '4min ago', status: 'active' },
  { id: '3', name: 'Local Dev', prefix: 'nops_dev_xxxx', created: '2024-03-01', lastUsed: 'Never', status: 'inactive' },
];

const INTEGRATIONS = [
  { name: 'Cloudflare', status: 'connected', logo: '☁' },
  { name: 'GitHub', status: 'connected', logo: '⬡' },
  { name: 'Slack', status: 'disconnected', logo: '◎' },
  { name: 'PagerDuty', status: 'disconnected', logo: '◈' },
];

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    name: 'Admin User',
    email: 'admin@neuraops.io',
    role: 'Senior DevOps Engineer',
    timezone: 'UTC+05:30',
    geminiKey: 'AIza••••••••••••••••••••',
    cfToken: 'cf_••••••••••••••••••••',
    cfZone: 'neuraops.io',
  });
  const [notifs, setNotifs] = useState({
    deploySuccess: true,
    deployFail: true,
    alertHigh: true,
    alertMedium: false,
    dnsPropagation: true,
    weeklyReport: false,
  });

  const toggleKey = (id: string) =>
    setRevealedKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col gap-6 w-full max-w-[960px] mx-auto">
      {/* Tab nav */}
      <div className="flex gap-1 rounded-[8px] bg-[#0D1117] border-[0.5px] border-[#1E2A38] p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-[6px] px-4 py-2 font-sans text-[13px] font-medium transition-all',
              activeTab === tab.id
                ? 'bg-[#1E2A38] text-[#E2E8F0] shadow-sm'
                : 'text-[#4A5568] hover:text-[#94A3B8]'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Profile */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5"
          >
            <Card className="flex flex-col gap-5">
              <h3 className="font-[Epilogue] text-[16px] font-semibold text-[#E2E8F0]">Identity</h3>

              <div className="flex items-center gap-5">
                <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-[rgba(0,217,255,0.12)] text-[#00D9FF] text-[24px] font-bold border-[0.5px] border-[#00D9FF]/20">
                  A
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-[14px] font-medium text-[#E2E8F0]">{form.name}</span>
                  <span className="font-mono text-[12px] text-[#4A5568]">{form.email}</span>
                  <Badge variant="default">{form.role}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto">Change photo</Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { label: 'Display Name', field: 'name' },
                  { label: 'Email', field: 'email' },
                  { label: 'Job Title', field: 'role' },
                  { label: 'Timezone', field: 'timezone' },
                ].map(f => (
                  <div key={f.field} className="flex flex-col gap-1.5">
                    <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">
                      {f.label}
                    </label>
                    <Input
                      value={form[f.field as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [f.field]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="sm">Save Changes</Button>
              </div>
            </Card>

            {/* AI config */}
            <Card className="flex flex-col gap-5">
              <h3 className="font-[Epilogue] text-[16px] font-semibold text-[#E2E8F0]">AI & Infrastructure</h3>

              {[
                { label: 'Gemini API Key', field: 'geminiKey', desc: 'Used for AI Agent queries' },
                { label: 'Cloudflare API Token', field: 'cfToken', desc: 'Required for DNS management' },
                { label: 'Cloudflare Zone ID', field: 'cfZone', desc: 'Target DNS zone' },
              ].map(f => (
                <div key={f.field} className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">
                    {f.label}
                  </label>
                  <Input
                    value={form[f.field as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.field]: e.target.value }))}
                    purple
                  />
                  <p className="font-mono text-[11px] text-[#4A5568]">{f.desc}</p>
                </div>
              ))}

              <div className="flex justify-end">
                <Button variant="primary" size="sm">Update Keys</Button>
              </div>
            </Card>

            {/* Danger zone */}
            <Card className="flex flex-col gap-4 border-[rgba(255,107,53,0.2)]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#FF6B35]" />
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#FF6B35]">
                  Danger Zone
                </h3>
              </div>
              {DANGER_ZONE.map(item => (
                <div key={item.title} className="flex items-center justify-between rounded-[8px] border-[0.5px] border-[#1E2A38] p-4">
                  <div>
                    <p className="font-sans text-[14px] font-medium text-[#E2E8F0]">{item.title}</p>
                    <p className="font-sans text-[12px] text-[#4A5568] mt-0.5">{item.desc}</p>
                  </div>
                  <Button variant={item.variant} size="sm">
                    <item.icon className="mr-2 h-3.5 w-3.5" />
                    {item.action}
                  </Button>
                </div>
              ))}
            </Card>
          </motion.div>
        )}

        {/* API Keys */}
        {activeTab === 'api' && (
          <motion.div
            key="api"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <p className="font-sans text-[14px] text-[#4A5568]">
                {API_KEYS.filter(k => k.status === 'active').length} active keys
              </p>
              <Button variant="primary" size="sm">
                <Plus className="mr-2 h-3.5 w-3.5" />
                Generate Key
              </Button>
            </div>

            <Card className="p-0 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="h-[40px] bg-[#050709]/60 border-b-[0.5px] border-[#1E2A38]">
                    {['Name', 'Key', 'Created', 'Last Used', 'Status', ''].map(h => (
                      <th key={h} className="px-5 font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[#4A5568]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y-[0.5px] divide-[#1E2A38]">
                  {API_KEYS.map(key => (
                    <tr key={key.id} className="group h-[56px] hover:bg-[rgba(255,255,255,0.015)] transition-colors">
                      <td className="px-5 py-3 font-sans text-[14px] font-medium text-[#E2E8F0]">{key.name}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'font-mono text-[12px] text-[#94A3B8]',
                            !revealedKeys.has(key.id) && 'blur-[3px] select-none'
                          )}>
                            {key.prefix}
                          </span>
                          <button
                            onClick={() => toggleKey(key.id)}
                            className="opacity-0 group-hover:opacity-100 text-[#4A5568] hover:text-[#E2E8F0] transition-all"
                          >
                            {revealedKeys.has(key.id)
                              ? <EyeOff className="h-3.5 w-3.5" />
                              : <Eye className="h-3.5 w-3.5" />
                            }
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-[12px] text-[#4A5568]">{key.created}</td>
                      <td className="px-5 py-3 font-mono text-[12px] text-[#4A5568]">{key.lastUsed}</td>
                      <td className="px-5 py-3">
                        <Badge variant={key.status === 'active' ? 'running' : 'stopped'} pulse={key.status === 'active'}>
                          {key.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <button className="opacity-0 group-hover:opacity-100 text-[#4A5568] hover:text-[#FF4444] transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card>
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-[#00D9FF] shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-[14px] font-medium text-[#E2E8F0]">API Key Security</p>
                  <p className="font-sans text-[13px] text-[#4A5568] mt-0.5 leading-relaxed">
                    API keys are hashed and stored securely. They cannot be viewed after creation. Rotate keys every 90 days for best security.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {[
              { group: 'Deployments', items: [
                { key: 'deploySuccess', label: 'Successful deployments', desc: 'Notify when a service deploys successfully' },
                { key: 'deployFail', label: 'Failed deployments', desc: 'Notify immediately when a deployment fails' },
              ]},
              { group: 'Alerts', items: [
                { key: 'alertHigh', label: 'High severity alerts', desc: 'CPU > 90%, OOM, service down' },
                { key: 'alertMedium', label: 'Medium severity alerts', desc: 'CPU > 70%, elevated latency' },
              ]},
              { group: 'Reports', items: [
                { key: 'dnsPropagation', label: 'DNS propagation', desc: 'When DNS changes propagate globally' },
                { key: 'weeklyReport', label: 'Weekly digest', desc: 'Infrastructure summary every Monday 09:00' },
              ]},
            ].map(group => (
              <Card key={group.group} className="flex flex-col gap-4">
                <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#4A5568]">
                  {group.group}
                </h3>
                <div className="flex flex-col gap-4">
                  {group.items.map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-sans text-[14px] font-medium text-[#E2E8F0]">{item.label}</p>
                        <p className="font-sans text-[12px] text-[#4A5568] mt-0.5">{item.desc}</p>
                      </div>
                      <Toggle
                        checked={notifs[item.key as keyof typeof notifs]}
                        onCheckedChange={v => setNotifs(p => ({ ...p, [item.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Integrations */}
        {activeTab === 'integrations' && (
          <motion.div
            key="integrations"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {INTEGRATIONS.map(int => (
                <Card key={int.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1E2A38] text-[20px]">
                      {int.logo}
                    </div>
                    <div>
                      <p className="font-sans text-[14px] font-medium text-[#E2E8F0]">{int.name}</p>
                      <Badge
                        variant={int.status === 'connected' ? 'running' : 'stopped'}
                        pulse={int.status === 'connected'}
                        className="mt-1"
                      >
                        {int.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant={int.status === 'connected' ? 'ghost-danger' : 'ghost-cyan'}
                    size="sm"
                  >
                    {int.status === 'connected' ? 'Disconnect' : 'Connect'}
                  </Button>
                </Card>
              ))}
            </div>

            <Card>
              <div className="flex items-center gap-3">
                <Webhook className="h-4 w-4 text-[#00D9FF] shrink-0" />
                <div>
                  <p className="font-sans text-[14px] font-medium text-[#E2E8F0]">Webhook URL</p>
                  <p className="font-mono text-[12px] text-[#4A5568] mt-0.5">
                    https://hooks.neuraops.io/v1/events/your-token
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
