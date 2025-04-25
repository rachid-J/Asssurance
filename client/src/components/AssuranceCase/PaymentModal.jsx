import { useState, useEffect } from 'react';
import { updatePayment, completeAllPayments } from '../../service/policyservice';

export default function PaymentModal({ policy, payments, onClose, onPaymentUpdate }) {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isFullPayment, setIsFullPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Ensure payments is always an array even if it's null or undefined
  const paymentArray = Array.isArray(payments) ? payments : [];

  // Sort policy payments by advance number
  const sortedPayments = [...paymentArray].sort((a, b) => a.advanceNumber - b.advanceNumber);

  // Find next unpaid advance - make sure to check if paymentDate is null or undefined
  const nextUnpaidAdvance = sortedPayments.find(payment => 
    payment.paymentDate === null || payment.paymentDate === undefined
  );

  // Log for debugging
  useEffect(() => {
    console.log("Payments data:", sortedPayments);
    console.log("Next unpaid advance:", nextUnpaidAdvance);
  }, [sortedPayments, nextUnpaidAdvance]);

  // Calculate payment statistics
  const paidAmount = sortedPayments
    .filter(payment => payment.paymentDate)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = policy.primeTTC - paidAmount;

  // Initialize form when adding payment
  const handleAddPayment = () => {
    if (nextUnpaidAdvance) {
      setSelectedAdvance(nextUnpaidAdvance);
      setPaymentAmount(nextUnpaidAdvance.amount.toFixed(2));
      setIsFullPayment(false);
      setIsAddingPayment(true);
    }
  };

  // Initialize form for full payment
  const handleFullPayment = () => {
    setSelectedAdvance(null);
    setPaymentAmount(remainingAmount.toFixed(2));
    setIsFullPayment(true);
    setIsAddingPayment(true);
  };

  // Handle payment form submission
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
  
    try {
      // Basic validation
      if (!paymentDate) {
        throw new Error('Payment date is required');
      }
      
      if (parseFloat(paymentAmount) <= 0) {
        throw new Error('Payment amount must be positive');
      }
  
      if (isFullPayment) {
        // For full payments, ensure date is properly formatted
        await completeAllPayments(policy._id, {
          paymentDate: paymentDate, // The service will handle ISO formatting
          paymentMethod,
          reference: paymentReference,
          notes
        });
      } else if (selectedAdvance) {
        // For single advance payment
        await updatePayment(
          policy._id,
          selectedAdvance.advanceNumber,
          {
            paymentDate: paymentDate, // The service will handle ISO formatting
            amount: parseFloat(paymentAmount),
            paymentMethod,
            reference: paymentReference,
            notes
          }
        );
      } else {
        throw new Error('No advance selected for payment');
      }
      
      // Reset form and notify parent
      setIsAddingPayment(false);
      // Wait a moment before refreshing to ensure server updates are complete
      setTimeout(() => {
        onPaymentUpdate();
      }, 500);
    } catch (err) {
      console.error('Payment submission error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#251a6c47] bg-opacity-75 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"> 
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {!isAddingPayment ? (
            <>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Payment Details - {policy.clientName}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Policy Number: {policy.policyNumber}
                      </p>
                      
                      <div className="bg-gray-50 p-3 rounded-md mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Total Policy Amount:</span>
                          <span className="font-semibold">{policy.primeTTC.toFixed(2)} MAD</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="font-medium">Payment Plan:</span>
                          <span>{sortedPayments.length} advances</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="font-medium">Paid So Far:</span>
                          <span>
                            {paidAmount.toFixed(2)} MAD
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="font-medium">Remaining Amount:</span>
                          <span>
                            {remainingAmount.toFixed(2)} MAD
                          </span>
                        </div>
                      </div>
                      
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Advance #</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {sortedPayments.length > 0 ? (
                              sortedPayments.map((payment) => (
                                <tr key={payment._id || `payment-${payment.advanceNumber}`}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                    {payment.advanceNumber}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {payment.amount.toFixed(2)} MAD
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    {payment.paymentDate ? (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Paid
                                      </span>
                                    ) : (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        Pending
                                      </span>
                                    )}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {payment.paymentDate ? 
                                      new Date(payment.paymentDate).toLocaleDateString() : 
                                      "-"
                                    }
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="px-3 py-4 text-sm text-gray-500 text-center">
                                  No payment advances defined for this policy.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {remainingAmount > 0 && (
                  <button 
                    type="button" 
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleFullPayment}
                  >
                    Pay Full Amount
                  </button>
                )}
                {nextUnpaidAdvance && (
                  <button 
                    type="button" 
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#1E265F] text-base font-medium text-white hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleAddPayment}
                  >
                    Add Payment
                  </button>
                )}
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center cursor-pointer rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {isFullPayment 
                        ? `Record Full Payment - ${remainingAmount.toFixed(2)} MAD` 
                        : `Record Payment - Advance #${selectedAdvance?.advanceNumber}`}
                    </h3>
                    
                    {error && (
                      <div className="mt-3 bg-red-50 border border-red-200 text-red-800 p-3 rounded-md">
                        <p>{error}</p>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmitPayment} className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
                            Payment Date
                          </label>
                          <input
                            type="date"
                            id="paymentDate"
                            name="paymentDate"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">
                            Amount (MAD)
                          </label>
                          <input
                            type="number"
                            id="paymentAmount"
                            name="paymentAmount"
                            step="0.01"
                            min="0.01"
                            max={isFullPayment ? remainingAmount : undefined}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            required
                            readOnly={isFullPayment}
                          />
                          {isFullPayment && (
                            <p className="mt-1 text-sm text-gray-500">
                              This will settle the entire remaining policy amount.
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                            Payment Method
                          </label>
                          <select
                            id="paymentMethod"
                            name="paymentMethod"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            required
                          >
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="check">Check</option>
                            <option value="card">Credit/Debit Card</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="paymentReference" className="block text-sm font-medium text-gray-700">
                            Reference (Optional)
                          </label>
                          <input
                            type="text"
                            id="paymentReference"
                            name="paymentReference"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                            placeholder="Check number, transfer ID, etc."
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                            Notes (Optional)
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            rows="3"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                            placeholder="Any additional information about this payment"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          ></textarea>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#1E265F] text-base font-medium text-white hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] sm:ml-3 sm:w-auto sm:text-sm"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : isFullPayment ? (
                            "Record Full Payment"
                          ) : (
                            "Record Payment"
                          )}
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center cursor-pointer rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={() => setIsAddingPayment(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}