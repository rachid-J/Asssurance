import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export const ClientModalView = ({ isOpen, onClose, client }) => {
  const [clientPolicies, setClientPolicies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && client) {
      fetchClientPolicies();
    }
  }, [isOpen, client]);

  const fetchClientPolicies = async () => {
    // This is a placeholder - in a real app, you would fetch the client's policies
    setLoading(true);
    try {
      // Simulating an API call
      // const response = await getPoliciesByClientId(client._id);
      // setClientPolicies(response.data);
      
      // For now, just simulating with empty array
      setClientPolicies([]);
    } catch (error) {
      console.error('Error fetching client policies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-3xl p-6 mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Client Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Client Name</p>
              <p className="text-lg font-medium text-gray-900">{client.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Telephone</p>
              <p className="text-lg font-medium text-gray-900">{client.telephone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Card Number</p>
              <p className="text-lg font-medium text-gray-900">{client.numCarte}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Client Since</p>
              <p className="text-lg font-medium text-gray-900">
                {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-4">Client Policies</h3>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E265F]"></div>
          </div>
        ) : clientPolicies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    Policy Number
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Insurance Type
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Start Date
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {clientPolicies.map((policy) => (
                  <tr key={policy._id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      {policy.policyNumber}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {policy.insuranceType}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(policy.startDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {policy.primeTTC} DH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No policies found for this client.
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};