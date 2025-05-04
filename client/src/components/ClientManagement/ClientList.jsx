import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  UserIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  UsersIcon,
  PlusIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { getClients } from '../../service/clientService';
import { getUsers } from '../../service/Users';
import DeleteClientModal from './Common/DeleteClientModal';


export const ClientList = () => {
  const navigate = useNavigate();
  
  // State management
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    clientType: '',
    city: '',
    isDriver: '',
    joinby: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await getClients(filters);
        
        // Check response structure here
        console.log('API Response:', response);
        
        // Adjust these based on actual response structure
        setClients(response.data || response.clients || []); // Match your backend structure
        setPagination(response.pagination || response.meta || {});
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError('Failed to load clients. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, [filters]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();
        console.log(response)
        setUsers(response.data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
      page: 1 // Reset to first page on new search
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      page: 1 // Reset to first page on filter change
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const clearFilters = () => {
    setFilters({
      ...filters,
      clientType: '',
      city: '',
      isDriver: '',
      joinby: '',
      page: 1
    });
  };
  
  const handleViewClient = (clientId) => {
    navigate(`/clients/${clientId}`);
  };
  
  const handleEditClient = (clientId) => {
    navigate(`/clients/${clientId}/edit`);
  };
  
  const handleDeleteClient = (client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };
  
  const handleClientDeleted = () => {
    // Refresh the client list after successful deletion
    const refreshedFilters = { ...filters };
    setFilters(refreshedFilters);
  };
  
  const handleAddClient = () => {
    navigate('/clients/new');
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
            <p className="text-sm text-gray-600">Manage and organize your clients</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            className="inline-flex items-center px-3 py-2 border border-[#1E265F] shadow-sm text-sm font-medium rounded-md text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
            onClick={handleAddClient}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Client
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search clients..."
                value={filters.search}
                onChange={handleSearch}
                className="focus:ring-[#1E265F] focus:border-[#1E265F] block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex items-center">
              <button
                onClick={toggleFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </button>
              
              <button
                onClick={() => setFilters(prev => ({
                  ...prev,
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                }))}
                className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
              >
                <ArrowsUpDownIcon className="h-4 w-4 mr-2" />
                {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>
          
          {/* Expanded filter options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label htmlFor="joinby" className="block text-sm font-medium text-gray-700">
                  Added By
                </label>
                <select
                  id="joinby"
                  name="joinby"
                  value={filters.joinby || ''}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm rounded-md"
                >
                  <option value="">All Users</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.username} 
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="clientType" className="block text-sm font-medium text-gray-700">
                  Client Type
                </label>
                <select
                  id="clientType"
                  name="clientType"
                  value={filters.clientType}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm rounded-md"
                >
                  <option value="">All Client Types</option>
                  <option value="Particulier">Particulier</option>
                  <option value="Professionnel">Professionnel</option>
                  <option value="Entreprise">Entreprise</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="Filter by city..."
                  value={filters.city}
                  onChange={handleFilterChange}
                  className="mt-1 focus:ring-[#1E265F] focus:border-[#1E265F] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="isDriver" className="block text-sm font-medium text-gray-700">
                  Driver Status
                </label>
                <select
                  id="isDriver"
                  name="isDriver"
                  value={filters.isDriver}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm rounded-md"
                >
                  <option value="">All</option>
                  <option value="true">Drivers</option>
                  <option value="false">Non-Drivers</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] sm:text-sm rounded-md"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="name">Name</option>
                  <option value="city">City</option>
                </select>
              </div>
              
              <div className="sm:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Client Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                  <dd className="text-lg font-medium text-gray-900">{pagination.totalRecords || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <UserIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Particulier</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {clients.filter(c => c.clientType === 'Particulier').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Professionnel</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {clients.filter(c => c.clientType === 'Professionnel').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <BuildingOfficeIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Entreprise</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {clients.filter(c => c.clientType === 'Entreprise').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {/* Loading and error states */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E265F]"></div>
          </div>
        )}
        
        {error && (
          <div className="p-4 sm:p-6">
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
              <p>{error}</p>
              <button
                onClick={() => setFilters({...filters})} // Trigger refetch
                className="mt-2 text-red-600 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Client table */}
        {!loading && !error && (
          <>
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by adding a new client or adjust your filters.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleAddClient}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Client
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-[#1E265F]">
                                {client.title} {client.firstName} {client.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {client.idNumber || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <PhoneIcon className="h-4 w-4 text-gray-500 mr-1" />
                            {client.telephone || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.email || 'No email'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPinIcon className="h-4 w-4 text-gray-500 mr-1" />
                            {client.city || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.address || 'No address'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.clientType === 'Particulier' ? 'bg-green-100 text-green-800' :
                            client.clientType === 'Professionnel' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {client.clientType || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.isDriver === true ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.isDriver === true ? 'Driver' : 'Non-Driver'}
                          </span>
                          {client.active === false && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewClient(client._id)}
                            className="text-[#1E265F] hover:text-[#272F65] mr-3"
                            title="View Client"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                  

  
  {client.active && (
    <>
      <button
        onClick={() => handleEditClient(client._id)}
        className="text-indigo-600 hover:text-indigo-900 mr-3"
        title="Edit Client"
      >
        <PencilIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleDeleteClient(client)}
        className="text-red-600 hover:text-red-900"
        title="Delete Client"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </>
  )}

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {clients.length > 0 && pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                      filters.page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(pagination.totalPages, filters.page + 1))}
                    disabled={filters.page === pagination.totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                      filters.page === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(filters.page * filters.limit, pagination.totalRecords)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.totalRecords}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                        disabled={filters.page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                          filters.page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      
                      {/* Page numbers */}
                      {[...Array(pagination.totalPages).keys()].map((x) => {
                        const pageNumber = x + 1;
                        // Show first page, last page, and pages around current page
                        if (
                          pageNumber === 1 ||
                          pageNumber === pagination.totalPages ||
                          (pageNumber >= filters.page - 1 && pageNumber <= filters.page + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNumber === filters.page
                                  ? 'z-10 bg-[#1E265F] border-[#1E265F] text-white'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          (pageNumber === 2 && filters.page > 3) ||
                          (pageNumber === pagination.totalPages - 1 && filters.page < pagination.totalPages - 2)
                        ) {
                          // Show ellipsis
                          return (
                            <span
                              key={pageNumber}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => handlePageChange(Math.min(pagination.totalPages, filters.page + 1))}
                        disabled={filters.page === pagination.totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                          filters.page === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Delete Client Modal */}
      <DeleteClientModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        client={clientToDelete}
        onDeleted={handleClientDeleted}
      />
    </div>
  );
};

export default ClientList;