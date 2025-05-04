import { useState, useEffect, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  CreditCardIcon, 
  PencilIcon, 
  ArrowTopRightOnSquareIcon,
  UserIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { getInsurances, getInsuranceTotals } from '../../service/insuranceservice';
import { getUsers } from '../../service/Users';
import { useSelector } from 'react-redux';
import PolicyExpirationModal from './getDaysRemaining';

export default function ListeAssurances() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "admin" || false;
  const [expiringPolicies, setExpiringPolicies] = useState([]);
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    startDate: '',
    period: 'all',
    createdby: '',
    status: 'all'
  });

  const [data, setData] = useState({
    Insurance: [],
    totals: { count: 0, primeHT: 0, primeTTC: 0 },
    users: [],
    todayCount: 0
  });

  const [status, setStatus] = useState({
    loading: true,
    error: null
  });

  useEffect(() => {
    const calculateExpiringPolicies = () => {
      const today = new Date();
      const nearExpiration = data.Insurance.filter(insurance => {
        if (insurance.status !== 'Active') return false;
        
        const endDate = new Date(insurance.endDate);
        const timeDiff = endDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return daysDiff <= 10 && daysDiff >= 0;
      });
      setExpiringPolicies(nearExpiration);
    };
  
    calculateExpiringPolicies();
  }, [data.Insurance]);

  useEffect(() => {
    if (expiringPolicies.length > 0) {
      setShowExpirationModal(true);
    }
  }, [expiringPolicies]);

  const dateRange = useMemo(() => {
    if (filters.period === 'all') return { start: null, end: null };
    const days = parseInt(filters.period);
    let startDateObj = filters.startDate ? new Date(filters.startDate) : new Date();
    
    if (!filters.startDate) {
      startDateObj.setDate(startDateObj.getDate() - days + 1);
    }

    const start = new Date(startDateObj);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }, [filters.period, filters.startDate]);

  const formatDateForAPI = (date) => date ? date.toISOString().split('T')[0] : '';

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const usersData = await getUsers();
      setData(prev => ({ ...prev, users: usersData.data }));
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs :", err);
    }
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const countTodayCases = (insuranceData) => {
    const today = getTodayDate();
    return insuranceData.filter(insurance => 
      new Date(insurance.createdAt).toISOString().split('T')[0] === today
    ).length;
  };

  const calculateFilteredTotals = (insuranceData) => {
    let filteredInsurance = insuranceData.filter(insurance => insurance.status !== 'Canceled');
  
    if (filters.status !== 'all') {
      filteredInsurance = filteredInsurance.filter(insurance => insurance.status === filters.status);
    }
  
    return {
      count: filteredInsurance.length,
      primeHT: filteredInsurance.reduce((sum, insurance) => sum + (insurance.primeHT || 0), 0),
      primeTTC: filteredInsurance.reduce((sum, insurance) => sum + (insurance.primeTTC || 0), 0)
    };
  };
  
  const fetchInsurance = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      const params = { search: filters.searchTerm };
      
      if (isAdmin && filters.createdby) params.createdby = filters.createdby;
      if (filters.period !== 'all') {
        const { start, end } = dateRange;
        if (start && end) {
          params.startDate = formatDateForAPI(start);
          params.endDate = formatDateForAPI(end);
        }
      }
      
      if (filters.status !== 'all') params.status = filters.status;
  
      let InsuranceData = await getInsurances(params);
  
      if (filters.status !== 'all') {
        InsuranceData = InsuranceData.filter(insurance => insurance.status === filters.status);
      }
  
      const totalsData = calculateFilteredTotals(InsuranceData);
      const todayInsuranceCount = countTodayCases(InsuranceData);
      
      setData(prev => ({
        ...prev,
        Insurance: InsuranceData,
        totals: totalsData,
        todayCount: todayInsuranceCount
      }));
      setStatus(prev => ({ ...prev, error: null }));
    } catch (err) {
      console.error("Erreur lors de la récupération des assurances :", err);
      setStatus(prev => ({ ...prev, error: "Échec du chargement des données. Veuillez réessayer." }));
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const goToInsuranceDetails = (InsuranceId) => {
    navigate(`/assurance-cases/${InsuranceId}`);
  };

 

  const getUsernameById = (userId) => {
    const user = data.users.find(u => u._id === userId);
    return user ? user.username : 'Inconnu';
  };

  const getRowBackgroundColor = (insurance) => {
    const isAddedToday = new Date(insurance.createdAt).toISOString().split('T')[0] === getTodayDate();
    if (isAddedToday) return 'bg-blue-50 hover:bg-blue-100';
    switch (insurance.status) {
      case 'Active': return 'bg-green-50 hover:bg-green-100';
      case 'Expired': return 'bg-red-50 hover:bg-red-100';
      case 'Canceled': return 'bg-yellow-50 hover:bg-yellow-100';
      case 'Termination': return 'bg-purple-50 text-purple-100';
      default: return 'hover:bg-gray-50';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Canceled': return 'bg-yellow-100 text-yellow-800';
      case 'Termination': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  useEffect(() => {
    fetchInsurance();
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  useEffect(() => {
    const debounceTimer = setTimeout(fetchInsurance, 500);
    return () => clearTimeout(debounceTimer);
  }, [filters.searchTerm, filters.period, filters.startDate, filters.createdby, filters.status]);

  return (
    <div className="p-4 sm:p-6">
      {/* En-tête */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des insurances d'Assurance</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestion et suivi des insurances
            {isAdmin && filters.createdby && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Filtre : {getUsernameById(filters.createdby)}
              </span>
            )}
            {filters.status !== 'all' && (
              <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(filters.status)}`}>
                Statut : {{
                  'Active': 'Actif',
                  'Expired': 'Expiré',
                  'Canceled': 'Annulé',
                  'Termination': 'Résiliation'
                }[filters.status]}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Contrôles */}
      <div className="mt-8 space-y-4">
        <div className={`grid grid-cols-1 gap-4 ${isAdmin ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
          
          {/* Sélecteur de date */}
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              className="block w-full rounded-md border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1E265F] sm:text-sm"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              disabled={filters.period === 'all'}
            />
          </div>

          {/* Sélecteur de période */}
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full rounded-md border-0 py-2.5 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#1E265F] sm:text-sm"
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
            >
              <option value="all">Toutes périodes</option>
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="60">60 derniers jours</option>
              <option value="90">90 derniers jours</option>
            </select>
          </div>

          {/* Filtre de statut */}
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full rounded-md border-0 py-2.5 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#1E265F] sm:text-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">Tous statuts</option>
              <option value="Active">Actif</option>
              <option value="Expired">Expiré</option>
              <option value="Canceled">Annulé</option>
              <option value="Termination">Résiliation</option>
            </select>
          </div>

          {/* Filtre créateur (admin) */}
          {isAdmin && (
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full rounded-md border-0 py-2.5 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#1E265F] sm:text-sm"
                value={filters.createdby}
                onChange={(e) => handleFilterChange('createdby', e.target.value)}
              >
                <option value="">Tous les créateurs</option>
                {data.users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Barre de recherche */}
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-[#1E265F] sm:text-sm"
              placeholder="Rechercher une insurance..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>
        </div>

        {/* Cartes de synthèse */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          
          {/* Carte nouvelles polices */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Nouvelles insurance</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {new Date().toLocaleDateString('fr-FR')}
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-indigo-600">
              {data.todayCount} insurances
            </p>
          </div>

          {/* Carte période */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Période sélectionnée</h3>
              <span className="text-sm text-gray-400">
                {filters.period === 'all' ? 'Toutes périodes' : 
                dateRange.start && dateRange.end ? 
                `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` : 
                'Sélectionner dates'}
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {filters.period === 'all' ? 'Historique complet' : `${filters.period} jours`}
            </p>
          </div>

          {/* Carte montant total */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Encours total</h3>
              <span className="text-sm text-gray-400">{data.totals.count}insurances</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-green-600">
              {data.totals.primeTTC?.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
            </p>
          </div>
        </div>
      </div>

      {/* Légende des statuts */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Légende des statuts :</h3>
        <div className="flex flex-wrap gap-3">
          <span 
            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200 cursor-pointer"
            onClick={() => handleFilterChange('status', filters.status === 'Active' ? 'all' : 'Active')}
          >
            Actif {filters.status === 'Active' && '✓'}
          </span>
          <span 
            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 border border-red-200 cursor-pointer"
            onClick={() => handleFilterChange('status', filters.status === 'Expired' ? 'all' : 'Expired')}
          >
            Expiré {filters.status === 'Expired' && '✓'}
          </span>
          <span 
            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 cursor-pointer"
            onClick={() => handleFilterChange('status', filters.status === 'Canceled' ? 'all' : 'Canceled')}
          >
            Annulé {filters.status === 'Canceled' && '✓'}
          </span>
          <span 
            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 cursor-pointer"
            onClick={() => handleFilterChange('status', filters.status === 'Termination' ? 'all' : 'Termination')}
          >
            Résiliation {filters.status === 'Termination' && '✓'}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            Ajoutée aujourd'hui
          </span>
          {filters.status !== 'all' && (
            <span 
              className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 cursor-pointer"
              onClick={() => handleFilterChange('status', 'all')}
            >
              Réinitialiser
            </span>
          )}
        </div>
      </div>

      {/* Tableau des polices */}
      {!status.loading && !status.error && (
        <div className="mt-4 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                {data.Insurance.length === 0 ? (
                  <div className="bg-white p-8 text-center">
                    <p className="text-gray-500">Aucune insurance trouvée. Modifiez vos critères de recherche.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        {[
                          "Client", 
                          "N° Police", 
                          "Type", 
                          "Statut",
                          "Prime TTC",
                          ...(isAdmin ? ["Montant Net (HT)"] : []),
                          "Date début", 
                          "Paiement", 
                          "Actions"
                        ].map((header) => (
                          <th
                            key={header}
                            className={`px-4 py-3.5 text-left text-sm font-semibold text-gray-900 ${
                              ['Prime TTC', 'Montant Net (HT)'].includes(header) ? 'text-right' : ''
                            }`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data.Insurance.map((insurance) => {
                     const paymentStatus = insurance.paymentStatus 
                        const netAmount = insurance.status === 'Canceled' 
                          ? null 
                          : insurance.primeTTC * 0.9;

                        return (
                          <tr 
                            key={insurance._id}
                            className={`transition-colors duration-150 cursor-pointer ${getRowBackgroundColor(insurance)}`}
                            onClick={() => goToInsuranceDetails(insurance._id)}
                          >
                            {/* Colonne Client */}
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {insurance.clientName}
                              {new Date(insurance.createdAt).toISOString().split('T')[0] === getTodayDate() && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Nouveau
                                </span>
                              )}
                            </td>

                            {/* Colonne N° Police */}
                            <td className="px-4 py-3 text-sm text-gray-600">
                              #{insurance.policyNumber}
                            </td>

                            {/* Colonne Type */}
                            <td className="px-4 py-3 text-sm text-gray-600">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {insurance.insuranceType}
                              </span>
                            </td>

                            {/* Colonne Statut */}
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(insurance.status)}`}>
                                {{
                                  'Active': 'Actif',
                                  'Expired': 'Expiré',
                                  'Canceled': 'Annulé',
                                  'Termination': 'Résiliation'
                                }[insurance.status]}
                              </span>
                            </td>

                            {/* Colonne Prime TTC */}
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">
                              <span className="font-medium">
                                {insurance.primeTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
                              </span>
                            </td>

                            {/* Colonne Montant Net (HT) - Admin seulement */}
                            {isAdmin && (
                              <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                <span className="font-medium text-green-600">
                                  {netAmount !== null 
                                    ? netAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })
                                    : '—'}
                                </span>
                              </td>
                            )}

                            {/* Colonne Date début */}
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatDate(insurance.startDate)}
                            </td>

                            {/* Colonne Paiement */}
                            <td className="px-4 py-3 text-sm">
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">
                                    {(insurance.status === 'Canceled' || insurance.status === 'Termination') ? 
                                      `insurance  ${insurance.status === 'Canceled' ? 'annulée' : 'résiliée'}` : 
                                      `${paymentStatus.paidAdvances}/${paymentStatus.totalAdvances} versements`}
                                  </span>
                                  <span className="font-medium text-gray-700">
                                    {(insurance.status === 'Canceled' || insurance.status === 'Termination') ? 
                                      '—' : 
                                      `${paymentStatus.paymentPercentage.toFixed(0)}%`}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      (insurance.status === 'Canceled' || insurance.status === 'Termination') ? 
                                        'bg-gray-400' :
                                        paymentStatus.paymentPercentage < 33 ? 'bg-red-600' :
                                        paymentStatus.paymentPercentage < 66 ? 'bg-yellow-500' : 'bg-green-600'
                                    }`}
                                    style={{ 
                                      width: (insurance.status === 'Canceled' || insurance.status === 'Termination') ? 
                                        '100%' : 
                                        `${paymentStatus.paymentPercentage}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Colonne Actions */}
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-3">
                                <button
                                  className="text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Voir le détail"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    goToInsuranceDetails(insurance._id);
                                  }}
                                >
                                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                                  title="Modifier la insurance"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/assurance/${insurance._id}/edition`);
                                  }}
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
                {/* Modal d'expiration */}
                {showExpirationModal && expiringPolicies.length > 0 && (
                  <PolicyExpirationModal
                    policies={expiringPolicies}
                    onClose={() => setShowExpirationModal(false)}
                    onViewDetails={(insuranceId) => goToInsuranceDetails(insuranceId)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}