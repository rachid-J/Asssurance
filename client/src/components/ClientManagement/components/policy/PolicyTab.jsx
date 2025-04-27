// components/PolicyTab.js
import { DocumentTextIcon, ArrowDownTrayIcon, PencilIcon } from '@heroicons/react/24/outline';
import { VehiclesList } from '../vehicules/VehiclesList';
import { EmptyPolicyState } from './EmptyPolicyState';
import { PolicyCard } from './PolicyCard';


export const PolicyTab = ({ policies, clientId, vehicles, navigate, formatDate }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Policy Details</h2>
        <button
          onClick={() => navigate(`/clients/${clientId}/policies/new`)}
          className=" bg-[#1E265F] hover:bg-[#272F65]  text-white px-4 py-2 rounded-md  transition-colors"
        >
          New Policy
        </button>
      </div>

      {vehicles?.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Create Policy for Existing Vehicle</h3>
          <VehiclesList vehicles={vehicles} clientId={clientId} />
        </div>
      )}

      {policies.length === 0 ? (
        <EmptyPolicyState clientId={clientId} />
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => (
            <PolicyCard 
              key={policy._id}
              policy={policy}
              clientId={clientId}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};