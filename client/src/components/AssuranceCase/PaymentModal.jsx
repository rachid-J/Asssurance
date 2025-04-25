import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { createPayment } from '../../service/policyservice';

export default function PaymentModal({ isOpen, onClose, policy, payments, onPaymentUpdated }) {
  const [localPayments, setLocalPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [paymentType, setPaymentType] = useState('advance'); // 'advance' or 'full'
  const [selectedAdvance, setSelectedAdvance] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const modalRef = useRef(null);

  // Close when clicking outside the modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    // Add event listener only if modal is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key press
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Initialize payments when modal opens
  useEffect(() => {
    if (isOpen && policy) {
      // If payments are provided, use them
      if (payments && payments.length > 0) {
        setLocalPayments(payments);
      } else {
        // Otherwise create 4 default advances
        const defaultAdvances = [1, 2, 3, 4].map(num => ({
          advanceNumber: num,
          paymentDate: null,
          amount: policy.primeTTC / 4, // Split into 4 equal payments by default
          paymentMethod: null,
          reference: '',
          notes: ''
        }));
        setLocalPayments(defaultAdvances);
      }

      // Set default payment amount based on policy
      setPaymentAmount((policy.primeTTC / 4).toFixed(2));
    }
  }, [isOpen, policy, payments]);

  // Handle payment type change
  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    if (type === 'full') {
      setPaymentAmount(policy?.primeTTC.toFixed(2) || 0);
    } else {
      setPaymentAmount((policy?.primeTTC / 4).toFixed(2) || 0);
    }
  };

  // Handle advance selection
  const handleAdvanceSelection = (advanceNumber) => {
    setSelectedAdvance(advanceNumber);
    const advance = localPayments.find(p => p.advanceNumber === advanceNumber);
    if (advance) {
      setPaymentAmount(advance.amount.toFixed(2));
      setPaymentMethod(advance.paymentMethod || 'cash');
      setReference(advance.reference || '');
      setNotes(advance.notes || '');
      if (advance.paymentDate) {
        setPaymentDate(new Date(advance.paymentDate).toISOString().split('T')[0]);
      } else {
        setPaymentDate(new Date().toISOString().split('T')[0]);
      }
    }
  };

  // Handle payment submission
  const handleSubmitPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let paymentData;
      
      if (paymentType === 'full') {
        // Use completeAllPayments endpoint for full payment
        paymentData = {
          paymentDate,
          paymentMethod,
          reference,
          notes: notes + ' (Full payment)',
          totalAmount: remainingAmount
        };
        
        await completeAllPayments(policy._id, paymentData);
        
        // Update local state
        const updatedPayments = localPayments.map(payment => ({
          ...payment,
          paymentDate: paymentData.paymentDate,
          paymentMethod: paymentData.paymentMethod,
          reference: paymentData.reference,
          amount: payment.advanceNumber === 1 ? remainingAmount : 0,
          notes: payment.advanceNumber === 1 ? paymentData.notes : 'Covered by full payment'
        }));
        
        setLocalPayments(updatedPayments);
      } else {
        // Advance payment
        paymentData = {
          advanceNumber: selectedAdvance,
          paymentDate,
          amount: parseFloat(paymentAmount),
          paymentMethod,
          reference,
          notes
        };
  
        // Check for existing payment
        const existingPayment = localPayments.find(p => 
          p.advanceNumber === selectedAdvance && p._id
        );
  
        if (existingPayment) {
          // await updatePayment(existingPayment._id, paymentData);
        } else {
          await createPayment(policy._id, paymentData); // Fixed parameter order
        }
  
        // Update local state
        const updatedPayments = localPayments.map(p => 
          p.advanceNumber === selectedAdvance ? 
          { ...p, ...paymentData } : p
        );
        setLocalPayments(updatedPayments);
      
      
      }
      
      setSuccess(`Payment ${paymentType === 'full' ? 'in full' : `for advance ${selectedAdvance}`} recorded successfully!`);
      
      // Notify parent component
      if (onPaymentUpdated) {
        onPaymentUpdated();
      }
      
      // Reset form after success
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate payment status
  const getPaymentStatus = () => {
    const paidAdvances = localPayments.filter(payment => payment.paymentDate).length;
    const totalAdvances = localPayments.length;
    const paidAmount = localPayments
      .filter(payment => payment.paymentDate)
      .reduce((sum, payment) => sum + payment.amount, 0);
    const totalAmount = policy?.primeTTC || 0;
    
    return {
      paidAdvances,
      totalAdvances,
      paidAmount,
      totalAmount,
      paymentPercentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
    };
  };

  const paymentStatus = getPaymentStatus();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      
      {/* Modal container */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Modal panel */}
        <div 
          ref={modalRef}
          className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          style={{
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1E265F] focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-xl font-semibold leading-6 text-gray-900" id="modal-title">
                Payment Details
              </h3>
              
              {policy && (
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Client</h4>
                      <p className="text-base font-medium text-gray-900">{policy.clientName}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Policy Number</h4>
                      <p className="text-base font-medium text-gray-900">{policy.policyNumber}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                      <p className="text-base font-medium text-gray-900">{policy.primeTTC?.toFixed(2)} MAD</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                      <p className="text-base font-medium text-gray-900">
                        {new Date(policy.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Payment Status */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700">Payment Status</h4>
                <div className="mt-2 flex flex-col space-y-1">
                  <div className="text-sm text-gray-500">
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
                  <div className="text-sm text-gray-500">
                    {paymentStatus.paidAmount.toFixed(2)} / {paymentStatus.totalAmount.toFixed(2)} MAD
                  </div>
                </div>
              </div>

              {/* Payment Type Selection */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700">Payment Type</h4>
                <div className="mt-2 flex space-x-4">
                  <button
                    type="button"
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      paymentType === 'advance' 
                        ? 'bg-[#1E265F] text-white' 
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                    onClick={() => handlePaymentTypeChange('advance')}
                  >
                    Advance Payment
                  </button>
                  <button
                    type="button"
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      paymentType === 'full' 
                        ? 'bg-[#1E265F] text-white' 
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                    onClick={() => handlePaymentTypeChange('full')}
                  >
                    Full Payment
                  </button>
                </div>
              </div>

              {/* Advance Selection (only for advance payment) */}
              {paymentType === 'advance' && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700">Select Advance</h4>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((advanceNum) => {
                      const advance = localPayments.find(p => p.advanceNumber === advanceNum);
                      const isPaid = advance && advance.paymentDate;
                      
                      return (
                        <button
                          key={advanceNum}
                          type="button"
                          className={`relative rounded-md px-3 py-2 text-sm font-medium ${
                            selectedAdvance === advanceNum
                              ? 'bg-[#1E265F] text-white'
                              : isPaid
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                          onClick={() => handleAdvanceSelection(advanceNum)}
                        >
                          {isPaid && (
                            <CheckCircleIcon className="h-4 w-4 absolute top-1 right-1 text-green-500" />
                          )}
                          Advance {advanceNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment Form */}
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700">
                    Payment Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      id="payment-date"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700">
                    Amount (MAD)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="payment-amount"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <div className="mt-1">
                    <select
                      id="payment-method"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="check">Check</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                    Reference
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="reference"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Check #, Transaction ID, etc."
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="notes"
                      rows={3}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Success/Error Messages */}
              {success && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-[#1E265F] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#272F65] sm:ml-3 sm:w-auto"
              onClick={handleSubmitPayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Save Payment'}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

