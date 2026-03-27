import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import {
  Dashboard,
  Services,
  ServiceDetail,
  NewService,
  DNSManager,
  AIAgent,
  Settings,
  Login,
  Notifications,
} from './pages';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/new" element={<NewService />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/dns" element={<DNSManager />} />
          <Route path="/ai-agent" element={<AIAgent />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
