import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import PaymentModal from './PaymentModal';
import { getPolicyById, getPolicyPayments } from '../../service/policyservice';

export default function PolicyDetailPage() {
  const { policyId } = useParams();
  const navigate = useNavigate();

  // State management
  const [policy, setPolicy] = useState(null);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [modals, setModals] = useState({
    payment: false
  });
  const [status, setStatus] = useState({
    loading: true,
    error: null
  });
  console.log(policyId)
  // Fetch policy data
  const fetchPolicyData = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));

      const policyData = await getPolicyById(policyId);


      const paymentsData = await getPolicyPayments(policyId);

      // In a real app, you'd fetch documents too
      const documentsData = [
        { id: 1, name: 'Policy Contract', type: 'PDF', createdAt: '2023-05-15', size: '1.2 MB' },
        { id: 2, name: 'Terms and Conditions', type: 'PDF', createdAt: '2023-05-15', size: '0.8 MB' },
        { id: 3, name: 'Client ID Scan', type: 'JPG', createdAt: '2023-05-14', size: '2.1 MB' }
      ];

      setPolicy(policyData);
      setPayments(paymentsData);
      setDocuments(documentsData);
      setStatus({ loading: false, error: null });
    } catch (err) {
      console.error("Error fetching policy data:", err);
      setStatus({
        loading: false,
        error: "Failed to load policy details. Please try again."
      });
    }
  };

  // Toggle modals
  const toggleModal = (modalName, isOpen) => {
    setModals(prev => ({ ...prev, [modalName]: isOpen }));
  };

  // Calculate payment status
  const getPaymentStatus = () => {
    if (!policy || !payments.length) return {
      paidAdvances: 0,
      totalAdvances: 4,
      paidAmount: 0,
      totalAmount: 0,
      remainingAmount: 0,
      paymentPercentage: 0
    };

    const paidAdvances = payments.filter(p => p.paymentDate).length;
    const totalAdvances = payments.length;

    const paidAmount = payments
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

  // Load data on component mount
  useEffect(() => {
    if (policyId) {
      fetchPolicyData();
    }
  }, [policyId]);

  // Handle payment update
  const handlePaymentUpdated = async () => {
    // Refresh payments data
    try {
      const paymentsData = await getPolicyPayments(policyId);
      setPayments(paymentsData);
    } catch (err) {
      console.error("Error refreshing payments:", err);
    }
  };

  if (status.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E265F]"></div>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/assurance-cases')}
            className="mr-4 p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Error Loading Policy</h1>
        </div>

        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <p>{status.error}</p>
          <button
            onClick={fetchPolicyData}
            className="mt-2 text-red-600 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/assurance-cases')}
            className="mr-4 p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Policy Not Found</h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
          <p>The requested policy could not be found. It may have been deleted or you may not have permission to view it.</p>
          <button
            onClick={() => navigate('/assurance-cases')}
            className="mt-2 text-yellow-600 underline"
          >
            Return to Policies
          </button>
        </div>
      </div>
    );
  }

  const paymentStatus = getPaymentStatus();

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/assurance-cases')}
            className="mr-4 p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{policy.clientName || 'Loading...'}</h1>
            <p className="text-sm text-gray-600">
              Policy #{policy.policyNumber} • {policy.vehicleInfo}
            </p>

          </div>
        </div>
        <div className="flex space-x-3">
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
            onClick={() => navigate(`/policies/${policyId}/edit`)}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Policy
          </button>
          <button
            className="inline-flex items-center px-3 py-2 border border-[#1E265F] shadow-sm text-sm font-medium rounded-md text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
            onClick={() => toggleModal('payment', true)}
          >
            <CreditCardIcon className="h-4 w-4 mr-2" />
            Manage Payments
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy Information */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Policy Information</h2>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <dt className="text-sm font-medium text-gray-500">Insurance Type</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {policy.insuranceType}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Usage</dt>
                <dd className="mt-1 text-sm text-gray-900">{policy.usage}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-1.5" />
                    {new Date(policy.startDate).toLocaleDateString('en-GB')}
                  </div>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-1.5" />
                    {policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-GB') : 'N/A'}
                  </div>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Prime HT</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{policy.primeHT?.toFixed(2)} MAD</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Prime TTC</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{policy.primeTTC?.toFixed(2)} MAD</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Prime Actuel</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{policy.primeActuel?.toFixed(2)} MAD</dd>
              </div>

              <div className="mt-1">
                {policy.status === 'canceled' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircleIco className="h-3.5 w-3.5 mr-1" />
                    Canceled
                  </span>
                ) : policy.status === 'expired' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1" />
                    Expired
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                    Active
                  </span>
                )}
              </div>
            </dl>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500">Comment</h3>
              <p className="mt-1 text-sm text-gray-900">{policy.comment || 'No comment provided.'}</p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Payment Status</h2>
          </div>
          <div className="px-6 py-5">
            <div className="flex flex-col gap-3">
              <div className="mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Payment Progress</span>
                  <span className="font-medium text-gray-900">
                    {paymentStatus.paymentPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className={`h-2.5 rounded-full ${paymentStatus.paymentPercentage < 33 ? 'bg-red-600' :
                      paymentStatus.paymentPercentage < 66 ? 'bg-yellow-500' : 'bg-green-600'
                      }`}
                    style={{ width: `${paymentStatus.paymentPercentage}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-gray-500">Paid Amount</dt>
                    <dd className="mt-1 text-sm font-medium text-green-600">
                      {paymentStatus.paidAmount.toFixed(2)} MAD
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Remaining</dt>
                    <dd className="mt-1 text-sm font-medium text-red-600">
                      {paymentStatus.remainingAmount.toFixed(2)} MAD
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Total Amount</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">
                      {paymentStatus.totalAmount.toFixed(2)} MAD
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Installments Paid</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">
                      {paymentStatus.paidAdvances} of {paymentStatus.totalAdvances}
                    </dd>
                  </div>
                </dl>
              </div>

              <button
                className="mt-4 w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
                onClick={() => toggleModal('payment', true)}
              >
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Manage Payments
              </button>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Policy Documents</h2>
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Upload Document
            </button>
          </div>
          <div className="px-6 py-5">
            {documents.length === 0 ? (
              <div className="text-center py-6">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by uploading a new document.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden bg-white shadow sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <li key={doc.id}>
                      <div className="flex items-center px-4 py-4 sm:px-6">
                        <div className="flex min-w-0 flex-1 items-center">
                          <div className="flex-shrink-0">
                            <DocumentTextIcon className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4 min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-[#1E265F]">{doc.name}</div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <span className="truncate">
                                {doc.type} • {doc.size} • {new Date(doc.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-5 flex-shrink-0">
                          <button
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Payments History */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Payment History</h2>
          </div>
          <div className="px-6 py-5">
            {payments.length === 0 ? (
              <div className="text-center py-6">
                <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payment history</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No payments have been recorded for this policy yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Due
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment, idx) => (
                      <tr key={payment._id || idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payment.dueDate).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.amount?.toFixed(2)} MAD
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.paymentDate
                            ? new Date(payment.paymentDate).toLocaleDateString('en-GB')
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.paymentMethod || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.paymentDate ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Paid
                            </span>
                          ) : new Date(payment.dueDate) < new Date() ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Overdue
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {modals.payment && policy && (
        <PaymentModal
          isOpen={modals.payment}
          onClose={() => toggleModal('payment', false)}
          policy={policy}
          payments={payments}
          onPaymentUpdated={handlePaymentUpdated}
        />
      )}
    </div>
  );
}