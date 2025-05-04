// components/insurance/CancelModal.jsx
import { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function CancelModal({ isOpen, onClose, onConfirm, insuranceId, totalPaid = 0 }) {
  const [loading, setLoading] = useState(false);
  const [refundAmount, setRefundAmount] = useState(totalPaid > 0 ? (totalPaid * 0.7).toFixed(2) : 0);
  const [refundMethod, setRefundMethod] = useState('cash');
  const [cancelReason, setCancelReason] = useState('');
  const [penaltyPercentage, setPenaltyPercentage] = useState(30);

  const calculateRefund = (percentage) => {
    const penalty = (totalPaid * percentage) / 100;
    return (totalPaid - penalty).toFixed(2);
  };

  const handlePenaltyChange = (percentage) => {
    setPenaltyPercentage(percentage);
    setRefundAmount(calculateRefund(percentage));
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm(insuranceId, {
        refundAmount: parseFloat(refundAmount),
        refundMethod,
        cancelReason,
        penaltyPercentage
      });
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
    } finally {
      setLoading(false);
    }
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
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Annuler la police d'assurance
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Êtes-vous sûr de vouloir annuler cette police ? Cette action est irréversible.
                </p>
              </div>
            </div>
          </div>
          
          {totalPaid > 0 && (
            <div className="mt-4">
              <div className="bg-red-50 p-4 rounded-md mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Informations de remboursement</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Total payé par le client : <strong>{totalPaid.toFixed(2)} €</strong></p>
                      <p>Pénalité d'annulation : <strong>{penaltyPercentage}%</strong></p>
                      <p>Montant à rembourser : <strong>{refundAmount} €</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="penaltyPercentage" className="block text-sm font-medium text-gray-700">
                    Pourcentage de pénalité
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="range"
                      id="penaltyPercentage"
                      min="0"
                      max="100"
                      step="5"
                      className="block w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      value={penaltyPercentage}
                      onChange={(e) => handlePenaltyChange(parseInt(e.target.value))}
                    />
                    <span className="ml-2 w-12 text-sm text-gray-700">{penaltyPercentage}%</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700">
                    Montant du remboursement (€)
                  </label>
                  <input
                    type="number"
                    name="refundAmount"
                    id="refundAmount"
                    className="mt-1 focus:ring-red-500 focus:border-red-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    max={totalPaid}
                  />
                </div>

                <div>
                  <label htmlFor="refundMethod" className="block text-sm font-medium text-gray-700">
                    Méthode de remboursement
                  </label>
                  <select
                    id="refundMethod"
                    name="refundMethod"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
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
                  <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700">
                    Motif d'annulation
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="cancelReason"
                      name="cancelReason"
                      rows={3}
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Saisissez le motif d'annulation"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Traitement en cours...' : totalPaid > 0 ? 'Annuler et rembourser' : 'Confirmer l'/'annulation'}
            </button>
            <button
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}