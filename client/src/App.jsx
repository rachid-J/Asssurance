import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Auth } from './Auth/Auth'
import Dashboard from './components/Dashboard/Dashboard'
import Layout from './components/Common/Layout'
import ClientList from './components/ClientManagement/ClientList'
import AssuranceList from './components/AssuranceCase/AssuranceList'
import PaymentsList from './components/Payments/PaymentsList'
import DocumentsList from './components/Documents/DocumentsList'
import { AuthLayout } from './Layouts/AuthLayout'
import { MainLayout } from './Layouts/MainLayout'
import { UserManagement } from './components/Users/UserManagement'

function App() {
  return (
    <Router>
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
            <Route path="assurance-cases" element={<AssuranceList />} />
            <Route path="payments" element={<PaymentsList />} />
            <Route path="documents" element={<DocumentsList />} />
            <Route path="user-management" element={<UserManagement />} />
          </Route>
        </Route>
        {/* Redirect to login if no match */}
      </Routes>
    </Router>
  )
}

export default App
