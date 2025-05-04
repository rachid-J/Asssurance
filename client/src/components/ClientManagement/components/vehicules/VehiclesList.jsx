// components/VehiclesList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TruckIcon, PencilIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export const VehiclesList = ({ vehicles }) => {
  const navigate = useNavigate();
  
  const handleEditVehicle = (vehicleId) => {
    navigate(`vehicles/${vehicleId}`);
  };
  
  const handleViewDocuments = (vehicleId) => {
    navigate(`vehicles/${vehicleId}/documents`);
  };
  
  const handleCreateInsurance = (vehicleId) => {
    navigate(`insurances/new?vehicleId=${vehicleId}`);
  };
  
  return (
    <div className="p-4 sm:p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr key={vehicle._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <TruckIcon className="h-5 w-5 text-[#1E265F] mr-3" />
                    <div className="font-medium text-gray-900">
                      {vehicle.make} {vehicle.model}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.registrationNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.yearOfManufacture}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.usage || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 flex justify-center">
                  <button
                    onClick={() => handleEditVehicle(vehicle._id)}
                    className="p-2 hover:bg-gray-100 rounded-md"
                    aria-label="Edit vehicle"
                  >
                    <PencilIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleViewDocuments(vehicle._id)}
                    className="p-2 hover:bg-gray-100 rounded-md flex items-center justify-center"
                    aria-label="View documents"
                  >
                    <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleCreateInsurance(vehicle._id)}
                    className="px-3 py-1 text-xs font-medium bg-[#1E265F] text-white rounded-md hover:bg-[#272F65]"
                  >
                    Insurance
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {vehicles.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500">No vehicles found.</p>
        </div>
      )}
    </div>
  );
};

export default VehiclesList;