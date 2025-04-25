import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon, DocumentTextIcon, CalendarIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import PaymentModal from './PaymentModal';
import { getPolicies, getPolicyTotals, getPolicyPayments } from '../../service/policyservice';

export default function AssuranceList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [period, setPeriod] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [totals, setTotals] = useState({ count: 0, primeHT: 0, primeTTC: 0 });

  // Calculate date range
  const getDateRange = () => {
    if (period === 'all') {
      return {
        start: new Date(0), // Earliest possible date
        end: new Date(8640000000000000) // Latest possible date
      };
    }

    const days = parseInt(period);
    const start = new Date(startDate || new Date().setDate(new Date().getDate() - days));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  // Fetch policies with filter parameters
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();

      // Build query parameters
      const params = {
        search: searchTerm,
        period: period !== 'all' ? period : null
      };

      if (startDate) {
        params.startDate = start.toISOString().split('T')[0];
        params.endDate = end.toISOString().split('T')[0];
      }

      const data = await getPolicies(params);
      setPolicies(data);

      // Fetch totals
      const totalsData = await getPolicyTotals(params);
      setTotals(totalsData);

      setError(null);
    } catch (err) {
      console.error("Error fetching policies:", err);
      setError("Failed to load policies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchPolicies();
  }, []);

  // Reload data when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPolicies();
    }, 500); // Debounce to avoid too many requests

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, period, startDate]);

  // Fetch payments for a policy
  const fetchPayments = async (policyId) => {
    try {
      const data = await getPolicyPayments(policyId);
      
      setPayments(data);
    
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  // Get payment status for a policy
  const getPaymentStatus = (policyNumber) => {
    const policyPayments = payments.filter(payment => payment.policy === policyNumber);
    const paidAdvances = policyPayments.filter(payment => payment.paymentDate).length;
    const totalAdvances = policyPayments.length || 4;
    
    const paidAmount = policyPayments
      .filter(payment => payment.paymentDate)
      .reduce((sum, payment) => sum + payment.amount, 0);
  
    const policy = policies.find(p => p.policyNumber === policyNumber);
    const totalAmount = policy ? policy.primeTTC : 0;
    const remainingAmount = Math.max(totalAmount - paidAmount, 0);
  
    return {
      paidAdvances,
      totalAdvances,
      paidAmount,
      totalAmount,
      remainingAmount,
      paymentPercentage: totalAmount > 0 ? 
        Math.min((paidAmount / totalAmount) * 100, 100) : 0
    };
  };

  // Open payment details modal
  const openPaymentDetails = async (policy) => {
    setSelectedPolicy(policy);
    await fetchPayments(policy._id);
    setShowPaymentModal(true);
  };



  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtered policies - now handled on the server side with the search parameter

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
              onClick={() => setShowCreateModal(true)}
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
                disabled={period === 'all'}
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
                onChange={(e) => setPeriod(e.target.value)}
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
                  {period === 'all' ? 'All Time' :
                    `${getDateRange().start.toLocaleDateString()} - ${getDateRange().end.toLocaleDateString()}`}
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
                {totals.primeHT?.toFixed(2)} MAD
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Total TTC</h3>
                <span className="text-sm text-gray-400">{totals.count} policies</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-green-600">
                {totals.primeTTC?.toFixed(2)} MAD
              </p>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E265F]"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mt-8">
            <p>{error}</p>
            <button
              onClick={fetchPolicies}
              className="mt-2 text-red-600 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Policies Table */}
        {!loading && !error && (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  {policies.length === 0 ? (
                    <div className="bg-white p-8 text-center">
                      <p className="text-gray-500">No policies found. Adjust your search criteria or add a new policy.</p>
                    </div>
                  ) : (
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
                        {policies.map((policy) => {
                          // Use paymentStatus from the server if available, otherwise calculate locally
                          const paymentStatus = policy.paymentStatus || getPaymentStatus(policy.policyNumber);
                          console.log(paymentStatus)
                          return (
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
              {paymentStatus?.paidAdvances || 0} of {paymentStatus?.totalAdvances} advances paid
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  (paymentStatus?.paymentPercentage || 0) < 33 ? 'bg-red-500' :
                  (paymentStatus?.paymentPercentage || 0) < 66 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${paymentStatus?.paymentPercentage || 0}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              {(paymentStatus?.paidAmount || 0).toFixed(2)} / {(paymentStatus?.totalAmount || 0).toFixed(2)} MAD
              <br />
              Remaining: {(paymentStatus?.remainingAmount || 0).toFixed(2)} MAD
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
                                  >
                                    Edit
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Payment Modal */}
      {showPaymentModal && selectedPolicy && (
  <PaymentModal
    isOpen={showPaymentModal}
    onClose={() => setShowPaymentModal(false)}
    policy={selectedPolicy}
    payments={payments}
    onPaymentUpdated={() => {
      fetchPayments(selectedPolicy._id);
      fetchPolicies(); // Refresh the policies list to update payment status
    }}
  />
)}
      {showCreateModal && (
        <CreatePolicyModal
          onClose={() => setShowCreateModal(false)}
          onPolicyCreated={() => {
            fetchPolicies(); // Refresh the policy list after creation
          }}
        />
      )}
    </>
  );
}