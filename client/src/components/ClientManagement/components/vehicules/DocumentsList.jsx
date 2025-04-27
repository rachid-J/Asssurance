import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { deleteVehicleDocument, getVehicleDocumentUrl } from '../../../../service/vehicleDocumentService';

const DocumentsList = ({ vehicleId, documents = [], onDocumentDeleted, readOnly = false }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  // Helper to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle document download
  const handleDownload = (documentId, documentName) => {
    const downloadUrl = getVehicleDocumentUrl(vehicleId, documentId);
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', documentName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle document deletion
  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setDeletingId(documentId);
      setError(null);
      
      await deleteVehicleDocument(vehicleId, documentId);
      
      if (onDocumentDeleted) {
        onDocumentDeleted(documentId);
      }
    } catch (err) {
      setError('Failed to delete document: ' + (err.message || 'Unknown error'));
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Get appropriate icon for document type
  const getDocumentIcon = (doc) => {
    // Default icon
    return <DocumentTextIcon className="h-6 w-6 text-[#1E265F]" />;
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">No documents have been uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-md flex items-start">
          <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Document</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Issue Date</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expiry Date</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {documents.map((doc) => (
              <tr key={doc._id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center">
                      {getDocumentIcon(doc)}
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900 truncate max-w-xs" title={doc.title}>
                        {doc.title || doc.file?.originalName || 'Unnamed Document'}
                      </div>
                      {doc.file && (
                        <div className="text-gray-500 text-xs">
                          {doc.file.originalName}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {doc.type}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatDate(doc.issueDate)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatDate(doc.expiryDate)}
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleDownload(doc._id, doc.file?.originalName || doc.title)}
                      className="text-[#1E265F] hover:text-[#272F65]"
                      title="Download"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                    
                    {!readOnly && (
                      <button
                        onClick={() => handleDelete(doc._id)}
                        disabled={deletingId === doc._id}
                        className={`text-red-600 hover:text-red-900 ${
                          deletingId === doc._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentsList;