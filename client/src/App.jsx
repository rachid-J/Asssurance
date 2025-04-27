import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Auth } from './Auth/Auth';
import Dashboard from './components/Dashboard/Dashboard';
import Layout from './components/Common/Layout';
import {ClientList} from './components/ClientManagement/ClientList';
import AssuranceList from './components/AssuranceCase/AssuranceList';
import PaymentsList from './components/Payments/PaymentsList';
import DocumentsList from './components/Documents/DocumentsList';
import { AuthLayout } from './Layouts/AuthLayout';
import { MainLayout } from './Layouts/MainLayout';
import { UserManagement } from './components/Users/UserManagement';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Notification from './shared/Notification';
import PolicyListPage from './components/AssuranceCase/PolicyDetailPage';
import { ClientDetailsView } from './components/ClientManagement/ClientDetailsView';
import { ClientCreateForm } from './components/ClientManagement/ClientCreateForm';

function App() {
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_SOCKET_URL}status`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    const handleStatusChange = (status) => {
      setServerStatus(status === 'online' ? 'online' : 'offline');
    };

    socket.on('connect', () => handleStatusChange('online'));
    socket.on('disconnect', () => handleStatusChange('offline'));
    socket.on('status', handleStatusChange);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('status');
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      {serverStatus && (
        <Notification
          status={serverStatus === 'online' ? 'success' : 'error'}
          message={
            serverStatus === 'online'
              ? 'Server connection restored'
              : 'Server connection lost - Changes may not be saved'
          }
          onClose={() => setServerStatus(null)}
        />
      )}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route path="/login" element={<Auth />} />
        </Route>

        {/* Private Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="clients/:id" element={<ClientDetailsView />} />
            <Route path="clients/new" element={<ClientCreateForm />} />
            <Route path="assurance-cases" element={<AssuranceList />} />
            <Route path="assurance-cases/:policyId" element={<PolicyListPage />} />
            <Route path="payments" element={<PaymentsList />} />
            <Route path="documents" element={<DocumentsList />} />
            <Route path="user-management" element={<UserManagement />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;