import { useState, useEffect, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  CreditCardIcon, 
  PencilIcon, 
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { getPolicies, getPolicyTotals } from '../../service/policyservice';
import { useNavigate } from 'react-router-dom';

export default function AssuranceList() {
  const navigate = useNavigate();
  
  // State management
  const [filters, setFilters] = useState({
    searchTerm: '',
    startDate: '',
    period: 'all'
  });
  const [data, setData] = useState({
    policies: [],
    totals: { count: 0, primeHT: 0, primeTTC: 0 }
  });
  const [status, setStatus] = useState({
    loading: true,
    error: null
  });

  // Derived date range based on period and start date
  const dateRange = useMemo(() => {
    if (filters.period === 'all') return { start: null, end: null };
  
    const days = parseInt(filters.period);
    let startDateObj = filters.startDate ? new Date(filters.startDate) : new Date();
    
    if (!filters.startDate) {
      startDateObj.setDate(startDateObj.getDate() - days + 1);
    }
  
    // Set local time boundaries
    const start = new Date(startDateObj);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1);
    end.setHours(23, 59, 59, 999);
  
    return { start, end };
  }, [filters.period, filters.startDate]);

  // Format date to YYYY-MM-DD
  const formatDateForAPI = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  
  // Fetch policies with current filters
  const fetchPolicies = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const params = { search: filters.searchTerm };
      
      if (filters.period !== 'all') {
        const { start, end } = dateRange;
        if (start && end) {
          params.startDate = formatDateForAPI(start);
          params.endDate = formatDateForAPI(end);
        }
      }
  
      const [policiesData, totalsData] = await Promise.all([
        getPolicies(params),
        getPolicyTotals(params)
      ]);
      
      setData(prev => ({
        ...prev,
        policies: policiesData,
        totals: totalsData
      }));
      
      setStatus(prev => ({ ...prev, error: null }));
    } catch (err) {
      console.error("Error fetching policies:", err);
      setStatus(prev => ({ 
        ...prev, 
        error: "Failed to load policies. Please try again." 
      }));
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Navigate to policy details
  const goToPolicyDetails = (policyId) => {
    navigate(`/assurance-cases/${policyId}`);
  };

  // Calculate payment status for a policy
  const getPaymentStatus = (policy) => {
    const policyPayments = policy.payments || [];
    
    const paidAdvances = policyPayments.filter(p => p.paymentDate).length;
    const totalAdvances = policyPayments.length || 4;
    
    const paidAmount = policyPayments
      .filter(p => p.paymentDate)
      .reduce((sum, p) => sum + p.amount, 0);
  
    const totalAmount = policy.primeActuel || 0;
    const remainingAmount = Math.max(totalAmount - paidAmount, 0);
  
    return {
      paidAdvances,
      totalAdvances,
      paidAmount,
      totalAmount,
      remainingAmount,
      paymentPercentage: totalAmount > 0 
        ? Math.min((paidAmount / totalAmount) * 100, 100)
        : 0
    };
  };

  // Initial data load
  useEffect(() => {
    fetchPolicies();
  }, []);

  // Reload data when filters change (with debounce)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPolicies();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters.searchTerm, filters.period, filters.startDate]);

  return (
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
            onClick={() => navigate('/policies/new')}
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
              className="block w-full rounded-md border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1E265F] sm:text-sm"
              value={filters.startDate}
              onChange={(e) => {
                const selected = e.target.value;
                if (selected <= new Date().toISOString().split('T')[0]) {
                  handleFilterChange('startDate', selected);
                }
              }}
              max={new Date().toISOString().split('T')[0]}
              disabled={filters.period === 'all'}
            />
          </div>

          {/* Period Selector */}
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full rounded-md border-0 py-2.5 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#1E265F] sm:text-sm"
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
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
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>
        </div>

        {/* Totals Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Date Range</h3>
              <span className="text-sm text-gray-400">
                {filters.period === 'all' ? 'All Time' :
                  dateRange.start && dateRange.end ? 
                  `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}` : 
                  'Select dates'}
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {filters.period === 'all' ? 'All Policies' : `${filters.period} Days`}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total HT</h3>
              <span className="text-sm text-gray-400">{data.totals.count} policies</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-blue-600">
              {data.totals.primeHT?.toFixed(2)} MAD
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total TTC</h3>
              <span className="text-sm text-gray-400">{data.totals.count} policies</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-green-600">
              {data.totals.primeTTC?.toFixed(2)} MAD
            </p>
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {status.loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E265F]"></div>
        </div>
      )}

      {status.error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mt-8">
          <p>{status.error}</p>
          <button
            onClick={fetchPolicies}
            className="mt-2 text-red-600 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Policies Table */}
      {!status.loading && !status.error && (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                {data.policies.length === 0 ? (
                  <div className="bg-white p-8 text-center">
                    <p className="text-gray-500">No policies found. Adjust your search criteria or add a new policy.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        {[
                          "Client", 
                          "Policy Number", 
                          "Type", 
                          "Status",
                          "Prime TTC", 
                          "Start Date", 
                          "Payment Status", 
                          "Actions"
                        ].map((header) => (
                          <th
                            key={header}
                            className={`px-4 py-3.5 text-left text-sm font-semibold text-gray-900 ${
                              ['Prime TTC'].includes(header) ? 'text-right' : ''
                            }`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data.policies.map((policy) => {
                        const paymentStatus = policy.paymentStatus || getPaymentStatus(policy);
                        
                        return (
                          <tr 
                            key={policy._id}
                            className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                            onClick={() => goToPolicyDetails(policy._id)}
                          >
                            {/* Client */}
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {policy.clientName}
                            </td>
                            
                            {/* Policy Number */}
                            <td className="px-4 py-3 text-sm text-gray-600">
                              #{policy.policyNumber}
                            </td>

                            {/* Type */}
                            <td className="px-4 py-3 text-sm text-gray-600">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {policy.insuranceType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
  {policy.status === 'active' ? (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Active
    </span>
  ) : policy.status === 'expired' ? (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
      Expired
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      Canceled
    </span>
  )}
</td>

                            {/* Prime TTC */}
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">
                              <span className="font-medium">
                                {policy.primeTTC.toFixed(2)} MAD
                              </span>
                            </td>

                            {/* Start Date */}
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(policy.startDate).toLocaleDateString('en-GB')}
                            </td>

                            {/* Payment Status */}
                            <td className="px-4 py-3 text-sm">
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">
                                    {paymentStatus.paidAdvances}/{paymentStatus.totalAdvances} paid
                                  </span>
                                  <span className="font-medium text-gray-700">
                                    {paymentStatus.paymentPercentage.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      paymentStatus.paymentPercentage < 33 ? 'bg-red-600' :
                                      paymentStatus.paymentPercentage < 66 ? 'bg-yellow-500' : 'bg-green-600'
                                    }`}
                                    style={{ width: `${paymentStatus.paymentPercentage}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            
                            
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-3">
                                <button
                                  className="text-gray-400 hover:text-blue-600 transition-colors"
                                  title="View Details"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    goToPolicyDetails(policy._id);
                                  }}
                                >
                                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                                  title="Edit Policy"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/policies/${policy._id}/edit`);
                                  }}
                                >
                                  <PencilIcon className="h-5 w-5" />
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
  );
}