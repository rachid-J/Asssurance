// pages/VehicleDocumentsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import DocumentsList from './DocumentsList';
import { getVehicle } from '../../../../service/vehicleService';



const VehicleDocumentsPage = () => {
  const { clientId, vehicleId } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicleAndDocuments = async () => {
      try {
        setIsLoading(true);
        const vehicleData = await getVehicle(vehicleId);
        console.log("vehicleData", vehicleData);
        setVehicle(vehicleData.vehicle);
        
        // Set documents from the vehicle data instead of empty array
        setDocuments(vehicleData.vehicle.documents || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
  
    fetchVehicleAndDocuments();
  }, [vehicleId]);

  const handleAddDocument = () => {
    navigate(`/clients/${clientId}/vehicles/${vehicleId}/documents/add`);
  };

  const handleDocumentDeleted = async (documentId) => {
    try {
      // Delete the document via API
      // await api.deleteDocument(documentId);
      
      // Update the local state
      setDocuments(documents.filter(doc => doc._id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleBackClick = () => {
    navigate(`/clients/${clientId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  console.log("data",vehicle);

  if (!vehicle) {
    return (
      <div className="p-6">
        <div className="text-red-500">Vehicle not found</div>
        <button 
          onClick={handleBackClick}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E265F]"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Vehicles
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={handleBackClick}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
            aria-label="Back to vehicles"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Documents for {vehicle.make} {vehicle.model}
          </h1>
        </div>
        <button
          onClick={handleAddDocument}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Document
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Vehicle Details</h2>
        </div>
        <div className="px-6 py-5 space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Registration:</span> {vehicle.registrationNumber}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Year:</span> {vehicle.yearOfManufacture}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Documents</h2>
        </div>
        <div className="px-6 py-5">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No documents found for this vehicle.</p>
              <p className="mt-2">Click the "Add Document" button to upload a document.</p>
            </div>
          ) : (
            <DocumentsList 
              vehicleId={vehicleId}
              documents={documents}
              onDocumentDeleted={handleDocumentDeleted}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDocumentsPage;