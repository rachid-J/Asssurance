// components/NewInsuranceForm.js
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { createInsurance, getLatestExpiredInsurance } from '../../service/insuranceservice';
import { getVehiclesByClient } from '../../service/vehicleService';
import InsuranceReceipt from './InsuranceReceipt';
import { getClient } from '../../service/clientService';

export const NewInsuranceForm = () => {
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [clientData, setClientData] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedVehicleData, setSelectedVehicleData] = useState(null);
  const [formData, setFormData] = useState({
    policyNumber: '',
    startDate: '',
    endDate: '',
    insuranceType: '',
    usage: '',
    primeTTC: 0,
    primeActuel: 0,
    comment: '',
  });
  const [isGeneratingPolicy, setIsGeneratingPolicy] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const fetchClientAndVehicles = async () => {
      try {
        const client = await getClient(clientId);
        setClientData(client);
      
        const data = await getVehiclesByClient(clientId);
        setVehicles(data.vehicles);
        
        const vehicleId = searchParams.get('vehicleId');

        if (vehicleId && data.vehicles.some(v => v._id === vehicleId)) {
          setSelectedVehicle(vehicleId);
          setSelectedVehicleData(data.vehicles.find(v => v._id === vehicleId));
        } else if (data.vehicles.length === 1) {
          setSelectedVehicle(data.vehicles[0]._id);
          setSelectedVehicleData(data.vehicles[0]);
        }
      } catch (error) {
        console.error('Erreur de récupération des données :', error);
      }
    };
    fetchClientAndVehicles();
  }, [clientId, searchParams]);

  useEffect(() => {
    const handleInsuranceTypeChange = async () => {
      setFormData(prev => ({ ...prev, policyNumber: '' }));
      setIsGeneratingPolicy(true);
      
      try {
        if (formData.insuranceType === 'Renouvellement' && selectedVehicle) {
          const expiredInsurance = await getLatestExpiredInsurance(selectedVehicle);
          setFormData(prev => ({
            ...prev,
            policyNumber: expiredInsurance?.policyNumber || ''
          }));
        } else if (formData.insuranceType === 'Affaire Nouvelle' && selectedVehicle) {
          const newPolicyNumber = generatePolicyNumber('NEW');
          setFormData(prev => ({
            ...prev,
            policyNumber: newPolicyNumber
          }));
        } else if (formData.insuranceType === 'Remplacement' && selectedVehicle) {
          const newPolicyNumber = generatePolicyNumber('REPL');
          setFormData(prev => ({
            ...prev,
            policyNumber: newPolicyNumber
          }));
        }
      } catch (error) {
        console.error('Erreur de génération de police :', error);
      } finally {
        setIsGeneratingPolicy(false);
      }
    };
    
    handleInsuranceTypeChange();
  }, [formData.insuranceType, selectedVehicle]);
  
  const generatePolicyNumber = (prefix) => {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `${prefix}-${year}${month}${day}-${random}`;
  };

  useEffect(() => {
    if (selectedVehicle) {
      const vehicle = vehicles.find(v => v._id === selectedVehicle);
      setSelectedVehicleData(vehicle);
    } else {
      setSelectedVehicleData(null);
    }
  }, [selectedVehicle, vehicles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) {
      alert('Veuillez d\'abord sélectionner un véhicule');
      return;
    }
    try {
      const createdInsurance = await createInsurance({
        ...formData,
        client: clientId,
        vehicle: selectedVehicle
      });
      
      setShowReceipt(true);
    } catch (error) {
      console.error('Erreur de création :', error);
      
      if (error.message.includes('NO_EXPIRED_POLICY')) {
        const confirm = window.confirm(
          'Aucune police expirée trouvée. Créer comme nouvelle affaire ?'
        );
        if (confirm) {
          setFormData(prev => ({
            ...prev,
            insuranceType: 'Affaire Nouvelle',
            policyNumber: generatePolicyNumber('NEW')
          }));
        }
        return;
      }

      if (error.message.includes('ACTIVE_RENEWAL_EXISTS')) {
        alert('Un renouvellement actif existe déjà pour cette police.');
        return;
      }

      alert(`Erreur de création : ${error.message}`);
    }
  };

  const handlePolicyNumberChange = (e) => {
    if (formData.insuranceType !== 'Renouvellement') {
      setFormData({ ...formData, policyNumber: e.target.value });
    }
  };

  const insuranceReceiptData = {
    ...formData,
    client: clientData || { fullName: '' },
    vehicle: selectedVehicleData || { make: '', model: '', registrationNumber: '' }
  };

  if (vehicles.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle assurance</h1>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <div className="text-center py-6">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun véhicule trouvé</h3>
            <p className="mt-1 text-sm text-gray-500 mb-4">
              Vous devez d'abord créer un véhicule avant de créer une assurance.
            </p>
            <button
              onClick={() => navigate(`/clients/${clientId}/vehicles/new`)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
            >
              Créer un véhicule
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showReceipt) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => setShowReceipt(false)}
              className="mr-4 p-2 rounded-md hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Reçu d'assurance</h1>
          </div>
          <button
            onClick={() => navigate(`/clients/${clientId}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Retour au client
          </button>
        </div>
        
        <InsuranceReceipt insuranceData={insuranceReceiptData} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Créer une nouvelle assurance</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Détails de l'assurance</h2>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                required
              >
                <option value="">Sélectionnez un véhicule</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'assurance</label>
              <select
                value={formData.insuranceType}
                onChange={(e) => setFormData({ ...formData, insuranceType: e.target.value })}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                required
              >
                <option value="">Sélectionnez un type</option>
                <option value="Renouvellement">Renouvellement</option>
                <option value="Affaire Nouvelle">Affaire Nouvelle</option>
                <option value="Remplacement">Remplacement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de police</label>
              <input
                type="text"
                value={formData.policyNumber}
                onChange={handlePolicyNumberChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                readOnly={formData.insuranceType === 'Renouvellement' || isGeneratingPolicy}
                placeholder={isGeneratingPolicy ? "Génération du numéro de police..." : ""}
                required
              />
              {formData.insuranceType === 'Renouvellement' && (
                <p className="mt-1 text-sm text-gray-500">Numéro récupéré de l'assurance précédente</p>
              )}
              {formData.insuranceType === 'Affaire Nouvelle' && (
                <p className="mt-1 text-sm text-gray-500">Numéro généré automatiquement</p>
              )}
              {formData.insuranceType === 'Remplacement' && (
                <p className="mt-1 text-sm text-gray-500">Numéro généré pour remplacement</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <div className="relative mt-1">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                    required
                  />
                  <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <div className="relative mt-1">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                    required
                  />
                  <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commentaires</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows="3"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                placeholder="Ajoutez des notes ou commentaires..."
              />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 w-full border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
              >
                Créer l'assurance
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Détails financiers</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prime TTC</label>
              <div className="relative mt-1">
                <input
                  type="number"
                  value={formData.primeTTC}
                  onChange={(e) => setFormData({ ...formData, primeTTC: e.target.value })}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prime Actuel</label>
              <div className="relative mt-1">
                <input
                  type="number"
                  value={formData.primeActuel}
                  onChange={(e) => setFormData({ ...formData, primeActuel: e.target.value })}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};