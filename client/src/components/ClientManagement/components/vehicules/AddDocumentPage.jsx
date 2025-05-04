// pages/AddDocumentPage.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import DocumentUploader from './DocumentUploader';

const AddDocumentPage = () => {
  const { clientId, vehicleId } = useParams();
  const navigate = useNavigate();

  const handleDocumentAdded = (document) => {
    // Navigation vers la liste des documents après l'upload
    navigate(`/clients/${clientId}/vehicles/${vehicleId}/documents`);
  };

  const handleCancel = () => {
    navigate(`/clients/${clientId}/vehicles/${vehicleId}/documents`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <button 
          onClick={handleCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour aux documents
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-lg font-medium text-gray-900">Téléverser un document</h1>
        </div>
        <div className="px-6 py-5">
          <DocumentUploader
            vehicleId={vehicleId}
            onDocumentAdded={handleDocumentAdded}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default AddDocumentPage;