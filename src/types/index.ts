export interface Service {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'pending' | 'failed' | 'stopped' | 'deploying';
  image: string;
  replicas: number;
  desiredReplicas: number;
  cpu: number;
  memory: number;
  port: number;
  dns?: string;
  createdAt: string;
}

export interface DNSRecord {
  id: string;
  type: 'A' | 'CNAME' | 'AAAA' | 'TXT' | 'MX';
  name: string;
  content: string;
  ttl: number | 'Auto';
  proxied: boolean;
  serviceId?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  type: 'deploy' | 'failure' | 'warning' | 'dns' | 'ai';
  description: string;
  serviceName?: string;
  timestamp: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  input: any;
  output?: any;
  duration?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  topic?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}
