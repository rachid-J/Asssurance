import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { getClients, deleteClient } from '../../service/clientService';
import { NewPolicyModal } from '../AssuranceCase/NewPolicyModal';
import { ReplacePolicyModal } from '../AssuranceCase/ReplacePolicyModal';
import { ClientModalCreate } from './ClientModalCreate';
import { ClientModalEdit } from './ClientModalEdit';
import { ClientModalView } from './ClientModalView';
import { DeleteConfirmModal } from '../Common/DeleteConfirmModal';
import Pagination from '../Common/Pagination';

export default function ClientList() {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNewPolicyModal, setShowNewPolicyModal] = useState(false);
  const [showReplacePolicyModal, setShowReplacePolicyModal] = useState(false);
  
  // Selected client and pagination
  const [selectedClient, setSelectedClient] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalClients, setTotalClients] = useState(0);

  // Fetch clients with debounce for search
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        // In a real implementation, we would pass pagination params too
        const data = await getClients({ 
          search: searchTerm,
          page,
          limit
        });
        
        // For now, this is a placeholder as the API doesn't return total count
        // In a real app, API would return { clients: [...], total: 123 }
        setClients(data);
        setTotalClients(data.length > 0 ? data.length + (page - 1) * limit : 0);
        setError('');
      } catch (err) {
        setError('Failed to fetch clients');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchClients();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, page, limit]);

  // Handle client operations
  const handleClientCreated = (newClient) => {
    setClients(prevClients => [newClient, ...prevClients]);
  };

  const handleClientUpdated = (updatedClient) => {
    setClients(prevClients => 
      prevClients.map(client => 
        client._id === updatedClient._id ? updatedClient : client
      )
    );
  };

  const handleClientDeleted = async () => {
    try {
      await deleteClient(selectedClient._id);
      setClients(prevClients => 
        prevClients.filter(client => client._id !== selectedClient._id)
      );
      setShowDeleteModal(false);
    } catch (err) {
      setError('Failed to delete client');
      console.error(err);
    }
  };

  // Handle policy operations
  const handlePolicyCreated = () => {
    // Optionally refresh the client list
    refreshClients();
  };

  const handleNewPolicy = (client) => {
    setSelectedClient(client);
    setShowNewPolicyModal(true);
  };

  const handleReplacePolicy = (client) => {
    setSelectedClient(client);
    setShowReplacePolicyModal(true);
  };

  // Handle modal operations
  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleDeleteClient = (client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  // Refresh clients (used after operations)
  const refreshClients = async () => {
    try {
      setLoading(true);
      const data = await getClients({ search: searchTerm, page, limit });
      setClients(data);
    } catch (err) {
      setError('Failed to refresh clients');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Add button */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all registered clients, their contact information, and card details.
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
      
      {/* Search with filters */}
      <div className="mt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#1E265F] sm:text-sm sm:leading-6"
              placeholder="Search clients by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page when searching
              }}
            />
          </div>
          <div className="flex-shrink-0">
            <select
              className="h-full rounded-md border-0 bg-white py-3 pl-3 pr-7 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#1E265F] sm:text-sm"
              onChange={(e) => setLimit(Number(e.target.value))}
              value={limit}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-4 flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E265F]"></div>
        </div>
      )}

      {/* Clients Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
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
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created Date
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {clients.length === 0 && !loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-gray-500">
                        No clients found. Try adjusting your search.
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => (
                      <tr key={client._id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {client.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {client.telephone}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {client.numCarte}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleViewClient(client)}
                            className="text-[#1E265F] hover:text-[#272F65] mr-2"
                            title="View client details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditClient(client)}
                            className="text-[#1E265F] hover:text-[#272F65] mr-2"
                            title="Edit client"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client)}
                            className="text-red-600 hover:text-red-700 mr-4"
                            title="Delete client"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <Pagination 
        currentPage={page}
        totalItems={totalClients}
        pageSize={limit}
        onPageChange={setPage}
      />

      {/* Modals */}
      <ClientModalCreate
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onClientCreated={handleClientCreated}
      />
      
      <ClientModalEdit
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onClientUpdated={handleClientUpdated}
        client={selectedClient}
      />

      <ClientModalView
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        client={selectedClient}
      />
      
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleClientDeleted}
        title="Delete Client"
        message={`Are you sure you want to delete ${selectedClient?.name}? This action cannot be undone.`}
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