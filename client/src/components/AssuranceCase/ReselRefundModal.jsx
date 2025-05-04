// components/insurance/ReselRefundModal.jsx
import { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ReselRefundModal({ isOpen, onClose, onConfirm, totalPaid }) {
  const [loading, setLoading] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('cash');
  
  const suggestedRefund = totalPaid ? (totalPaid * 0.8).toFixed(2) : 0;

  const handleConfirm = async () => {
    try {
      const amount = parseFloat(refundAmount);
      
      if (isNaN(amount) || amount <= 0) {
        alert("Veuillez entrer un montant valide");
        return;
      }
  
      setLoading(true);
      await onConfirm({
        refundAmount: amount,
        refundReason,
        refundMethod
      });
      onClose();
    } catch (error) {
      console.error("Erreur de traitement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedRefund = () => {
    setRefundAmount(suggestedRefund);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1e265f4f]">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block overflow-hidden text-left align-bottom bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Fermer</span>
              <XMarkIcon className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-yellow-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Conversion en résiliation et remboursement
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  La conversion de cette assurance en "résiliation" nécessite un remboursement au client.
                  Veuillez spécifier les détails ci-dessous.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="bg-yellow-50 p-4 rounded-md mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Informations de remboursement</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Total payé par le client : <strong>{totalPaid?.toFixed(2)} MAD</strong></p>
                    <p>Montant suggéré (80%) : <strong>{suggestedRefund} MAD</strong></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700">
                  Montant du remboursement (MAD)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="refundAmount"
                    id="refundAmount"
                    className="focus:ring-[#1E265F] focus:border-[#1E265F] block w-full pr-20 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0,00"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    max={totalPaid}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-[#1E265F] bg-gray-100 hover:bg-gray-200 focus:outline-none"
                      onClick={handleSuggestedRefund}
                    >
                      <ArrowPathIcon className="h-3 w-3 mr-1" />
                      Suggérer
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="refundMethod" className="block text-sm font-medium text-gray-700">
                  Méthode de remboursement
                </label>
                <select
                  id="refundMethod"
                  name="refundMethod"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm rounded-md"
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                >
                  <option value="cash">Espèces</option>
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="check">Chèque</option>
                  <option value="credit_card">Carte de crédit</option>
                </select>
              </div>

              <div>
                <label htmlFor="refundReason" className="block text-sm font-medium text-gray-700">
                  Motif du remboursement / Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="refundReason"
                    name="refundReason"
                    rows={3}
                    className="shadow-sm focus:ring-[#1E265F] focus:border-[#1E265F] block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Saisissez le motif du remboursement ou des notes supplémentaires"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={handleConfirm}
              disabled={loading || !refundAmount}
            >
              {loading ? 'Traitement...' : 'Traiter le remboursement et convertir'}
            </button>
            <button
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}