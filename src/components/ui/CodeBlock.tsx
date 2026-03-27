import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showCopy?: boolean;
  maxHeight?: string;
}

export const CodeBlock = ({
  code,
  language = 'bash',
  className,
  showCopy = true,
  maxHeight = '500px',
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'relative rounded-[8px] bg-[#050709] border-[0.5px] border-[#1E2A38] overflow-hidden',
        className
      )}
    >
      {showCopy && (
        <button
          onClick={handleCopy}
          className={cn(
            'absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-[4px] px-2 py-1',
            'font-mono text-[10px] uppercase tracking-widest transition-all duration-150',
            copied
              ? 'text-[#00DF99] bg-[#00DF99]/10'
              : 'text-[#4A5568] bg-[#1E2A38] hover:text-[#E2E8F0] hover:bg-[#2D3E50]'
          )}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      )}
      <pre
        className={cn(
          'overflow-auto p-5 font-mono text-[13px] leading-relaxed text-[#94A3B8]',
          'scrollbar-thin scrollbar-track-[#1E2A38] scrollbar-thumb-[#2D3E50]'
        )}
        style={{ maxHeight }}
      >
        <code className="language-{language}">{colorizeLog(code, language)}</code>
      </pre>
    </div>
  );
};

// Basic log colorizer for terminal output
function colorizeLog(code: string, language: string): React.ReactNode {
  if (language !== 'bash' && language !== 'log') return code;

  return code.split('\n').map((line, i) => {
    let levelClass = 'text-[#94A3B8]';
    let tsClass = 'text-[#2D3E50]';

    if (line.includes('[INFO]')) levelClass = 'log-info';
    else if (line.includes('[WARN]')) levelClass = 'log-warn';
    else if (line.includes('[ERROR]')) levelClass = 'log-error';
    else if (line.includes('[DEBUG]')) levelClass = 'log-debug';

    // Split timestamp from rest
    const tsMatch = line.match(/^\[([^\]]+)\]/);
    if (tsMatch) {
      const ts = tsMatch[0];
      const rest = line.slice(ts.length);
      return (
        <span key={i} className="block">
          <span className="text-[#2D3E50]">{ts}</span>
          <span className={levelClass}>{rest}</span>
          {'\n'}
        </span>
      );
    }

    return <span key={i} className="block text-[#94A3B8]">{line}{'\n'}</span>;
  });
}
