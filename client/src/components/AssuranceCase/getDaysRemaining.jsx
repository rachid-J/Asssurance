import { XMarkIcon, EnvelopeIcon, PhoneIcon, ClockIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';

/**
 * Modalité d'expiration des polices - Affiche les échéances des polices
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.policies - Tableau des polices à afficher
 * @param {Function} props.onClose - Fonction de fermeture de la modale
 * @param {Function} props.onViewDetails - Fonction de visualisation des détails
 * @returns {JSX.Element} Composant modal rendu
 */
export default function PolicyExpirationModal({ 
  policies = [], 
  onClose,
  onViewDetails 
}) {
  /**
   * Calcule les jours restants avant expiration
   * 
   * @param {string|Date} endDate - Date de fin de police
   * @returns {number} Jours restants
   */
  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    
    try {
      const end = new Date(endDate);
      const today = new Date();
      const timeDiff = end.getTime() - today.getTime();
      return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    } catch (error) {
      console.error("Erreur de calcul des jours restants :", error);
      return 0;
    }
  };

  // Trie les polices par date d'expiration
  const sortedPolicies = useMemo(() => {
    return [...policies].sort((a, b) => {
      const daysA = getDaysRemaining(a.endDate);
      const daysB = getDaysRemaining(b.endDate);
      return daysA - daysB;
    });
  }, [policies]);
  
  // Formatage de la date en français
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Erreur de formatage de date :", error);
      return 'Date invalide';
    }
  };

  // Gestion de la sélection d'une police
  const handlePolicySelect = (policyId) => {
    onViewDetails?.(policyId);
    onClose?.();
  };

  // Détermine la classe CSS selon les jours restants
  const getStatusClass = (daysRemaining) => {
    if (daysRemaining <= 3) {
      return 'bg-red-100 text-red-800';
    } else if (daysRemaining <= 14) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1e265f34] bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-[#FDFDFD] rounded-lg shadow-xl p-6 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6 border-b border-[#999AB6]/20 pb-4">
          <h2 className="text-xl font-bold text-[#1E265F] flex items-center">
            <ClockIcon className="h-6 w-6 mr-2 text-[#1E265F]" />
            Échéances des polices
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#FBFBFB] rounded-full transition-colors"
            aria-label="Fermer la modale"
          >
            <XMarkIcon className="h-6 w-6 text-[#999AB6]" />
          </button>
        </div>
        
        {sortedPolicies.length === 0 ? (
          <div className="py-12 text-center text-[#999AB6]">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-[#999AB6]/50" />
            <p>Aucune échéance à venir</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {sortedPolicies.map(policy => {
              const daysRemaining = getDaysRemaining(policy.endDate);
              const statusClass = getStatusClass(daysRemaining);

              return (
                <div
                  key={policy._id}
                  className="border border-[#999AB6]/20 p-4 rounded-md hover:bg-[#FBFBFB] cursor-pointer transition-colors"
                  onClick={() => handlePolicySelect(policy._id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-[#1E265F]">
                        {policy.clientName || 'Client sans nom'} - <span className="text-[#999AB6]">#{policy.policyNumber || 'N/A'}</span>
                      </h3>
                      <p className="text-sm text-[#999AB6]">
                        {policy.insuranceType || 'Type non spécifié'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
                      {daysRemaining} jour{daysRemaining !== 1 ? 's' : ''} restant{daysRemaining !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {/* Informations de contact */}
                  <div className="mt-3 space-y-2">
                    {policy.client && (policy.client.email || policy.client.telephone) && (
                      <div className="flex flex-wrap gap-4 text-sm">
                        {policy.client.email && (
                          <div className="flex items-center text-[#1E265F]">
                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                            <a 
                              href={`mailto:${policy.client.email}`}
                              className="hover:underline"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Envoyer un e-mail à ${policy.clientName}`}
                            >
                              {policy.client.email}
                            </a>
                          </div>
                        )}
                        {policy.client.telephone && (
                          <div className="flex items-center text-[#1E265F]">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            <a 
                              href={`tel:${policy.client.telephone}`}
                              className="hover:underline"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Appeler ${policy.clientName}`}
                            >
                              {policy.client.telephone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-sm text-[#999AB6] flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Expire le : {formatDate(policy.endDate)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#999AB6]/20 flex justify-between items-center">
          <div className="flex items-center text-xs text-[#999AB6]">
            <ShieldCheckIcon className="h-4 w-4 text-[#1E265F] mr-1" />
            Informations sécurisées
          </div>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#1E265F] hover:bg-[#272F65] rounded-md text-white transition-colors text-sm font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}