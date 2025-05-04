import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { deleteClient } from '../../../service/clientService';

const DeleteClientModal = ({ isOpen, onClose, client, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = React.useState(null);
  const [relationships, setRelationships] = React.useState(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await deleteClient(client);
      
      if (response.relationships) {
        setRelationships(response.relationships);
      } else {
        onDeleted();
        onClose();
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Une erreur est survenue lors de la suppression du client'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1d27687a] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <XMarkIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Supprimer le client
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Voulez-vous vraiment supprimer le client{' '}
                    <span className="font-medium text-gray-700">
                      {client ? `${client.title} ${client.firstName} ${client.name}` : ''}
                    </span>
                    ? Cette action est irréversible.
                  </p>
                  
                  {relationships && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                      <p className="text-sm text-yellow-800 font-medium">
                        Ce client a des relations existantes :
                      </p>
                      <ul className="mt-1 text-sm text-yellow-700 list-disc pl-5">
                        {relationships.vehicles && (
                          <li>Véhicules enregistrés</li>
                        )}
                        {relationships.insurances && (
                          <li>Polices d'assurance</li>
                        )}
                      </ul>
                      <p className="mt-2 text-sm text-yellow-800">
                        Le client a été marqué comme inactif au lieu d'être supprimé définitivement.
                      </p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {relationships ? (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Fermer
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Suppression en cours...
                    </>
                  ) : (
                    'Supprimer'
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Annuler
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteClientModal;