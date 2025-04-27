// components/VehiclesList.js
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TruckIcon, PencilIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export const VehiclesList = ({ vehicles }) => {
  const navigate = useNavigate();
  const { clientId } = useParams();

  const handleEditVehicle = (vehicleId) => {
    navigate(`/clients/${clientId}/vehicles/${vehicleId}`);
  };

  const handleViewDocuments = (vehicleId) => {
    navigate(`/clients/${clientId}/vehicles/${vehicleId}/documents`);
  };

  const handleCreatePolicy = (vehicleId) => {
    navigate(`policies/new?vehicleId=${vehicleId}`);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TruckIcon className="h-6 w-6 text-[#1E265F]" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {vehicle.make} {vehicle.model}
                  </h3>
                </div>
                <button
                  onClick={() => handleEditVehicle(vehicle._id)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                  aria-label="Edit vehicle"
                >
                  <PencilIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Registration:</span> {vehicle.registrationNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Year:</span> {vehicle.yearOfManufacture}
                </p>
                {vehicle.usage && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Usage:</span> {vehicle.usage}
                  </p>
                )}
              </div>

              {/* Documents Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewDocuments(vehicle._id)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Manage Documents
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleCreatePolicy(vehicle._id)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
                >
                  Create Policy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehiclesList;