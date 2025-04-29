// components/InsuranceTab.js

import VehiclesList from '../vehicules/VehiclesList';
import { EmptyInsuranceState } from './EmptyInsuranceState';
import { InsuranceCard } from './InsuranceCard';

export const InsuranceTab = ({ insurances, clientId, vehicles, navigate, formatDate }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Insurance Policies</h2>
        <button
          onClick={() => navigate(`/clients/${clientId}/insurances/new`)}
          className="bg-[#1E265F] hover:bg-[#272F65] text-white px-4 py-2 rounded-md transition-colors"
        >
          New Insurance
        </button>
      </div>

      {vehicles?.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Create Insurance for Existing Vehicle</h3>
          <VehiclesList vehicles={vehicles} clientId={clientId} />
        </div>
      )}

      {insurances.length === 0 ? (
        <EmptyInsuranceState clientId={clientId} />
      ) : (
        <div className="space-y-4">
          {insurances.map((insurance) => (
            <InsuranceCard 
              key={insurance._id}
              insurance={insurance}
              clientId={clientId}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};