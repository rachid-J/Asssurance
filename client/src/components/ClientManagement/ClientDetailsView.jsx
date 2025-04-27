import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  TruckIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  DocumentIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { getClient } from '../../service/clientService';

export const ClientDetailsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        const response = await getClient(id);
        setClient(response.client);
        setVehicles(response.vehicles || []);
        setPolicies(response.policies || []);
        console.log('Client details:', response.policies);
      } catch (error) {
        console.error('Error fetching client details:', error);
        setError('Failed to load client information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchClientDetails();
    }
  }, [id]);

  const handleEditClient = () => {
    navigate(`/clients/${id}/edit`);
  };

  const handleDeleteClient = () => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      console.log('Delete client:', id);
      navigate('/clients');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleAddVehicle = () => {
    navigate(`/vehicles/new?clientId=${id}`);
  };

  const handleViewVehicle = (vehicleId) => {
    navigate(`/vehicles/${vehicleId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E265F]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <p>{error}</p>
          <button
            onClick={() => navigate('/clients')}
            className="mt-2 text-red-600 underline"
          >
            Back to Client List
          </button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
          <p>Client not found.</p>
          <button
            onClick={() => navigate('/clients')}
            className="mt-2 text-yellow-600 underline"
          >
            Back to Client List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/clients')}
              className="mr-4 p-2 rounded-md hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {client.title} {client.firstName} {client.name}
              </h1>
              <p className="text-sm text-gray-600">
                {client.clientType} • {client.isDriver ? 'Driver' : 'Non-Driver'} • Card: {client.idNumber || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleEditClient}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDeleteClient}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('personal')}
            className={`
              pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${activeTab === 'personal'
                ? 'border-[#1E265F] text-[#1E265F]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`
              pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${activeTab === 'contact'
                ? 'border-[#1E265F] text-[#1E265F]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Contact Details
          </button>
          {client.isDriver && (
            <button
              onClick={() => setActiveTab('license')}
              className={`
                pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === 'license'
                  ? 'border-[#1E265F] text-[#1E265F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              License Information
            </button>
          )}
          <button
            onClick={() => setActiveTab('policy')}
            className={`
              pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${activeTab === 'policy'
                ? 'border-[#1E265F] text-[#1E265F]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Policy Information
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`
              pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${activeTab === 'vehicles'
                ? 'border-[#1E265F] text-[#1E265F]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Vehicles ({vehicles.length})
          </button>
        </nav>
      </div>
      
      {/* Content Area */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {activeTab === 'personal' && (
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
            <div className="mt-5 border-t border-gray-200">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.title} {client.firstName} {client.name}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Client type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      client.clientType === 'Particulier' ? 'bg-green-100 text-green-800' :
                      client.clientType === 'Professionnel' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {client.clientType || 'Unknown'}
                    </span>
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">ID Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.idType || 'N/A'}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Card Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.idNumber || 'N/A'}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(client.dateOfBirth)}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.gender || 'N/A'}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Marital Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.maritalStatus || 'N/A'}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Number of Children</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.numberOfChildren !== undefined ? client.numberOfChildren : 'N/A'}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Profession</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.profession || 'N/A'}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Driver Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.isDriver ? 'Driver' : 'Non-Driver'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Contact Details</h3>
            <div className="mt-5 border-t border-gray-200">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {client.telephone || 'N/A'}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {client.email || 'N/A'}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-start">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      {client.address || 'N/A'}
                      {client.postalCode && client.city && (
                        <div className="mt-1">{client.postalCode}, {client.city}</div>
                      )}
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'license' && client.isDriver && (
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">License Information</h3>
            <div className="mt-5 border-t border-gray-200">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">License Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <IdentificationIcon className="h-5 w-5 text-gray-400 mr-2" />
                      {client.licenseNumber || 'N/A'}
                    </div>
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">License Category</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {client.licenseCategory || 'N/A'}
                    </span>
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">License Country</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.licenseCountry || 'N/A'}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">License Issue Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(client.licenseIssueDate)}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">License Expiry Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(client.licenseExpiryDate)}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Years of Experience</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.licenseIssueDate 
                      ? Math.floor((new Date() - new Date(client.licenseIssueDate)) / (365.25 * 24 * 60 * 60 * 1000)) + ' years'
                      : 'N/A'}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">License Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {client.licenseExpiryDate && new Date(client.licenseExpiryDate) > new Date() 
                      ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Valid</span>
                      : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'policy' && (
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Policy Details</h3>
              <button
                onClick={() => navigate(`/clients/${id}/policies/new`)}
                className="inline-flex items-center px-4 py-2 bg-[#1E265F] text-white rounded-md hover:bg-[#272F65] transition-colors"
              >
                <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                New Policy
              </button>
            </div>

            {policies.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No policies found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new insurance policy.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {policies.map((policy) => (
                  <div key={policy._id} className="bg-white shadow-sm rounded-lg border border-gray-200">
                    {/* Policy Header */}
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-[#1E265F]">
                            {policy.policyNumber}
                            <span className="ml-2 text-sm font-medium text-gray-500">
                              {policy.insuranceType}
                            </span>
                          </h4>
                          <div className="mt-1 flex items-center space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              policy.status === 'active' ? 'bg-green-100 text-green-800' :
                              policy.status === 'expired' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {policy.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => navigate(`/policies/${policy._id}`)}
                            className="p-2 text-gray-500 hover:text-[#1E265F] rounded-lg hover:bg-gray-100"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Policy Body */}
                    <div className="px-4 py-5 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Financial Summary */}
                        <div className="space-y-4">
                          <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Financial Summary
                          </h5>
                          <dl className="grid grid-cols-2 gap-4">
                            <div>
                              <dt className="text-sm text-gray-500">Prime HT</dt>
                              <dd className="mt-1 text-lg font-medium text-gray-900">
                                {new Intl.NumberFormat('fr-MA', { 
                                  style: 'currency', 
                                  currency: 'MAD' 
                                }).format(policy.primeHT)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500">Prime TTC</dt>
                              <dd className="mt-1 text-lg font-medium text-green-700">
                                {new Intl.NumberFormat('fr-MA', { 
                                  style: 'currency', 
                                  currency: 'MAD' 
                                }).format(policy.primeTTC)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500">Current Prime</dt>
                              <dd className="mt-1 text-lg font-medium text-blue-700">
                                {new Intl.NumberFormat('fr-MA', { 
                                  style: 'currency', 
                                  currency: 'MAD' 
                                }).format(policy.primeActuel)}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        {/* Policy Details */}
                        <div className="space-y-4">
                          <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Policy Details
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Usage Type</span>
                              <span className="text-sm text-gray-900">{policy.usage}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Coverage Period</span>
                              <span className="text-sm text-gray-900">
                                {Math.ceil((new Date(policy.endDate) - new Date(policy.startDate)) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Days Remaining</span>
                              <span className="text-sm text-gray-900">
                                {Math.ceil((new Date(policy.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Information */}
                      {policy.comment && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Additional Notes
                          </h5>
                          <p className="text-sm text-gray-600">{policy.comment}</p>
                        </div>
                      )}

                      {/* Document Attachments */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                          Attachments
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {policy.documents?.map((doc, index) => (
                            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                              <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{doc.type}</p>
                                <p className="text-sm text-gray-500 truncate">Expires {formatDate(doc.expiryDate)}</p>
                              </div>
                              <button className="ml-3 text-[#1E265F] hover:text-[#272F65]">
                                <ArrowDownTrayIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Policy Footer */}
                    <div className="px-4 py-3 sm:px-6 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Created {formatDate(policy.createdAt)}</span>
                        <span>Last updated {formatDate(policy.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'vehicles' && (
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
              <div className="text-center py-12 border-t border-gray-200">
                <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by adding a new vehicle for this client.
                  </p>
              </div>
            ) : (
              <div className="mt-5 border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {vehicles.map((vehicle) => (
                    <li key={vehicle._id} className="py-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleViewVehicle(vehicle._id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <TruckIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[#1E265F]">
                              {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              <span className="font-semibold">Registration:</span> {vehicle.registrationNumber || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              <span className="font-semibold">Year:</span> {vehicle.yearOfManufacture || 'N/A'}
                            </div>
                            <div className="mt-1 flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                {vehicle.fuelType || 'N/A'}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {vehicle.vehicleType || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <DocumentDuplicateIcon className="h-5 w-5" />
                          </button>
                          <button className="text-[#1E265F] hover:text-[#272F65]">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};