// ClientDetailsView.jsx - Main Component
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getClient } from '../../service/clientService';


export const ClientDetailsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insurances, setInsurances] = useState([]); // Changed from policies
  const [activeTab, setActiveTab] = useState('personal');
  
 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Add state for modal
  const fetchClientDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getClient(id);
      
      setClient(response.client);
      setVehicles(response.client.vehicles || []);
      setInsurances(response.client.insurances || []);
    } catch (error) {
      console.error('Error fetching client details:', error);
      setError('Failed to load client information. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [id]); // Dependency on id

  useEffect(() => {
    if (id) {
      fetchClientDetails();
    }
  }, [id, fetchClientDetails]);

  const handleEditClient = () => {
    navigate(`/clients/${id}/edit`);
  };

  const handleAddVehicle = () => {
    navigate(`/vehicles/new?clientId=${id}`);
  };

  const handleViewVehicle = (vehicleId) => {
    navigate(`/vehicles/${vehicleId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} onBack={() => navigate('/clients')} />;
  }

  if (!client) {
    return <ErrorMessage message="Client not found." onBack={() => navigate('/clients')} isWarning />;
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
            <ClientHeader client={client} />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleEditClient}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            {client?.active && (
            <button
              onClick={() => setIsDeleteModalOpen(true)} // Open modal on click
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
            >
              <TrashIcon className="h-4 w-5 mr-2" />
              Delete
            </button>
          )}
      </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <NavigationTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDriver={client.isDriver}
        vehiclesCount={vehicles.length}
      />   
      <DeleteClientModal
      isOpen={isDeleteModalOpen}
      onClose={() => {
        setIsDeleteModalOpen(false);
        fetchClientDetails(); // Refetch data on close
      }}
      client={client.id}
      onDeleted={() => navigate('/clients')} // Navigate after hard delete
    />
      
      {/* Content Area */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {activeTab === 'personal' && (
          <PersonalInfoTab client={client} formatDate={formatDate} />
        )}

        {activeTab === 'contact' && (
          <ContactDetailsTab client={client} />
        )}

        {activeTab === 'license' && client.isDriver && (
          <LicenseInfoTab client={client} formatDate={formatDate} />
        )}

{activeTab === 'insurance' && ( // Changed from 'policy'
          <InsuranceTab 
            insurances={insurances} 
            clientId={id} 
            navigate={navigate} 
            formatDate={formatDate} 
          />
        )}

        {activeTab === 'vehicles' && (
          <VehiclesTab 
            vehicles={vehicles} 
            handleAddVehicle={handleAddVehicle} 
            handleViewVehicle={handleViewVehicle} 
          />
        )}
      </div>
    </div>
  );
};

// Utility functions
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

// Import icons here to be used across components
import { 
  PencilIcon, 
  TrashIcon, 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  TruckIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  DocumentIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { NavigationTabs } from './Common/NavigationTabs';import { PersonalInfoTab } from './components/info/PersonalInfoTab';
import { ContactDetailsTab } from './components/info/ContactDetailsTab';
import { LicenseInfoTab } from './components/License/LicenseInfoTab';
import { VehiclesTab } from './components/vehicules/VehiclesTab';
import { ClientHeader } from './Common/ClientHeader';
import { LoadingSpinner } from './Common/LoadingSpinner';
import { ErrorMessage } from './Common/ErrorMessage';
import { InsuranceTab } from './components/Insurance/InsuranceTab';
import DeleteClientModal from './Common/DeleteClientModal';

