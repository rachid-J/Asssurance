import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { getClient } from '../../../../service/clientService';
import { createVehicle } from '../../../../service/vehicleService';

export const VehicleAddPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clientId = queryParams.get('clientId');
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  
  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    yearOfManufacture: new Date().getFullYear(),
    registrationNumber: '',
    vinNumber: '',
    vehicleType: 'Car',
    fuelType: 'Petrol',
    usage: 'Personal',
    engineSize: '',
    horsePower: '',
    numberOfSeats: '',
    weight: ''
  });

  // Fetch client details if clientId is provided
  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) return;
      
      try {
        setLoading(true);
        const response = await getClient(clientId);
        setClient(response);
      } catch (error) {
        console.error('Error fetching client:', error);
        setError('Failed to load client information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicle(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === '' ? '' : Number(value);
    setVehicle(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!clientId) {
      setFormError('Client ID is required');
      return;
    }

    // Validation
    if (!vehicle.make || !vehicle.model || !vehicle.registrationNumber) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setFormError(null);
      
      // Prepare data for submission
      const vehicleData = {
        ...vehicle,
        clientId
      };
      
      const response = await createVehicle(vehicleData);
      
      // Redirect to vehicle details page after successful creation
      navigate(`/vehicles/${response._id}`);
    } catch (err) {
      console.error('Error creating vehicle:', err);
      setFormError(err.message || 'Failed to create vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !client) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-md flex items-start">
          <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {client && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md">
          <p className="font-medium">Adding vehicle for: {client.firstName} {client.lastName}</p>
          <p className="text-sm">Client ID: {clientId}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Vehicle Details</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md flex items-start">
                <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{formError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="make"
                value={vehicle.make}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={vehicle.model}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={vehicle.registrationNumber}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VIN Number
              </label>
              <input
                type="text"
                name="vinNumber"
                value={vehicle.vinNumber}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year of Manufacture
              </label>
              <input
                type="number"
                name="yearOfManufacture"
                value={vehicle.yearOfManufacture}
                onChange={handleNumberChange}
                min="1900"
                max={new Date().getFullYear() + 1}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={vehicle.vehicleType}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                >
                  <option value="Car">Car</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Bus">Bus</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type
                </label>
                <select
                  name="fuelType"
                  value={vehicle.fuelType}
                  onChange={handleChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="LPG">LPG</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage
              </label>
              <select
                name="usage"
                value={vehicle.usage}
                onChange={handleChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
              >
                <option value="Personal">Personal</option>
                <option value="Commercial">Commercial</option>
                <option value="Public Transport">Public Transport</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center py-2 px-4 w-full border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Saving...' : 'Save Vehicle'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Technical Details</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engine Size (cc)
              </label>
              <input
                type="number"
                name="engineSize"
                value={vehicle.engineSize}
                onChange={handleNumberChange}
                min="0"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horsepower
              </label>
              <input
                type="number"
                name="horsePower"
                value={vehicle.horsePower}
                onChange={handleNumberChange}
                min="0"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Seats
              </label>
              <input
                type="number"
                name="numberOfSeats"
                value={vehicle.numberOfSeats}
                onChange={handleNumberChange}
                min="1"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={vehicle.weight}
                onChange={handleNumberChange}
                min="0"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleAddPage;