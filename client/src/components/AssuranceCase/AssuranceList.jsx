import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon, DocumentTextIcon, CalendarIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import PaymentModal from './PaymentModal';
import axios from 'axios';

export default function AssuranceList() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [totals, setTotals] = useState({ count: 0, primeHT: 0, primeTTC: 0 });

  // Fetch policies on component mount and when filters change
  useEffect(() => {
    fetchPolicies();
    fetchTotals();
  }, [searchTerm, startDate, endDate, period]);

  // Fetch policies from API
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (period !== 'all') {
        queryParams.append('period', period);
      }
      
      if (startDate && endDate) {
        queryParams.append('startDate', startDate);
        queryParams.append('endDate', endDate || new Date().toISOString().split('T')[0]);
      }
      
      const response = await axios.get(`/api/policies?${queryParams.toString()}`);
      setPolicies(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError('Failed to load policies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch totals from API
  const fetchTotals = async () => {
    try {
      let queryParams = new URLSearchParams();
      
      if (period !== 'all') {
        // Calculate date range based on period
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - parseInt(period));
        
        queryParams.append('startDate', startDate.toISOString().split('T')[0]);
        queryParams.append('endDate', today.toISOString().split('T')[0]);
      } else if (startDate && endDate) {
        queryParams.append('startDate', startDate);
        queryParams.append('endDate', endDate);
      }
      
      const response = await axios.get(`/api/policies/totals?${queryParams.toString()}`);
      setTotals(response.data);
    } catch (err) {
      console.error('Error fetching totals:', err);
    }
  };

  // Handle period selection
  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setPeriod(newPeriod);
    
    if (newPeriod !== 'all') {
      // Clear custom date range when selecting a predefined period
      setStartDate('');
      setEndDate('');
    }
  };

  // Calculate date range for display
  const getDateRangeDisplay = () => {
    if (period === 'all') {
      return 'All Time';
    }
    
    if (startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    }
    
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - parseInt(period));
    
    return `${pastDate.toLocaleDateString()} - ${today.toLocaleDateString()}`;
  };

  // Open payment details modal
  const openPaymentDetails = (policy) => {
    setSelectedPolicy(policy);
    setShowPaymentModal(true);
  };

  // Handle payment update
  const handlePaymentUpdate = async (policyId, advanceNumber, paymentDate) => {
    try {
      await axios.put(`/api/policies/${policyId}/payments/${advanceNumber}`, {
        advanceNumber,
        paymentDate
      });
      
      // Refresh policies to update payment status
      fetchPolicies();
      setShowPaymentModal(false);
    } catch (err) {
      console.error('Error updating payment:', err);
      alert('Failed to update payment. Please try again.');
    }
  };

  // Handle complete all payments
  const handleFullPayment = async (policyId) => {
    try {
      await axios.post(`/api/policies/${policyId}/payments/complete`);
      
      // Refresh policies to update payment status
      fetchPolicies();
      setShowPaymentModal(false);
    } catch (err) {
      console.error('Error completing payments:', err);
      alert('Failed to complete payments. Please try again.');
    }
  };

  // Handle creating a new policy
  const handleCreatePolicy = () => {
    // Redirect to policy creation page or show modal
    window.location.href = '/policies/new';
    // Alternatively: setShowCreatePolicyModal(true);
  };

  return (
    <>
    <div className="p-4 sm:p-6">
      {/* Header Section */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Insurance Policies</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and review all insurance policies
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-[#1E265F] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-[#1E265F] focus:ring-offset-2"
            onClick={handleCreatePolicy}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Policy
          </button>
        </div>
      </div>

      {/* Controls Section */}
      <div className="mt-8 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Date Picker */}
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              className="block w-full rounded-md border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#1E265F] sm:text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              disabled={period !== 'all'}
            />
          </div>

          {/* Period Selector */}
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full rounded-md border-0 py-2.5 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#1E265F] sm:text-sm"
              value={period}
              onChange={handlePeriodChange}
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1E265F] sm:text-sm"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Totals Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Date Range</h3>
              <span className="text-sm text-gray-400">
                {getDateRangeDisplay()}
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {period === 'all' ? 'All Policies' : `${period} Days`}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total HT</h3>
              <span className="text-sm text-gray-400">{totals.count} policies</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-blue-600">
              {totals.primeHT.toFixed(2)} MAD
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total TTC</h3>
              <span className="text-sm text-gray-400">{totals.count} policies</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-green-600">
              {totals.primeTTC.toFixed(2)} MAD
            </p>
          </div>
        </div>
      </div>

      {/* Policies Table */}
      <div className="mt-8 flow-root">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1E265F] border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : (
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Client", "Policy Number", "Type", "Usage", "Comment", "Prime HT", "Prime TTC", "Start Date", "Payment Status", "Actions"].map((header) => (
                        <th
                          key={header}
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {policies.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-3 py-8 text-center text-sm text-gray-500">
                          No policies found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      policies.map((policy) => (
                        <tr key={policy._id}>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                            {policy.clientName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {policy.policyNumber}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {policy.insuranceType}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {policy.usage}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                            {policy.comment}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {policy.primeHT.toFixed(2)} MAD
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {policy.primeTTC.toFixed(2)} MAD
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(policy.startDate).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <div className="flex flex-col space-y-1">
                              <div className="text-xs text-gray-500">
                                {policy.paymentStatus.paidAdvances} of {policy.paymentStatus.totalAdvances} advances paid
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    policy.paymentStatus.paymentPercentage < 33 ? 'bg-red-500' :
                                    policy.paymentStatus.paymentPercentage < 66 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${policy.paymentStatus.paymentPercentage}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {policy.paymentStatus.paidAmount.toFixed(2)} / {policy.primeTTC.toFixed(2)} MAD
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                className="text-[#1E265F] hover:text-[#272F65]"
                                title="View Documents"
                              >
                                <DocumentTextIcon className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                className="text-[#1E265F] hover:text-[#272F65]"
                                title="Payment Details"
                                onClick={() => openPaymentDetails(policy)}
                              >
                                <CreditCardIcon className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                className="text-[#1E265F] hover:text-[#272F65]"
                                onClick={() => window.location.href = `/policies/edit/${policy._id}`}
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    
    {/* Payment Modal */}
    {showPaymentModal && selectedPolicy && (
      <PaymentModal 
        policy={selectedPolicy}
        onClose={() => setShowPaymentModal(false)}
        onPaymentUpdate={(advanceNumber, paymentDate) => 
          handlePaymentUpdate(selectedPolicy._id, advanceNumber, paymentDate)
        }
        onFullPayment={() => handleFullPayment(selectedPolicy._id)}
      />
    )}
    </>
  );
}