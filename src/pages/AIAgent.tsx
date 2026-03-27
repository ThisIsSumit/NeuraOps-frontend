import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Server, Globe, Activity, ChevronDown, ChevronRight, Copy, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: string;
  status: 'running' | 'done' | 'error';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
}

const PROMPTS = [
  { icon: Activity, text: 'Health check all services' },
  { icon: Server, text: 'Show CPU usage for api-gateway' },
  { icon: Globe, text: 'List DNS records for neuraops.io' },
  { icon: Bot, text: 'Diagnose worker-node-1 failure' },
];

const TOOL_ICONS: Record<string, React.ElementType> = {
  check_service_health: Activity,
  get_service_metrics: Server,
  list_dns_records: Globe,
  get_service_logs: Activity,
};

const SAMPLE_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Health check all services',
    timestamp: new Date(),
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Running a full health check across all services in your cluster...',
    toolCalls: [
      {
        id: 't1',
        name: 'check_service_health',
        args: { services: ['api-gateway', 'auth-service', 'redis-cache'] },
        result: JSON.stringify([
          { name: 'api-gateway', status: 'healthy', latency: '42ms', uptime: '99.9%' },
          { name: 'auth-service', status: 'degraded', latency: '820ms', uptime: '97.2%' },
          { name: 'redis-cache', status: 'healthy', latency: '2ms', uptime: '100%' },
        ], null, 2),
        status: 'done',
      },
    ],
    timestamp: new Date(),
  },
  {
    id: '3',
    role: 'assistant',
    content: '**Cluster Health Report**\n\n✅ **api-gateway** — Healthy (p99 42ms)\n⚠️ **auth-service** — Degraded (p99 820ms, uptime 97.2%). High latency suggests GC pressure or N+1 query issue. Consider increasing memory allocation from 512Mi → 1Gi.\n✅ **redis-cache** — Healthy (p99 2ms)\n\n*Recommendation: Scale auth-service vertically. I can execute this if you confirm.*',
    timestamp: new Date(),
  },
];

const ToolCallBlock = ({ tool, isExpanded, onToggle }: {
  tool: ToolCall;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const Icon = TOOL_ICONS[tool.name] || Bot;

  return (
    <div className={cn(
      'rounded-[8px] overflow-hidden border-[0.5px] border-l-[2px]',
      tool.status === 'done'
        ? 'border-[rgba(0,217,255,0.2)] border-l-[#00D9FF] bg-[rgba(0,217,255,0.03)]'
        : tool.status === 'running'
        ? 'border-[rgba(251,191,36,0.2)] border-l-[#FBBF24] bg-[rgba(251,191,36,0.03)]'
        : 'border-[rgba(255,68,68,0.2)] border-l-[#FF4444] bg-[rgba(255,68,68,0.03)]'
    )}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
      >
        <div className={cn(
          'flex h-6 w-6 items-center justify-center rounded-[4px] shrink-0',
          tool.status === 'done' ? 'bg-[rgba(0,217,255,0.12)] text-[#00D9FF]' :
          tool.status === 'running' ? 'bg-[rgba(251,191,36,0.12)] text-[#FBBF24]' :
          'bg-[rgba(255,68,68,0.12)] text-[#FF4444]'
        )}>
          <Icon className="h-3.5 w-3.5" />
        </div>

        <div className="flex flex-1 items-center gap-2 text-left">
          <span className="font-mono text-[12px] font-medium text-[#E2E8F0]">{tool.name}</span>
          <span className="font-mono text-[10px] text-[#4A5568]">({Object.keys(tool.args).join(', ')})</span>
        </div>

        <div className="flex items-center gap-2">
          {tool.status === 'running' && (
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#FBBF24]">
              <span className="h-1 w-1 rounded-full bg-[#FBBF24] animate-pulse" />
              running
            </span>
          )}
          {tool.status === 'done' && (
            <span className="font-mono text-[10px] text-[#00D9FF]">✓ done</span>
          )}
          {isExpanded ? <ChevronDown className="h-3 w-3 text-[#4A5568]" /> : <ChevronRight className="h-3 w-3 text-[#4A5568]" />}
        </div>
      </button>

      {/* Expanded body */}
      <AnimatePresence>
        {isExpanded && tool.result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t-[0.5px] border-[rgba(255,255,255,0.06)]"
          >
            <pre className="max-h-[200px] overflow-auto p-4 font-mono text-[11px] text-[#94A3B8] leading-relaxed">
              {tool.result}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MessageContent = ({ content }: { content: string }) => {
  // Simple markdown-like rendering
  const lines = content.split('\n');
  return (
    <div className="font-sans text-[14px] text-[#E2E8F0] leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-[#E2E8F0] mt-2">{line.replace(/\*\*/g, '')}</p>;
        }
        if (line.includes('*') && line.startsWith('*')) {
          return <p key={i} className="text-[#4A5568] text-[12px] italic mt-2">{line.replace(/\*/g, '')}</p>;
        }
        if (line.startsWith('✅') || line.startsWith('⚠️')) {
          return <p key={i} className={cn('mt-1', line.startsWith('⚠️') && 'text-[#FF6B35]')}>{line}</p>;
        }
        return line ? <p key={i} className="mt-1">{line}</p> : <br key={i} />;
      })}
    </div>
  );
};

export const AIAgent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const content = text.trim();
    setInput('');
    setLoading(true);

    // Add user message
    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Simulate tool call + response
    await new Promise(r => setTimeout(r, 400));

    const toolCall: ToolCall = {
      id: `t-${Date.now()}`,
      name: 'check_service_health',
      args: { query: content },
      status: 'running',
    };

    const assistantMsg: Message = {
      id: String(Date.now() + 1),
      role: 'assistant',
      content: '',
      toolCalls: [toolCall],
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMsg]);

    await new Promise(r => setTimeout(r, 1200));

    // Update tool call to done + add response
    setMessages(prev => prev.map(m => {
      if (m.id === assistantMsg.id) {
        return {
          ...m,
          content: `I've processed your query about **${content}**. All monitored services are nominal. No critical anomalies detected in the last 15 minutes.\n\n*Use the context panel for quick-access metrics.*`,
          toolCalls: [{ ...toolCall, status: 'done', result: JSON.stringify({ status: 'ok', services: 5 }, null, 2) }],
        };
      }
      return m;
    }));

    setLoading(false);
  };

  const toggleTool = (id: string) =>
    setExpandedTools(p => ({ ...p, [id]: !p[id] }));

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-100px)] gap-5 w-full max-w-[1400px] mx-auto overflow-hidden">

      {/* Chat */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-[10px] bg-[#0D1117] border-[0.5px] border-[#1E2A38]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[0.5px] border-[#1E2A38] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[rgba(167,139,250,0.12)] text-[#A78BFA] border-[0.5px] border-[#A78BFA]/20">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <span
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#A78BFA] border-2 border-[#0D1117]"
                style={{ boxShadow: '0 0 8px rgba(167,139,250,0.6)' }}
              />
            </div>
            <div>
              <p className="font-[Epilogue] text-[15px] font-bold text-[#E2E8F0]">NeuraOps AI</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#A78BFA]">Gemini · Infrastructure Agent</p>
            </div>
          </div>
          <button
            onClick={() => setMessages([])}
            className="font-mono text-[11px] text-[#4A5568] hover:text-[#94A3B8] transition-colors"
          >
            Clear session
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          {isEmpty ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12">
              {/* Logo mark */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-[16px] bg-[rgba(167,139,250,0.08)] border-[0.5px] border-[#A78BFA]/20">
                  <span className="text-[32px] text-[#A78BFA]">◈</span>
                  <span
                    className="absolute inset-0 rounded-[16px] border-[0.5px] border-[#A78BFA]/20"
                    style={{ animation: 'pulse-ring 2s ease-out infinite' }}
                  />
                </div>
                <div className="text-center">
                  <h2 className="font-[Epilogue] text-[20px] font-bold text-[#E2E8F0]">NeuraOps AI Agent</h2>
                  <p className="mt-1 font-sans text-[14px] text-[#4A5568]">
                    Ask anything about your infrastructure
                  </p>
                </div>
              </div>

              {/* Prompt suggestions */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 w-full max-w-[480px]">
                {PROMPTS.map((p) => (
                  <button
                    key={p.text}
                    onClick={() => sendMessage(p.text)}
                    className={cn(
                      'flex items-center gap-3 rounded-[8px] px-4 py-3 text-left',
                      'border-[0.5px] border-[#1E2A38] bg-[#131820]',
                      'hover:border-[#A78BFA]/40 hover:bg-[rgba(167,139,250,0.04)]',
                      'transition-all duration-150 group'
                    )}
                  >
                    <p.icon className="h-4 w-4 text-[#4A5568] group-hover:text-[#A78BFA] transition-colors shrink-0" />
                    <span className="font-sans text-[13px] text-[#94A3B8]">{p.text}</span>
                    <ArrowRight className="ml-auto h-3.5 w-3.5 text-[#4A5568] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold',
                    msg.role === 'user'
                      ? 'bg-[rgba(255,107,53,0.12)] text-[#FF6B35] border-[0.5px] border-[#FF6B35]/20'
                      : 'bg-[rgba(167,139,250,0.12)] text-[#A78BFA] border-[0.5px] border-[#A78BFA]/20'
                  )}>
                    {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>

                  {/* Bubble(s) */}
                  <div className={cn(
                    'flex flex-col gap-2 max-w-[80%]',
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  )}>
                    {msg.toolCalls?.map(tc => (
                      <div key={tc.id} className="w-full max-w-[500px]">
                        <ToolCallBlock
                          tool={tc}
                          isExpanded={!!expandedTools[tc.id]}
                          onToggle={() => toggleTool(tc.id)}
                        />
                      </div>
                    ))}

                    {msg.content && (
                      <div className={cn(
                        'rounded-[10px] px-4 py-3 border-[0.5px]',
                        msg.role === 'user'
                          ? 'bg-[rgba(255,107,53,0.06)] border-[rgba(255,107,53,0.2)] text-[#E2E8F0]'
                          : 'bg-[#131820] border-[#1E2A38]'
                      )}>
                        {msg.role === 'assistant' ? (
                          <MessageContent content={msg.content} />
                        ) : (
                          <p className="font-sans text-[14px]">{msg.content}</p>
                        )}
                      </div>
                    )}

                    <span className="font-mono text-[10px] text-[#4A5568]">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(167,139,250,0.12)] text-[#A78BFA] border-[0.5px] border-[#A78BFA]/20">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-[10px] bg-[#131820] border-[0.5px] border-[#1E2A38] px-4 py-3">
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"
                          style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t-[0.5px] border-[#1E2A38] px-4 py-3">
          <form
            onSubmit={e => { e.preventDefault(); sendMessage(input); }}
            className="flex items-center gap-2 rounded-[8px] bg-[#131820] border-[0.5px] border-[#1E2A38] px-3 py-2 focus-within:border-[#A78BFA]/40 transition-all"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your infrastructure..."
              className="flex-1 bg-transparent font-sans text-[14px] text-[#E2E8F0] placeholder:text-[#4A5568] outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-[6px] transition-all',
                input.trim() && !loading
                  ? 'bg-[#A78BFA] text-white hover:bg-[#A78BFA]/80'
                  : 'text-[#4A5568] cursor-not-allowed'
              )}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
          <p className="mt-2 text-center font-mono text-[10px] text-[#2D3E50]">
            Powered by Gemini 2.0 · Actions execute live on your cluster
          </p>
        </div>
      </div>

      {/* Context Panel */}
      <div className="hidden lg:flex w-[280px] flex-col gap-4">
        <div className="rounded-[10px] bg-[#0D1117] border-[0.5px] border-[#1E2A38] overflow-hidden">
          <div className="border-b-[0.5px] border-[#1E2A38] px-4 py-3">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#00D9FF]">
              Live Context
            </span>
          </div>
          <div className="flex flex-col gap-0">
            {[
              { label: 'Cluster', val: 'k8s-prod-01', color: '#E2E8F0' },
              { label: 'Services', val: '12 / 14', color: '#00D9FF' },
              { label: 'Alerts', val: '2', color: '#FF6B35' },
              { label: 'CPU Avg', val: '23%', color: '#A78BFA' },
              { label: 'Mem Avg', val: '41%', color: '#A78BFA' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between px-4 py-2.5 border-b-[0.5px] border-[#1E2A38] last:border-none">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#4A5568]">{item.label}</span>
                <span className="font-mono text-[12px] font-medium" style={{ color: item.color }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[10px] bg-[#0D1117] border-[0.5px] border-[#1E2A38] overflow-hidden">
          <div className="border-b-[0.5px] border-[#1E2A38] px-4 py-3">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#00D9FF]">
              Available Tools
            </span>
          </div>
          <div className="flex flex-col gap-0 py-1">
            {[
              { name: 'check_service_health', icon: Activity },
              { name: 'get_service_metrics', icon: Server },
              { name: 'list_dns_records', icon: Globe },
              { name: 'scale_service', icon: Bot },
              { name: 'tail_logs', icon: Activity },
            ].map(tool => (
              <div key={tool.name} className="flex items-center gap-2.5 px-4 py-2 hover:bg-[rgba(255,255,255,0.015)] transition-colors">
                <div className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[rgba(0,217,255,0.08)] text-[#00D9FF]">
                  <tool.icon className="h-3 w-3" />
                </div>
                <span className="font-mono text-[11px] text-[#4A5568]">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
