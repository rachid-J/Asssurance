// components/InsuranceTableRow.js
import { PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export const InsuranceTableRow = ({ insurance, navigate, formatDate, isExpanded, toggleExpansion }) => {
  const daysTotal = Math.ceil((new Date(insurance.endDate) - new Date(insurance.startDate)) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.ceil((new Date(insurance.endDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', { 
      style: 'currency', 
      currency: 'MAD' 
    }).format(amount);
  };

  return (
    <>
      <tr className={`hover:bg-gray-50 ${
        insurance.status === 'Active' ? 'border-l-4 border-green-400' :
        insurance.status === 'Expired' ? 'border-l-4 border-red-400' :
        insurance.status === 'Canceled' ? 'border-l-4 border-orange-400' :
        insurance.status === 'Termination' ? 'border-l-4 border-purple-400' :
        ''
      }`}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <button 
              onClick={toggleExpansion}
              className="mr-3 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
            <div>
              <div className="text-sm font-medium text-[#1E265F]">{insurance.policyNumber}</div>
              <div className="text-sm text-gray-500">{insurance.insuranceType}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{formatDate(insurance.startDate)}</div>
          <div className="text-sm text-gray-500">au {formatDate(insurance.endDate)}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-green-700">{formatCurrency(insurance.primeTTC)}</div>
          <div className="text-sm text-gray-500">Actuel : {formatCurrency(insurance.primeActuel)}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            insurance.status === 'Active' ? 'bg-green-100 text-green-800' :
            insurance.status === 'Expired' ? 'bg-red-100 text-red-800' :
            insurance.status === 'Canceled' ? 'bg-orange-100 text-orange-800' :
            insurance.status === 'Termination' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {insurance.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end space-x-2">
            <button 
              onClick={() => navigate(`/insurances/${insurance._id}`)}
              className="text-gray-500 hover:text-[#1E265F]"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button className="text-gray-500 hover:text-red-600">
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </td>
      </tr>
      
      {isExpanded && (
        <tr>
          <td colSpan="5" className={`px-6 py-4 border-t border-gray-200 ${
            insurance.status === 'Active' ? 'bg-green-50' :
            insurance.status === 'Expired' ? 'bg-red-50' :
            insurance.status === 'Canceled' ? 'bg-orange-50' :
            insurance.status === 'Termination' ? 'bg-purple-50' :
            'bg-gray-50'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-700">Informations du véhicule</h5>
                {insurance.vehicle ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Marque</span>
                      <span className="text-sm text-gray-900">{insurance.vehicle.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Modèle</span>
                      <span className="text-sm text-gray-900">{insurance.vehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Immatriculation</span>
                      <span className="text-sm text-gray-900">{insurance.vehicle.registrationNumber}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucune information sur le véhicule disponible</p>
                )}
              </div>
              
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-700">Détails de l'assurance</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Type d'usage</span>
                    <span className="text-sm text-gray-900">{insurance.vehicle.usage || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Période de couverture</span>
                    <span className="text-sm text-gray-900">{daysTotal} jours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Jours restants</span>
                    <span className="text-sm text-gray-900">{daysRemaining} jours</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-700">Documents</h5>
                {insurance.documents?.length > 0 ? (
                  <ul className="space-y-2">
                    {insurance.documents.map((doc, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{doc.name || doc.type}</span>
                        <span className="text-gray-500">{formatDate(doc.date || doc.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Aucun document disponible</p>
                )}
              </div>
            </div>
            
            {insurance.comment && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Notes supplémentaires</h5>
                <p className="text-sm text-gray-600">{insurance.comment}</p>
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
              <span>Créé le {formatDate(insurance.createdAt || new Date())}</span>
              <span>Dernière mise à jour le {formatDate(insurance.updatedAt || new Date())}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};