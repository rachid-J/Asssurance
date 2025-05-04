import { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ReselRefundModal from './ReselRefundModal'


export default function InsuranceTypeModal({ isOpen, onClose, onConfirm, insuranceId, currentType, payments }) {
  const [loading, setLoading] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  
  // Calcul du montant total payé
  const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  const handleInitialConfirm = () => {
    if (totalPaid > 0) {
      setShowRefundModal(true);
    } else {
      handleConfirmTypeChange();
    }
  };

  const handleConfirmTypeChange = async (refundData) => {
    try {
      setLoading(true);
      // S'assurer d'envoyer un objet vide plutôt que null
      const processedData = refundData ? {
        ...refundData,
        refundAmount: parseFloat(refundData.refundAmount)
      } : {};
      
      await onConfirm(insuranceId, processedData);
      onClose();
    } catch (error) {
      console.error("Erreur lors du changement de type d'assurance :", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
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
                  Changer le type d'assurance en Résiliation
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Êtes-vous sûr de vouloir changer le type de cette assurance en « résiliation » ?
                    Cette action est irréversible.
                  </p>
                  
                  {totalPaid > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded">
                      <p className="text-sm text-yellow-700">
                        <strong>Note :</strong> Cette assurance a des paiements totalisant{' '}
                        <strong>{totalPaid.toFixed(2)} MAD</strong>. 
                        La poursuite nécessitera un remboursement au client.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                onClick={handleInitialConfirm}
                disabled={loading}
              >
                {loading ? 'Traitement en cours...' : totalPaid > 0 ? 'Continuer vers le remboursement' : 'Confirmer le changement'}
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
      
      {/* Modal de remboursement */}
      {showRefundModal && (
        <ReselRefundModal
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          onConfirm={handleConfirmTypeChange}
          insuranceId={insuranceId}
          currentType={currentType}
          payments={payments}
          totalPaid={totalPaid}
        />
      )}
    </>
  );
}