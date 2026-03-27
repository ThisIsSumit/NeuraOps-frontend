import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, Server, Globe, Cpu, HardDrive, Network } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Toggle } from '../components/ui/Toggle';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const RUNTIMES = ['Docker Image', 'Node.js', 'Python', 'Go', 'Rust'];
const REGIONS = ['US-EAST-1', 'EU-WEST-1', 'AP-SOUTH-1', 'US-WEST-2'];

const STEPS = ['Basic', 'Resources', 'Network', 'Review'];

interface FormState {
  name: string;
  runtime: string;
  image: string;
  replicas: number;
  cpu: number;
  memory: number;
  port: string;
  region: string;
  enableDNS: boolean;
  domain: string;
  enableProxy: boolean;
  envVars: { key: string; val: string }[];
}

export const NewService = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [deploying, setDeploying] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '', runtime: 'Docker Image', image: '',
    replicas: 1, cpu: 512, memory: 512,
    port: '80', region: 'US-EAST-1',
    enableDNS: false, domain: '', enableProxy: true,
    envVars: [{ key: '', val: '' }],
  });

  const update = (field: keyof FormState, value: any) =>
    setForm(p => ({ ...p, [field]: value }));

  const canNext = () => {
    if (step === 0) return form.name.trim().length > 0 && (form.runtime !== 'Docker Image' || form.image.trim().length > 0);
    return true;
  };

  const handleDeploy = async () => {
    setDeploying(true);
    await new Promise(r => setTimeout(r, 2000));
    navigate('/services');
  };

  const previewLines = [
    `service: ${form.name || 'my-service'}`,
    `image: ${form.image || 'nginx:latest'}`,
    `replicas: ${form.replicas}`,
    `cpu: ${form.cpu}m`,
    `memory: ${form.memory}Mi`,
    `port: ${form.port}`,
    `region: ${form.region}`,
    form.enableDNS ? `dns: ${form.domain || '(pending)'}` : null,
  ].filter(Boolean);

  const RangeSlider = ({ label, value, min, max, step: s, unit, field, color = '#00D9FF' }: {
    label: string; value: number; min: number; max: number; step: number; unit: string;
    field: keyof FormState; color?: string;
  }) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">{label}</label>
        <span className="font-mono text-[13px]" style={{ color }}>
          {value}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min} max={max} step={s}
          value={value}
          onChange={e => update(field, Number(e.target.value))}
          style={{ '--value': `${((value - min) / (max - min)) * 100}%` } as any}
          className={cn(
            'w-full h-[4px] rounded-full appearance-none outline-none',
            color === '#FF6B35' ? 'range-orange' : 'range-cyan'
          )}
        />
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[10px] text-[#4A5568]">{min}{unit}</span>
          <span className="font-mono text-[10px] text-[#4A5568]">{max}{unit}</span>
        </div>
      </div>
    </div>
  );

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

      <div className="flex flex-col gap-2">
        <h1 className="font-[Epilogue] text-[28px] font-[800] text-[#E2E8F0]">Deploy Service</h1>
        <p className="font-sans text-[14px] text-[#4A5568]">Launch a new Docker container into your infrastructure</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-0">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={cn(
                'flex items-center gap-2 px-4 py-2 font-sans text-[13px] font-medium rounded-[6px] transition-all',
                i === step
                  ? 'text-[#00D9FF] bg-[rgba(0,217,255,0.08)]'
                  : i < step
                  ? 'text-[#4A5568] hover:text-[#94A3B8]'
                  : 'text-[#2D3E50] cursor-not-allowed'
              )}
            >
              <span className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full font-mono text-[11px] border-[0.5px]',
                i < step ? 'bg-[#00DF99] text-[#090C10] border-[#00DF99]' :
                i === step ? 'border-[#00D9FF] text-[#00D9FF]' :
                'border-[#2D3E50] text-[#2D3E50]'
              )}>
                {i < step ? '✓' : i + 1}
              </span>
              {s}
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-3 w-3 text-[#2D3E50] mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Form */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 0: Basic */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="flex flex-col gap-5">
                  <h3 className="font-[Epilogue] text-[16px] font-semibold text-[#E2E8F0]">Basic Configuration</h3>

                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">Service Name</label>
                    <Input
                      placeholder="e.g. api-gateway, worker-node-1"
                      value={form.name}
                      onChange={e => update('name', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    />
                    <p className="font-mono text-[11px] text-[#4A5568]">
                      Will be accessible as <span className="text-[#00D9FF]">{form.name || 'slug-name'}</span>.internal
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">Runtime</label>
                    <div className="flex flex-wrap gap-2">
                      {RUNTIMES.map(rt => (
                        <button
                          key={rt}
                          onClick={() => update('runtime', rt)}
                          className={cn(
                            'rounded-[6px] px-3 py-2 font-sans text-[13px] transition-all border-[0.5px]',
                            form.runtime === rt
                              ? 'bg-[rgba(0,217,255,0.1)] text-[#00D9FF] border-[#00D9FF]/50'
                              : 'bg-[#1E2A38] text-[#4A5568] border-[#2D3E50] hover:text-[#94A3B8]'
                          )}
                        >
                          {rt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">
                      {form.runtime === 'Docker Image' ? 'Docker Image' : `${form.runtime} Version`}
                    </label>
                    <Input
                      placeholder={form.runtime === 'Docker Image' ? 'nginx:1.25-alpine' : '3.11-slim'}
                      value={form.image}
                      onChange={e => update('image', e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">Region</label>
                    <div className="flex flex-wrap gap-2">
                      {REGIONS.map(r => (
                        <button
                          key={r}
                          onClick={() => update('region', r)}
                          className={cn(
                            'rounded-[6px] px-3 py-2 font-mono text-[11px] uppercase transition-all border-[0.5px]',
                            form.region === r
                              ? 'bg-[rgba(255,107,53,0.1)] text-[#FF6B35] border-[#FF6B35]/50'
                              : 'bg-[#1E2A38] text-[#4A5568] border-[#2D3E50] hover:text-[#94A3B8]'
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 1: Resources */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="flex flex-col gap-6">
                  <h3 className="font-[Epilogue] text-[16px] font-semibold text-[#E2E8F0]">Resources</h3>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">Replicas</label>
                      <span className="font-mono text-[13px] text-[#00D9FF]">{form.replicas}</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <button
                          key={n}
                          onClick={() => update('replicas', n)}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-[6px] font-mono text-[13px] border-[0.5px] transition-all',
                            form.replicas === n
                              ? 'bg-[rgba(0,217,255,0.1)] text-[#00D9FF] border-[#00D9FF]/50'
                              : 'bg-[#1E2A38] text-[#4A5568] border-[#2D3E50] hover:text-[#94A3B8]'
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <RangeSlider label="CPU" value={form.cpu} min={64} max={4096} step={64}
                    unit="m" field="cpu" color="#00D9FF" />
                  <RangeSlider label="Memory" value={form.memory} min={128} max={8192} step={128}
                    unit="Mi" field="memory" color="#A78BFA" />

                  {/* Env vars */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">Environment Variables</label>
                      <button
                        onClick={() => update('envVars', [...form.envVars, { key: '', val: '' }])}
                        className="font-mono text-[11px] text-[#00D9FF] hover:text-[#00D9FF]/70 transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {form.envVars.map((ev, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            placeholder="KEY"
                            value={ev.key}
                            onChange={e => {
                              const updated = [...form.envVars];
                              updated[i] = { ...ev, key: e.target.value };
                              update('envVars', updated);
                            }}
                          />
                          <Input
                            placeholder="VALUE"
                            value={ev.val}
                            onChange={e => {
                              const updated = [...form.envVars];
                              updated[i] = { ...ev, val: e.target.value };
                              update('envVars', updated);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Network */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="flex flex-col gap-5">
                  <h3 className="font-[Epilogue] text-[16px] font-semibold text-[#E2E8F0]">Network</h3>

                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">Container Port</label>
                    <Input
                      placeholder="80"
                      value={form.port}
                      onChange={e => update('port', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-[8px] bg-[#131820] border-[0.5px] border-[#1E2A38] p-4">
                    <div>
                      <p className="font-sans text-[14px] font-medium text-[#E2E8F0]">Enable DNS</p>
                      <p className="font-mono text-[11px] text-[#4A5568] mt-0.5">Expose via Cloudflare route</p>
                    </div>
                    <Toggle checked={form.enableDNS} onCheckedChange={v => update('enableDNS', v)} />
                  </div>

                  <AnimatePresence>
                    {form.enableDNS && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-4"
                      >
                        <div className="flex flex-col gap-2">
                          <label className="font-sans text-[11px] uppercase tracking-[0.1em] text-[#4A5568]">Domain</label>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="api"
                              value={form.domain}
                              onChange={e => update('domain', e.target.value)}
                            />
                            <span className="font-mono text-[13px] whitespace-nowrap text-[#4A5568]">.neuraops.io</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between rounded-[8px] bg-[#131820] border-[0.5px] border-[#1E2A38] p-4">
                          <div>
                            <p className="font-sans text-[14px] font-medium text-[#E2E8F0]">Cloudflare Proxy</p>
                            <p className="font-mono text-[11px] text-[#4A5568] mt-0.5">Enable WAF + CDN</p>
                          </div>
                          <Toggle checked={form.enableProxy} onCheckedChange={v => update('enableProxy', v)} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="flex flex-col gap-5">
                  <h3 className="font-[Epilogue] text-[16px] font-semibold text-[#E2E8F0]">Ready to Deploy</h3>

                  {/* Summary */}
                  <div className="flex flex-col divide-y-[0.5px] divide-[#1E2A38]">
                    {[
                      { label: 'Service Name', val: form.name },
                      { label: 'Runtime', val: form.runtime },
                      { label: 'Image', val: form.image },
                      { label: 'Replicas', val: form.replicas },
                      { label: 'CPU', val: `${form.cpu}m` },
                      { label: 'Memory', val: `${form.memory}Mi` },
                      { label: 'Port', val: form.port },
                      { label: 'Region', val: form.region },
                      form.enableDNS ? { label: 'DNS', val: `${form.domain}.neuraops.io` } : null,
                    ].filter(Boolean).map((item: any) => (
                      <div key={item.label} className="flex items-center justify-between py-3">
                        <span className="font-mono text-[11px] uppercase tracking-widest text-[#4A5568]">{item.label}</span>
                        <span className="font-mono text-[13px] text-[#E2E8F0]">{item.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-3 rounded-[8px] bg-[rgba(0,217,255,0.05)] border-[0.5px] border-[#00D9FF]/20 p-4">
                    <div className="h-2 w-2 rounded-full bg-[#00D9FF] shrink-0 mt-1.5" />
                    <p className="font-mono text-[12px] text-[#94A3B8] leading-relaxed">
                      Your service will be live in ~45 seconds. You'll receive a notification when it's ready.
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/services')}
            >
              {step === 0 ? 'Cancel' : '← Back'}
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
              >
                Continue →
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                loading={deploying}
                onClick={handleDeploy}
              >
                {deploying ? 'Deploying...' : '◈ Deploy Service'}
              </Button>
            )}
          </div>
        </div>

        {/* Sticky Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-[76px]">
            <div className="rounded-[8px] bg-[#050709] border-[0.5px] border-[#1E2A38]">
              <div className="flex items-center gap-2 border-b-[0.5px] border-[#1E2A38] px-4 py-2.5">
                <div className="h-2 w-2 rounded-full bg-[#FF4444]" />
                <div className="h-2 w-2 rounded-full bg-[#FFB000]" />
                <div className="h-2 w-2 rounded-full bg-[#00D9FF]" />
                <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-[#4A5568]">manifest preview</span>
              </div>
              <pre className="p-4 font-mono text-[12px] leading-[1.9] min-h-[240px]">
                {previewLines.map((line, i) => {
                  const [key, ...rest] = (line as string).split(': ');
                  return (
                    <span key={i} className="block">
                      <span className="text-[#00D9FF]">{key}</span>
                      <span className="text-[#4A5568]">: </span>
                      <span className="text-[#E2E8F0]">{rest.join(': ')}</span>
                    </span>
                  );
                })}
                <span className="inline-block h-[14px] w-[2px] bg-[#00D9FF] ml-0.5"
                  style={{ animation: 'blink-cursor 0.6s step-end infinite' }} />
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
