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
    type: 'Immatriculation',
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
      setError('Veuillez sélectionner un fichier à téléverser');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const uploadData = new FormData();
      uploadData.append('documentFile', file);
      
      Object.keys(formData).forEach(key => {
        uploadData.append(key, formData[key]);
      });

      const response = await addVehicleDocument(vehicleId, uploadData);
      
      setFile(null);
      setFormData({
        ...formData,
        title: '',
        notes: ''
      });
      
      if (onDocumentAdded) {
        onDocumentAdded(response.document);
      }
      
    } catch (err) {
      setError(err.message || 'Échec du téléversement du document');
      console.error('Erreur de téléversement :', err);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' octets';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' Ko';
    else return (bytes / 1048576).toFixed(1) + ' Mo';
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Téléverser un document</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded-md flex items-start">
          <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fichier <span className="text-red-500">*</span>
          </label>
          
          {!file ? (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#1E265F] hover:text-[#272F65] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#1E265F]">
                    <span>Téléverser un fichier</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={disabled || uploading}
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, PNG, JPG, DOCX jusqu'à 10 Mo
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de document <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              disabled={uploading || disabled}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E265F] focus:border-transparent"
              required
            >
              <option value="Immatriculation">Immatriculation</option>
              <option value="Contrôle technique">Contrôle technique</option>
              <option value="Assurance">Assurance</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre du document <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={uploading || disabled}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E265F] focus:border-transparent"
              placeholder="Saisir le titre du document"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'émission <span className="text-red-500">*</span>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'expiration <span className="text-red-500">*</span>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Autorité émettrice
            </label>
            <input
              type="text"
              name="issuingAuthority"
              value={formData.issuingAuthority}
              onChange={handleInputChange}
              disabled={uploading || disabled}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1E265F] focus:border-transparent"
              placeholder="Autorité ayant émis le document"
            />
          </div>
          
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
              placeholder="Notes supplémentaires (facultatif)"
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
            {uploading ? 'Téléversement en cours...' : 'Téléverser le document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploader;