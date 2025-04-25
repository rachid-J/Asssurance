import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';



import { getClients } from '../../service/clientService';
import { NewPolicyModal } from '../AssuranceCase/NewPolicyModal';
import { ReplacePolicyModal } from '../AssuranceCase/ReplacePolicyModal';
import { ClientModalCreate } from './ClientModalCreate';

export default function ClientList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // New state for policy modals
  const [showNewPolicyModal, setShowNewPolicyModal] = useState(false);
  const [showReplacePolicyModal, setShowReplacePolicyModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Fetch clients with debounce
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await getClients({ search: searchTerm });
        setClients(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchClients();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleClientCreated = (newClient) => {
    setClients(prevClients => [newClient, ...prevClients]);
  };

  const handlePolicyCreated = (newPolicy) => {
    // You could update the UI or show a notification
    console.log('New policy created:', newPolicy);
    // Optionally refresh the client list
    // refreshClients();
  };

  const handleNewPolicy = (client) => {
    setSelectedClient(client);
    setShowNewPolicyModal(true);
  };

  const handleReplacePolicy = (client) => {
    setSelectedClient(client);
    setShowReplacePolicyModal(true);
  };

  return (
    <div>
      {/* Header and Add button */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all registered clients
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="block rounded-md bg-[#1E265F] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#272F65] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E265F]"
          >
            <PlusIcon className="h-5 w-5 inline-block mr-1" />
            Add client
          </button>
        </div>
      </div>
      
      {/* Search */}
      <div className="mt-6 relative">
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            name="search"
            className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#1E265F] sm:text-sm sm:leading-6"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 text-red-500">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-4 text-gray-500">
          Loading...
        </div>
      )}

      {/* Clients Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Client Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Telephone
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Card Number
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {clients.map((client) => (
                    <tr key={client._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {client.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {client.telephone}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {client.numCarte}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <a href="#" className="text-[#1E265F] hover:text-[#272F65] mr-4">
                          View Policies<span className="sr-only">, {client.name}</span>
                        </a>
                        <button 
                          onClick={() => handleNewPolicy(client)}
                          className="text-[#1E265F] hover:text-[#272F65] mr-2 px-2 py-1 border border-[#1E265F] rounded-md"
                          title="Affaire Nouvelle - Create new policy"
                        >
                          A.F
                        </button>
                        <button 
                          onClick={() => handleReplacePolicy(client)}
                          className="text-[#1E265F] hover:text-[#272F65] px-2 py-1 border border-[#1E265F] rounded-md"
                          title="Remplacement de Police - Replace policy"
                        >
                          R.P
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ClientModalCreate
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onClientCreated={handleClientCreated}
      />
      
      <NewPolicyModal
        isOpen={showNewPolicyModal}
        onClose={() => setShowNewPolicyModal(false)}
        client={selectedClient}
        onPolicyCreated={handlePolicyCreated}
      />
      
      <ReplacePolicyModal
        isOpen={showReplacePolicyModal}
        onClose={() => setShowReplacePolicyModal(false)}
        client={selectedClient}
        onPolicyCreated={handlePolicyCreated}
      />
    </div>
  );
}