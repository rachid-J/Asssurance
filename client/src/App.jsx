import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Auth } from './Auth/Auth';
import Dashboard from './components/Dashboard/Dashboard';
import Layout from './components/Common/Layout';
import ClientList from './components/ClientManagement/ClientList';
import AssuranceList from './components/AssuranceCase/AssuranceList';
import PaymentsList from './components/Payments/PaymentsList';
import DocumentsList from './components/Documents/DocumentsList';
import { AuthLayout } from './Layouts/AuthLayout';
import { MainLayout } from './Layouts/MainLayout';
import { UserManagement } from './components/Users/UserManagement';
import { setUser } from './Auth/authSlice';
import { axiosClient } from './service/axiosClient';
import { Notification } from './shared/notification';
import { useEffect } from 'react';
import { useSocketHealth } from './service/socketHealthService';

function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  // Use our socket health service
  const { 
    socket, 
    socketConnected, 
    notifications, 
    retryConnection, 
    addNotification 
  } = useSocketHealth(user);

  // Create a socket context provider if needed for components that need access to socket
  const socketContext = { socket, connected: socketConnected };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosClient.get('/auth/me');
        dispatch(setUser(res.data));
      } catch (error) {
        console.log('Not authenticated');
      }
    };
    fetchUser();
  }, [dispatch]);

  // Add a server status check when the app mounts
  useEffect(() => {
    // Check server health directly via API
    const checkServerHealth = async () => {
      try {
        await axiosClient.get('/api/health');
        // Server is up, no need to show notification
      } catch (error) {
        addNotification('Server appears to be offline. Some features may not work.', 'error');
      }
    };
    
    checkServerHealth();
    
    // Set up periodic health checks
    const healthCheckInterval = setInterval(checkServerHealth, 60000); // Every minute
    
    return () => clearInterval(healthCheckInterval);
  }, []);

  return (
    <>
      {/* Notification component with socket connection status */}
      <Notification 
       
        socketConnected={socketConnected} 
      />

      <Router>
        <Routes>
          <Route path="/" element={<AuthLayout />}>
            <Route path="/login" element={<Auth />} />
          </Route>
          <Route path="/" element={<MainLayout socketContext={socketContext} />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<ClientList />} />
              <Route path="assurance-cases" element={<AssuranceList />} />
              <Route path="payments" element={<PaymentsList />} />
              <Route path="documents" element={<DocumentsList />} />
              <Route path="user-management" element={<UserManagement />} />
            </Route>
          </Route>
        </Routes>
      </Router>
      
      {/* Optional: Server offline indicator that shows when completely disconnected */}
      {!socketConnected && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer" onClick={retryConnection}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Server Offline - Click to Reconnect</span>
        </div>
      )}
    </>
  );
}

export default App;