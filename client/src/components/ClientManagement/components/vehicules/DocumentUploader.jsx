import React, { useState } from 'react';
import { 
  DocumentIcon, 
  XMarkIcon, 
  PaperClipIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { addVehicleDocument } from '../../../../service/vehicleDocumentService';

const DocumentUploader = ({ vehicleId, onDocumentAdded, disabled = false }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Registration',
    title: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    issuingAuthority: '',
    notes: ''
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill title with filename if empty
      if (!formData.title) {
        setFormData({
          ...formData,
          title: selectedFile.name.split('.')[0]
        });
      }
      setError(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Create form data for upload
      const uploadData = new FormData();
      uploadData.append('documentFile', file);
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        uploadData.append(key, formData[key]);
      });

      const response = await addVehicleDocument(vehicleId, uploadData);
      
      // Clear form
      setFile(null);
      setFormData({
        ...formData,
        title: '',
        notes: ''
      });
      
      // Notify parent component
      if (onDocumentAdded) {
        onDocumentAdded(response.document);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to upload document');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded-md flex items-start">
          <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* File Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File <span className="text-red-500">*</span>
          </label>
          
          {!file ? (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#1E265F] hover:text-[#272F65] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#1E265F]">
                    <span>Upload a file</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={disabled || uploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, PNG, JPG, DOCX up to 10MB
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
              <div className="flex items-center">
                <PaperClipIcon className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={clearFile}
                disabled={uploading}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              disabled={uploading || disabled}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E265F] focus:border-transparent"
              required
            >
              <option value="Registration">Registration</option>
              <option value="Technical Inspection">Technical Inspection</option>
              <option value="Insurance">Insurance</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {/* Document Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={uploading || disabled}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E265F] focus:border-transparent"
              placeholder="Enter document title"
              required
            />
          </div>
          
          {/* Issue Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleInputChange}
              disabled={uploading || disabled}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E265F] focus:border-transparent"
              required
            />
          </div>
          
          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              disabled={uploading || disabled}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E265F] focus:border-transparent"
              required
            />
          </div>
          
          {/* Issuing Authority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issuing Authority
            </label>
            <input
              type="text"
              name="issuingAuthority"
              value={formData.issuingAuthority}
              onChange={handleInputChange}
              disabled={uploading || disabled}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E265F] focus:border-transparent"
              placeholder="Authority that issued the document"
            />
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={uploading || disabled}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E265F] focus:border-transparent"
              placeholder="Additional notes (optional)"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!file || uploading || disabled}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1E265F] hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] ${
              (!file || uploading || disabled) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploader;