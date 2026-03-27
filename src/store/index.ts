import { create } from 'zustand';
import { Service, DNSRecord, Event, Conversation, Message, Notification } from '../types';

interface AppStore {
  // Auth
  user: { name: string; email: string; role: string } | null;
  token: string | null;
  setUser: (user: { name: string; email: string; role: string }, token: string) => void;
  logout: () => void;

  // Services
  services: Service[];
  setServices: (services: Service[]) => void;
  updateService: (id: string, patch: Partial<Service>) => void;

  // DNS
  dnsRecords: DNSRecord[];
  setDnsRecords: (records: DNSRecord[]) => void;

  // Events
  events: Event[];
  addEvent: (event: Event) => void;

  // AI Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  addConversation: (conversation: Conversation) => void;
  addMessage: (conversationId: string, message: Message) => void;
  appendAIDelta: (conversationId: string, delta: string) => void;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  updateConversation: (id: string, patch: Partial<Conversation>) => void;

  // UI
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: { name: 'Sumit Kumar', email: 'sumitkumar453827@gmail.com', role: 'admin' },
  token: 'mock-token',
  setUser: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),

  services: [],
  setServices: (services) => set({ services }),
  updateService: (id, patch) => set((state) => ({
    services: state.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  })),

  dnsRecords: [],
  setDnsRecords: (dnsRecords) => set({ dnsRecords }),

  events: [],
  addEvent: (event) => set((state) => ({ events: [event, ...state.events] })),

  conversations: [],
  activeConversationId: null,
  addConversation: (conversation) => set((state) => ({ conversations: [conversation, ...state.conversations] })),
  addMessage: (conversationId, message) => set((state) => ({
    conversations: state.conversations.map((c) =>
      c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c
    ),
  })),
  appendAIDelta: (conversationId, delta) => set((state) => ({
    conversations: state.conversations.map((c) => {
      if (c.id === conversationId) {
        const lastMessage = c.messages[c.messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          const updatedMessages = [...c.messages];
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            content: lastMessage.content + delta,
          };
          return { ...c, messages: updatedMessages };
        }
      }
      return c;
    }),
  })),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  deleteConversation: (id) => set((state) => {
    const newConvs = state.conversations.filter((c) => c.id !== id);
    return {
      conversations: newConvs,
      activeConversationId: state.activeConversationId === id ? (newConvs[0]?.id || null) : state.activeConversationId
    };
  }),
  updateConversation: (id, patch) => set((state) => ({
    conversations: state.conversations.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  })),

  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  notifications: [
    {
      id: '1',
      type: 'info',
      title: 'Welcome to NeuraOps',
      message: 'Your infrastructure is now being monitored by AI.',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Service Deployed',
      message: 'auth-service has been successfully deployed to production.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true
    }
  ],
  addNotification: (n) => set((state) => ({
    notifications: [{
      ...n,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    }, ...state.notifications]
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  clearNotifications: () => set({ notifications: [] }),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}));
