import React from 'react';
import { TruckIcon, DocumentDuplicateIcon, PencilIcon } from '@heroicons/react/24/outline';
import { EmptyVehiclesState } from './EmptyVehiclesState';
import { VehiclesList } from './VehiclesList';

export const VehiclesTab = ({ vehicles, handleAddVehicle, handleViewVehicle }) => {
  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Vehicles</h3>
        <button
          onClick={handleAddVehicle}
          className="inline-flex items-center px-3 py-2 border border-[#1E265F] shadow-sm text-sm font-medium rounded-md text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
        >
          <TruckIcon className="h-4 w-4 mr-2" />
          Add Vehicle
        </button>
      </div>
      {vehicles.length === 0 ? (
        <EmptyVehiclesState />
      ) : (
        <VehiclesList vehicles={vehicles} handleViewVehicle={handleViewVehicle} />
      )}
    </div>
  );
};
