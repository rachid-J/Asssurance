// components/insurance/DocumentUploadModal.jsx
import { useState, useRef } from 'react';
import { XMarkIcon, DocumentIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { uploadInsuranceDocument } from '../../service/insuranceservice';

export default function DocumentUploadModal({ isOpen, onClose, insuranceId, onDocumentUploaded }) {
  const [file, setFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Define allowed document types
  const allowedTypes = [
    { value: 'contract', label: 'Insurance Contract' },
    { value: 'id', label: 'ID Document' },
    { value: 'vehicle', label: 'Vehicle Document' },
    { value: 'inspection', label: 'Technical Inspection' },
    { value: 'proof', label: 'Proof of Payment' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/tiff'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Only PDF, JPEG, PNG, DOC, DOCX and TIFF are allowed.');
        return;
      }
      
      setFile(selectedFile);
      // Set default document name from filename if not already set
      if (!documentName) {
        setDocumentName(selectedFile.name.split('.')[0]);
      }
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!documentName.trim()) {
      setError('Document name is required');
      return;
    }
    
    if (!documentType) {
      setError('Please select a document type');
      return;
    }
    
    try {
      setIsUploading(true);
      await uploadInsuranceDocument(insuranceId, file, {
        name: documentName,
        type: documentType,
      });
      
      // Clear form and close modal
      setFile(null);
      setDocumentName('');
      setDocumentType('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notify parent component
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
      
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center bg-[#1e265f4f] justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
       

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <DocumentIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Document</h3>
                <button
                  type="button"
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <form className="mt-4" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="documentName" className="block text-sm font-medium text-gray-700">
                    Document Name
                  </label>
                  <input
                    type="text"
                    id="documentName"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                    Document Type
                  </label>
                  <select
                    id="documentType"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    required
                  >
                    <option value="">Select document type</option>
                    {allowedTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.tiff"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG, DOCX up to 10MB
                      </p>
                      {file && (
                        <p className="text-xs text-green-600 font-medium">
                          {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#1E265F] text-base font-medium text-white hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] sm:ml-3 sm:w-auto sm:text-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}