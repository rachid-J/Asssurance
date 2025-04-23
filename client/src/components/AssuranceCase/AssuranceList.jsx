import { useState, } from 'react';
import { MagnifyingGlassIcon, PlusIcon, DocumentTextIcon, CalendarIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import PaymentModal from './PaymentModal';

// Sample data for policies
const policies = [
  {
    _id: "1",
    clientId: "1",
    insuranceType: "A.N",
    usage: "E",
    policyNumber: "663071525000012",
    comment: "RES ESP",
    primeHT: 340.09,
    primeTTC: 413.04,
    startDate: new Date().toISOString().split('T')[0],
    clientName: "HAJJI AHMED"
  },
  {
    _id: "2",
    clientId: "2",
    insuranceType: "REN",
    usage: "C2",
    policyNumber: "POL-2025002",
    comment: "Renewal",
    primeHT: 500.00,
    primeTTC: 600.00,
    startDate: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    clientName: "Another Client"
  },
  {
    _id: "3",
    clientId: "3",
    insuranceType: "CV",
    usage: "P",
    policyNumber: "POL-2025003",
    comment: "Commercial Vehicle",
    primeHT: 1200.00,
    primeTTC: 1440.00,
    startDate: new Date(Date.now() - 40 * 86400000).toISOString().split('T')[0],
    clientName: "Business Corp"
  },
];

// Sample data for payments - this would typically be fetched from an API or context
export const payments = [
  {
    _id: "1",
    policyId: "663071525000012",
    advanceNumber: 1,
    paymentDate: "2025-01-02",
    amount: 103.26
  },
  {
    _id: "2",
    policyId: "663071525000012",
    advanceNumber: 2,
    paymentDate: "2025-02-05",
    amount: 103.26
  },
  {
    _id: "3",
    policyId: "663071525000012",
    advanceNumber: 3,
    paymentDate: null,
    amount: 103.26
  },
  {
    _id: "4",
    policyId: "663071525000012",
    advanceNumber: 4,
    paymentDate: null,
    amount: 103.26
  },
  {
    _id: "5",
    policyId: "POL-2025002",
    advanceNumber: 1,
    paymentDate: "2025-01-10",
    amount: 150.00
  },
  {
    _id: "6",
    policyId: "POL-2025002",
    advanceNumber: 2,
    paymentDate: null,
    amount: 150.00
  },
  {
    _id: "7",
    policyId: "POL-2025002",
    advanceNumber: 3,
    paymentDate: null,
    amount: 150.00
  },
  {
    _id: "8",
    policyId: "POL-2025002",
    advanceNumber: 4,
    paymentDate: null,
    amount: 150.00
  },
  {
    _id: "9",
    policyId: "POL-2025003",
    advanceNumber: 1,
    paymentDate: "2025-01-15",
    amount: 1440.00
  }


];

export default function AssuranceList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [period, setPeriod] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [paymentData, setPaymentData] = useState(payments);

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

  // Calculate totals
  const calculateTotals = () => {
    const { start, end } = getDateRange();
    
    return policies.reduce((totals, policy) => {
      const policyDate = new Date(policy.startDate);
      if (period === 'all' || (policyDate >= start && policyDate <= end)) {
        totals.primeHT += policy.primeHT;
        totals.primeTTC += policy.primeTTC;
        totals.count++;
      }
      return totals;
    }, { primeHT: 0, primeTTC: 0, count: 0 });
  };

  const { start, end } = getDateRange();
  const totals = calculateTotals();

  // Get payment status for a policy
  const getPaymentStatus = (policyNumber) => {
    const policyPayments = paymentData.filter(payment => payment.policyId === policyNumber);
    const paidAdvances = policyPayments.filter(payment => payment.paymentDate).length;
    const totalAdvances = policyPayments.length || 4; // Default to 4 if no payments defined
    const remainingAdvances = totalAdvances - paidAdvances;
    
    // Calculate total paid amount
    const paidAmount = policyPayments
      .filter(payment => payment.paymentDate)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    // Find the associated policy to get total amount
    const policy = policies.find(p => p.policyNumber === policyNumber);
    const totalAmount = policy ? policy.primeTTC : 0;
    
    return {
      paidAdvances,
      totalAdvances,
      remainingAdvances,
      paidAmount,
      totalAmount,
      paymentPercentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
    };
  };

  // Filtered policies
  const filteredPolicies = policies.filter(policy => {
    const policyDate = new Date(policy.startDate);
    const matchesDate = period === 'all' || (policyDate >= start && policyDate <= end);
    const matchesSearch = [
      policy.clientName,
      policy.policyNumber,
      policy.comment
    ].some(field => field.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesDate && matchesSearch;
  });

  // Open payment details modal
  const openPaymentDetails = (policy) => {
    setSelectedPolicy(policy);
    setShowPaymentModal(true);
  };

  // Function to handle after a payment is added or updated
  const handlePaymentUpdate = () => {
    // In a real application, you would refetch payment data here
    
    // For demo purposes, let's simulate a payment update
    // This would normally be handled by your backend
    if (selectedPolicy) {
      // Find the next unpaid advance for this policy
      const policyPayments = paymentData.filter(payment => 
        payment.policyId === selectedPolicy.policyNumber
      );
      
      const nextUnpaidAdvance = policyPayments.find(payment => !payment.paymentDate);
      
      if (nextUnpaidAdvance) {
        // Simulate updating the payment
        const updatedPayments = paymentData.map(payment => {
          if (payment._id === nextUnpaidAdvance._id) {
            return {
              ...payment,
              paymentDate: new Date().toISOString().split('T')[0]
            };
          }
          return payment;
        });
        
        setPaymentData(updatedPayments);
      }
    }
    
    setShowPaymentModal(false);
  };

  // Function to handle full payment
  const handleFullPayment = () => {
    // In a real application, you would make an API call here
    
    // For demo purposes, let's simulate updating all remaining payments
    if (selectedPolicy) {
      const updatedPayments = paymentData.map(payment => {
        if (payment.policyId === selectedPolicy.policyNumber && !payment.paymentDate) {
          return {
            ...payment,
            paymentDate: new Date().toISOString().split('T')[0]
          };
        }
        return payment;
      });
      
      setPaymentData(updatedPayments);
    }
    
    setShowPaymentModal(false);
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
                  `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`}
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
                  {filteredPolicies.map((policy) => {
                    const paymentStatus = getPaymentStatus(policy.policyNumber);
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
                              {paymentStatus.paidAdvances} of {paymentStatus.totalAdvances} advances paid
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  paymentStatus.paymentPercentage < 33 ? 'bg-red-500' :
                                  paymentStatus.paymentPercentage < 66 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${paymentStatus.paymentPercentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {paymentStatus.paidAmount.toFixed(2)} / {paymentStatus.totalAmount.toFixed(2)} MAD
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
            </div>
          </div>
        </div>
      </div>

   
    </div>
       {/* Payment Modal */}
       {showPaymentModal && selectedPolicy && (
        <PaymentModal 
          policy={selectedPolicy}
          onClose={() => setShowPaymentModal(false)}
          onPaymentUpdate={handlePaymentUpdate}
          onFullPayment={handleFullPayment}
        />
      )}
      </>
  );
}