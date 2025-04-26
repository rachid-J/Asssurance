import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { createPayment } from '../../service/policyservice';

export default function PaymentModal({ isOpen, onClose, policy, payments, onPaymentUpdated }) {
  const [localPayments, setLocalPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedAdvance, setSelectedAdvance] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const modalRef = useRef(null);

  // Get the total policy amount (using primeActuel if available, otherwise primeTTC)
  const getTotalPolicyAmount = () => {
    return policy?.primeActuel || policy?.primeTTC || 0;
  };

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
      // Get the total amount to be used for payments
      const totalAmount = getTotalPolicyAmount();
      
      // If payments are provided, use them
      if (payments && payments.length > 0) {
        setLocalPayments(payments);
        
        // Find first unpaid advance to select by default
        const firstUnpaidAdvance = payments.find(p => !p.paymentDate);
        if (firstUnpaidAdvance) {
          handleAdvanceSelection(firstUnpaidAdvance.advanceNumber);
        } else {
          // All advances are paid, select the first one
          handleAdvanceSelection(payments[0].advanceNumber);
        }
      } else {
        // Otherwise create 4 default advances
        const defaultAdvances = [1, 2, 3, 4].map(num => ({
          advanceNumber: num,
          paymentDate: null,
          amount: totalAmount / 4, // Split into 4 equal payments by default
          paymentMethod: null,
          reference: '',
          notes: ''
        }));
        setLocalPayments(defaultAdvances);
        
        // Set default payment amount based on total divided by 4
        setPaymentAmount((totalAmount / 4).toFixed(2));
        handleAdvanceSelection(1);
      }
    }
  }, [isOpen, policy, payments]);

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

  // Check if an advance is already paid
  const isAdvancePaid = (advanceNumber) => {
    const advance = localPayments.find(p => p.advanceNumber === advanceNumber);
    return advance && advance.paymentDate;
  };

  // Handle payment submission
  const handleSubmitPayment = async () => {
    try {
      // Prevent submitting payment for already paid advance
      if (isAdvancePaid(selectedAdvance)) {
        setError(`Advance ${selectedAdvance} has already been paid. Please select another advance.`);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Advance payment
      const paymentData = {
        advanceNumber: selectedAdvance,
        paymentDate,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        reference,
        notes
      };

      // Check for existing payment record (to update)
      const existingPayment = localPayments.find(p => 
        p.advanceNumber === selectedAdvance && p._id
      );

      if (existingPayment) {
        // Handle update if you have an updatePayment function
        // await updatePayment(existingPayment._id, paymentData);
        console.log("Would update existing payment:", existingPayment._id);
      } else {
        await createPayment(policy._id, paymentData);
      }

      // Update local state
      const updatedPayments = localPayments.map(p => 
        p.advanceNumber === selectedAdvance ? 
        { ...p, ...paymentData } : p
      );
      setLocalPayments(updatedPayments);
      
      setSuccess(`Payment for advance ${selectedAdvance} recorded successfully!`);
      
      // Notify parent component
      if (onPaymentUpdated) {
        onPaymentUpdated();
      }
      
      // Find next unpaid advance to select
      const nextUnpaid = updatedPayments.find(p => !p.paymentDate && p.advanceNumber !== selectedAdvance);
      if (nextUnpaid) {
        handleAdvanceSelection(nextUnpaid.advanceNumber);
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
    const totalAmount = getTotalPolicyAmount();
    const paidAmount = localPayments
      .filter(payment => payment.paymentDate)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    // Check how many advances are needed based on current paid amount
    let requiredAdvances = 4; // Default number of advances
    
    if (paidAmount >= totalAmount) {
      // If already fully paid, calculate how many advances were used
      const advancesWithPayments = localPayments.filter(payment => payment.paymentDate);
      requiredAdvances = advancesWithPayments.length;
    } else {
      // Calculate remaining advances needed based on unpaid amount
      const remainingAmount = totalAmount - paidAmount;
      const advanceAmount = totalAmount / 4;
      const remainingAdvances = Math.ceil(remainingAmount / advanceAmount);
      requiredAdvances = paidAdvances + remainingAdvances;
      // Ensure at least 1 advance and max 4 advances
      requiredAdvances = Math.max(1, Math.min(4, requiredAdvances));
    }
    
    return {
      paidAdvances,
      totalAdvances: Math.max(paidAdvances, requiredAdvances),
      paidAmount,
      totalAmount,
      paymentPercentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
      requiredAdvances,
      isFullyPaid: paidAmount >= totalAmount
    };
  };

  const paymentStatus = getPaymentStatus();
  
  // Get visible advances - if payment is full, show only necessary advances
  const getVisibleAdvances = () => {
    // If policy is already fully paid, show only the advances used
    if (paymentStatus.paidAmount >= paymentStatus.totalAmount) {
      return localPayments
        .filter(payment => payment.paymentDate)
        .map(payment => payment.advanceNumber);
    }

    // If not fully paid, calculate how many advances are needed
    const visibleAdvanceCount = paymentStatus.requiredAdvances;
    return Array.from({ length: visibleAdvanceCount }, (_, i) => i + 1);
  };

  const visibleAdvances = getVisibleAdvances();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Modal panel */}
        <div 
          ref={modalRef}
          className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl"
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
          
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left side - Policy Information */}
            <div className="bg-gray-50 p-6 border-r border-gray-200">
              <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                Policy Details
              </h3>
              
              {policy && (
                <div className="space-y-6">
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
                    <p className="text-base font-medium text-gray-900">{getTotalPolicyAmount().toFixed(2)} MAD</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(policy.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Payment Status */}
              <div className="mt-8">
                <h4 className="text-md font-semibold text-gray-700 mb-4">Payment Status</h4>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700 font-medium">
                    {paymentStatus.paidAdvances} of {paymentStatus.requiredAdvances} advances paid
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        paymentStatus.paymentPercentage < 33 ? 'bg-red-500' :
                        paymentStatus.paymentPercentage < 66 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, paymentStatus.paymentPercentage)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">
                      {paymentStatus.paidAmount.toFixed(2)} MAD paid
                    </span>
                    <span className="text-gray-500">
                      of {paymentStatus.totalAmount.toFixed(2)} MAD
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Payment History - Only show visible advances */}
              <div className="mt-8">
                <h4 className="text-md font-semibold text-gray-700 mb-4">Payment History</h4>
                <div className="space-y-2">
                  {localPayments
                    .filter(payment => visibleAdvances.includes(payment.advanceNumber))
                    .map((payment, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-md border ${payment.paymentDate 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-100 border-gray-200'}`}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">Advance {payment.advanceNumber}</span>
                          <span className={payment.paymentDate ? 'text-green-700' : 'text-gray-500'}>
                            {payment.paymentDate 
                              ? new Date(payment.paymentDate).toLocaleDateString() 
                              : 'Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-gray-600">
                            {payment.paymentMethod ? payment.paymentMethod.replace('_', ' ').toUpperCase() : '-'}
                          </span>
                          <span className="font-medium">
                            {payment.amount?.toFixed(2)} MAD
                          </span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            
            {/* Right side - Payment Form */}
            <div className="p-6">
              <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                Record Payment
              </h3>
              
              {/* Advance Selection - Only show visible advances */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Select Advance</h4>
                <div className="grid grid-cols-4 gap-2">
                  {visibleAdvances.map((advanceNum) => {
                    const advance = localPayments.find(p => p.advanceNumber === advanceNum);
                    const isPaid = advance && advance.paymentDate;
                    
                    return (
                      <button
                        key={advanceNum}
                        type="button"
                        className={`relative rounded-md px-3 py-2 text-sm font-medium ${
                          selectedAdvance === advanceNum
                            ? isPaid 
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-[#1E265F] text-white'
                            : isPaid
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                        onClick={() => handleAdvanceSelection(advanceNum)}
                        disabled={isPaid}
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

              {/* Payment Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      id="payment-date"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      disabled={isAdvancePaid(selectedAdvance)}
                    />
                  </div>

                  <div>
                    <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (MAD)
                    </label>
                    <input
                      type="number"
                      id="payment-amount"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      disabled={isAdvancePaid(selectedAdvance)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      id="payment-method"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={isAdvancePaid(selectedAdvance)}
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="check">Check</option>
                      <option value="card">Card</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                      Reference
                    </label>
                    <input
                      type="text"
                      id="reference"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Check #, Transaction ID, etc."
                      disabled={isAdvancePaid(selectedAdvance)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isAdvancePaid(selectedAdvance)}
                  />
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
              
              {/* Payment status message - when fully paid */}
              {paymentStatus.isFullyPaid && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Policy is fully paid in {paymentStatus.paidAdvances} {paymentStatus.paidAdvances === 1 ? 'advance' : 'advances'}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md bg-[#1E265F] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#272F65] disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={handleSubmitPayment}
                  disabled={loading || paymentStatus.isFullyPaid || isAdvancePaid(selectedAdvance)}
                >
                  {loading ? 'Processing...' : isAdvancePaid(selectedAdvance) ? 'Already Paid' : 'Save Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}