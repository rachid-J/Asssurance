import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Auth } from './Auth/Auth';
import Layout from './components/Common/Layout';
import { AuthLayout } from './Layouts/AuthLayout';
import { MainLayout } from './Layouts/MainLayout';
import { UserManagement } from './components/Users/UserManagement';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Notification from './shared/Notification';
import { NewInsuranceForm } from './components/AssuranceCase/NewInsuranceForm';
import { ClientList } from './components/ClientManagement/ClientList';
import { ClientCreateForm } from './components/ClientManagement/ClientCreateForm';
import { ClientDetailsView } from './components/ClientManagement/ClientDetailsView';
import { VehicleAddPage } from './components/ClientManagement/components/vehicules/VehicleAddPage';
import  VehicleDocumentsPage  from './components/ClientManagement/components/vehicules/VehicleDocumentsPage';
import  AddDocumentPage  from './components/ClientManagement/components/vehicules/AddDocumentPage';
import  PaymentsList  from './components/Payments/PaymentsList';
import  DocumentsList  from './components/Documents/DocumentsList';
import  AssuranceList  from './components/AssuranceCase/AssuranceList';
import  InsuranceDetailPage  from './components/AssuranceCase/InsuranceDetailPage';
import PaymentPage from './components/AssuranceCase/PaymentPage';
import{ Dashboard} from './components/Dashboard/Dashboard'

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
            <Route path="clients/:id/edit" element={<ClientCreateForm />} />
            <Route path="vehicles/new" element={<VehicleAddPage />} />
            <Route path="/clients/:clientId/vehicles" element={<NewInsuranceForm />} />
            <Route path="/clients/:clientId/vehicles/:vehicleId/documents" element={<VehicleDocumentsPage />} />
            <Route path="/clients/:clientId/vehicles/:vehicleId/documents/add" element={<AddDocumentPage />} />
            <Route path="/clients/:clientId/insurances/new" element={<NewInsuranceForm />} />
            <Route path="clients/new" element={<ClientCreateForm />} />
            <Route path="assurance-cases" element={<AssuranceList />} />
            <Route path="assurance-cases/:insuranceId" element={<InsuranceDetailPage />} />
            <Route path="assurance-cases/:insuranceId/payments" element={<PaymentPage />} />
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