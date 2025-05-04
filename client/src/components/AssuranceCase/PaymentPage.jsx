import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { createPayment } from '../../service/insuranceservice';
import { getInsuranceById, getInsurancePayments } from '../../service/insuranceservice';

export default function PaymentPage() {
  const { insuranceId } = useParams();
  const navigate = useNavigate();
  
  const [insurance, setInsurance] = useState(null);
  const [localPayments, setLocalPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedAdvance, setSelectedAdvance] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const getTotalInsuranceAmount = () => {
    return insurance?.primeActuel || insurance?.primeTTC || 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const insuranceData = await getInsuranceById(insuranceId);
        setInsurance(insuranceData);
        
        const paymentsData = await getInsurancePayments(insuranceId);
        
        if (paymentsData && paymentsData.length > 0) {
          setLocalPayments(paymentsData);
          
          const firstUnpaidAdvance = paymentsData.find(p => !p.paymentDate);
          if (firstUnpaidAdvance) {
            handleAdvanceSelection(firstUnpaidAdvance.advanceNumber);
          } else {
            handleAdvanceSelection(paymentsData[0].advanceNumber);
          }
        } else {
          const totalAmount = insuranceData?.primeActuel || insuranceData?.primeTTC || 0;
          const defaultAdvances = [1, 2, 3, 4].map(num => ({
            advanceNumber: num,
            paymentDate: null,
            amount: totalAmount / 4,
            paymentMethod: null,
            reference: '',
            notes: ''
          }));
          setLocalPayments(defaultAdvances);
          setPaymentAmount((totalAmount / 4).toFixed(2));
          handleAdvanceSelection(1);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur de chargement des données:", err);
        setError("Échec du chargement des données. Veuillez réessayer.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [insuranceId]);

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

  const isAdvancePaid = (advanceNumber) => {
    const advance = localPayments.find(p => p.advanceNumber === advanceNumber);
    return advance && advance.paymentDate;
  };

  const handleSubmitPayment = async () => {
    try {
      if (isAdvancePaid(selectedAdvance)) {
        setError(`L'acompte ${selectedAdvance} est déjà payé.`);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const paymentData = {
        advanceNumber: selectedAdvance,
        paymentDate,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        reference,
        notes
      };

      const existingPayment = localPayments.find(p => 
        p.advanceNumber === selectedAdvance && p._id
      );

      if (existingPayment) {
        console.log("Mise à jour du paiement existant:", existingPayment._id);
      } else {
        await createPayment(insurance._id, paymentData);
      }

      const updatedPayments = localPayments.map(p => 
        p.advanceNumber === selectedAdvance ? 
        { ...p, ...paymentData } : p
      );
      setLocalPayments(updatedPayments);
      
      setSuccess(`Paiement de l'acompte ${selectedAdvance} enregistré !`);
      
      const nextUnpaid = updatedPayments.find(p => !p.paymentDate && p.advanceNumber !== selectedAdvance);
      if (nextUnpaid) {
        handleAdvanceSelection(nextUnpaid.advanceNumber);
      }
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error("Erreur de traitement:", err);
      setError("Échec de l'enregistrement. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = () => {
    const paidAdvances = localPayments.filter(payment => payment.paymentDate).length;
    const totalAmount = getTotalInsuranceAmount();
    const paidAmount = localPayments
      .filter(payment => payment.paymentDate)
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    let requiredAdvances = 4;
    
    if (paidAmount >= totalAmount) {
      const advancesWithPayments = localPayments.filter(payment => payment.paymentDate);
      requiredAdvances = advancesWithPayments.length;
    } else {
      const remainingAmount = totalAmount - paidAmount;
      const advanceAmount = totalAmount / 4;
      const remainingAdvances = Math.ceil(remainingAmount / advanceAmount);
      requiredAdvances = paidAdvances + remainingAdvances;
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
  
  const getVisibleAdvances = () => {
    if (paymentStatus.paidAmount >= paymentStatus.totalAmount) {
      return localPayments
        .filter(payment => payment.paymentDate)
        .map(payment => payment.advanceNumber);
    }

    const visibleAdvanceCount = paymentStatus.requiredAdvances;
    return Array.from({ length: visibleAdvanceCount }, (_, i) => i + 1);
  };

  const visibleAdvances = getVisibleAdvances();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E265F]"></div>
      </div>
    );
  }

  if (error && !insurance) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(`/assurance-cases/${insuranceId}`)}
            className="mr-4 p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Erreur de chargement</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/assurance-cases/${insuranceId}`)}
            className="mr-4 p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des paiements</h1>
            <p className="text-sm text-gray-600">
              Assurance n°{insurance?.policyNumber} • {insurance?.clientName}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-6">
            Détails de l'assurance
          </h3>
          
          {insurance && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Client</h4>
                <p className="text-base font-medium text-gray-900">{insurance.clientName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Numéro d'assurance</h4>
                <p className="text-base font-medium text-gray-900">{insurance.policyNumber}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Montant total</h4>
                <p className="text-base font-medium text-gray-900">{getTotalInsuranceAmount().toFixed(2)} MAD</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Date de début</h4>
                <p className="text-base font-medium text-gray-900">
                  {new Date(insurance.startDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-8">
            <h4 className="text-md font-semibold text-gray-700 mb-4">État des paiements</h4>
            <div className="space-y-3">
              <div className="text-sm text-gray-700 font-medium">
                {paymentStatus.paidAdvances} sur {paymentStatus.requiredAdvances} acomptes payés
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
                  {paymentStatus.paidAmount.toFixed(2)} MAD payés
                </span>
                <span className="text-gray-500">
                  sur {paymentStatus.totalAmount.toFixed(2)} MAD
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="text-md font-semibold text-gray-700 mb-4">Historique des paiements</h4>
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
                      <span className="font-medium">Acompte {payment.advanceNumber}</span>
                      <span className={payment.paymentDate ? 'text-green-700' : 'text-gray-500'}>
                        {payment.paymentDate 
                          ? new Date(payment.paymentDate).toLocaleDateString('fr-FR') 
                          : 'En attente'}
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
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-6">
            Enregistrement de paiement
          </h3>
          
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sélection de l'acompte</h4>
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
                    Acompte {advanceNum}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de paiement
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
                  Montant (MAD)
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
                  Méthode de paiement
                </label>
                <select
                  id="payment-method"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isAdvancePaid(selectedAdvance)}
                >
                  <option value="cash">Espèces</option>
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="check">Chèque</option>
                  <option value="card">Carte</option>
                </select>
              </div>

              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                  Référence
                </label>
                <input
                  type="text"
                  id="reference"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Référence du paiement"
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
          
          {paymentStatus.isFullyPaid && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Assurance entièrement payée en {paymentStatus.paidAdvances} 
                    {paymentStatus.paidAdvances === 1 ? ' acompte' : ' acomptes'}.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={() => navigate(`/assurance-cases/${insuranceId}`)}
            >
              Annuler
            </button>
            <button
              type="button"
              className="inline-flex justify-center rounded-md bg-[#1E265F] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#272F65] disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={handleSubmitPayment}
              disabled={loading || paymentStatus.isFullyPaid || isAdvancePaid(selectedAdvance)}
            >
              {loading ? 'Traitement...' : isAdvancePaid(selectedAdvance) ? 'Payé' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}