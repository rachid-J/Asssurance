// components/NewPolicyForm.js
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { createPolicy } from '../../service/policyservice';
import { getVehiclesByClient } from '../../service/vehicleService';

export const NewPolicyForm = () => {
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [formData, setFormData] = useState({
    policyNumber: '',
    startDate: '',
    endDate: '',
    insuranceType: '',
    usage: '', // Remove this if getting from vehicle
    primeHT: 0,
    primeTTC: 0,
    primeActuel: 0,
    comment: '',
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getVehiclesByClient(clientId);
        setVehicles(data);
        console.log("data",data)
        const vehicleId = searchParams.get('vehicleId');
        if (vehicleId && data.some(v => v._id === vehicleId)) {
          setSelectedVehicle(vehicleId);
        } else if (data.length === 1) {
          setSelectedVehicle(data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };
    fetchVehicles();
  }, [clientId, searchParams]);
  useEffect(() => {
    if (formData.insuranceType === 'Affaire Nouvelle' && selectedVehicle) {
      const vehicle = vehicles.find(v => v._id === selectedVehicle);
      const existingPolicyNumber = vehicle?.policyId?.policyNumber;
      
      setFormData(prev => ({
        ...prev,
        policyNumber: existingPolicyNumber || ''
      }));
    } else if (formData.insuranceType === 'Remplacement') {
      setFormData(prev => ({ ...prev, policyNumber: '' }));
    }
  }, [formData.insuranceType, selectedVehicle, vehicles]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) {
      alert('Please select a vehicle first');
      return;
    }
    try {
      await createPolicy({
        ...formData,
        client: clientId,
        vehicle: selectedVehicle
      });
      navigate(`/clients/${clientId}`);
    } catch (error) {
      console.error('Error creating policy:', error);
      alert(`Error creating policy: ${error.message}`);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">New Policy</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <div className="text-center py-6">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
            <p className="mt-1 text-sm text-gray-500 mb-4">
              You need to create a vehicle first before creating a policy.
            </p>
            <button
              onClick={() => navigate(`/clients/${clientId}/vehicles/new`)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
            >
              Create New Vehicle
            </button>
          </div>
        </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Create New Policy</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Policy Details</h2>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                required
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
              <input
    type="text"
    value={formData.policyNumber}
    onChange={(e) => setFormData({...formData, policyNumber: e.target.value})}
    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
    required
    readOnly={formData.insuranceType === 'Affaire Nouvelle' && selectedVehicle?.policyId}
  />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <div className="relative mt-1">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                    required
                  />
                  <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <div className="relative mt-1">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                    required
                  />
                  <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Type</label>
              <select
    value={formData.insuranceType}
    onChange={(e) => setFormData({...formData, insuranceType: e.target.value})}
    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
    required
  >
    <option value="">Select insurance type</option>
    <option value="Affaire Nouvelle">Affaire Nouvelle</option>
    <option value="Remplacement">Remplacement</option>
  </select>
            </div>
            <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Comments/Notes</label>
  <textarea
    value={formData.comment}
    onChange={(e) => setFormData({...formData, comment: e.target.value})}
    rows="3"
    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
    placeholder="Add any additional notes or comments..."
  />
</div>

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 w-full border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
              >
                Create Policy
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Pricing Details</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prime HT</label>
              <div className="relative mt-1">
                <input
                  type="number"
                  value={formData.primeHT}
                  onChange={(e) => setFormData({...formData, primeHT: e.target.value})}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prime TTC</label>
              <div className="relative mt-1">
                <input
                  type="number"
                  value={formData.primeTTC}
                  onChange={(e) => setFormData({...formData, primeTTC: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, primeActuel: e.target.value})}
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