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

  // Types de documents autorisés
  const allowedTypes = [
    { value: 'contract', label: 'Contrat d\'assurance' },
    { value: 'id', label: 'Document d\'identité' },
    { value: 'vehicle', label: 'Document véhicule' },
    { value: 'inspection', label: 'Contrôle technique' },
    { value: 'proof', label: 'Preuve de paiement' },
    { value: 'other', label: 'Autre' }
  ];

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      const selectedFile = e.target.files[0];
      
      // Validation taille du fichier (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('La taille du fichier doit être inférieure à 10 Mo');
        return;
      }
      
      // Validation type de fichier
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/tiff'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Type de fichier non valide. Formats acceptés : PDF, JPEG, PNG, DOC, DOCX et TIFF');
        return;
      }
      
      setFile(selectedFile);
      if (!documentName) {
        setDocumentName(selectedFile.name.split('.')[0]);
      }
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }
    
    if (!documentName.trim()) {
      setError('Le nom du document est requis');
      return;
    }
    
    if (!documentType) {
      setError('Veuillez sélectionner un type de document');
      return;
    }
    
    try {
      setIsUploading(true);
      await uploadInsuranceDocument(insuranceId, file, {
        name: documentName,
        type: documentType,
      });
      
      setFile(null);
      setDocumentName('');
      setDocumentType('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
      
      onClose();
    } catch (error) {
      setError(error.message || 'Échec du téléversement');
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
                <h3 className="text-lg leading-6 font-medium text-gray-900">Téléverser un document</h3>
                <button
                  type="button"
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  <span className="sr-only">Fermer</span>
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
                    Nom du document
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
                    Type de document
                  </label>
                  <select
                    id="documentType"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    {allowedTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Fichier à téléverser
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Téléverser un fichier</span>
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
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG, DOCX jusqu'à 10 Mo
                      </p>
                      {file && (
                        <p className="text-xs text-green-600 font-medium">
                          {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} Mo)
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
                    {isUploading ? 'Téléversement en cours...' : 'Téléverser le document'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={onClose}
                  >
                    Annuler
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