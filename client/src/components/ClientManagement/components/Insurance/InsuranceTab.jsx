// components/InsuranceTab.js

import VehiclesList from '../vehicules/VehiclesList';
import { EmptyInsuranceState } from './EmptyInsuranceState';
import { InsuranceTable } from './InsuranceTable';

export const InsuranceTab = ({ insurances, clientId, vehicles, navigate, formatDate }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Polices d'assurance</h2>
        <button
          onClick={() => navigate(`/clients/${clientId}/insurances/new`)}
          className="bg-[#1E265F] hover:bg-[#272F65] text-white px-4 py-2 rounded-md transition-colors"
        >
          Nouvelle police
        </button>
      </div>

      {vehicles?.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Créer une police pour un véhicule existant</h3>
          <VehiclesList vehicles={vehicles} clientId={clientId} />
        </div>
      )}

      {insurances.length === 0 ? (
        <EmptyInsuranceState clientId={clientId} />
      ) : (
        <div className="space-y-4">
          <InsuranceTable 
            insurances={insurances} 
            navigate={navigate} 
            formatDate={formatDate} 
          />
        </div>
      )}
    </div>
  );
};