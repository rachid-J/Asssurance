// Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  BanknotesIcon,
  ClockIcon,
  DocumentCheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CalendarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { dashboardService } from '../../service/Dashboardservice';
import { useSelector } from 'react-redux';
import UnauthorizedDashboard from './UnauthorizedDashboard';

// Fonctions utilitaires
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount).replace('MAD', '').trim();
};

const statusColors = {
  Actif: 'bg-green-100 text-green-800',
  Expiré: 'bg-red-100 text-red-800',
  Résilié: 'bg-yellow-100 text-yellow-800',
  Annulé: 'bg-gray-100 text-gray-800',
};

const paymentMethodLabels = {
  cash: 'Espèces',
  bank_transfer: 'Virement Bancaire',
  check: 'Chèque',
  card: 'Carte',
};

export const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentInsurances, setRecentInsurances] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const user = useSelector((state) => state.auth.user);
  const [currentLanguage] = useState(localStorage.getItem("lang") || 'fr');
  const [revenueTrend, setRevenueTrend] = useState({ 
    percentage: 0, 
    isUp: false,
    currentValue: 0,
    previousValue: 0
  });
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if ((selectedStatus !== 'Tous' && selectedStatus !== '') || dateFilter.startDate || dateFilter.endDate) {
      setIsFiltering(true);
      loadFilteredData();
    } else {
      setIsFiltering(false);
      loadDashboardData();
    }
  }, [selectedStatus, dateFilter.startDate, dateFilter.endDate]);

  useEffect(() => {
    calculateRevenueTrend();
  }, [monthlyRevenueData]);

  const calculateRevenueTrend = () => {
    if (monthlyRevenueData && monthlyRevenueData.length >= 2) {
      const sortedData = [...monthlyRevenueData].sort((a, b) => 
        new Date(a.period) - new Date(b.period)
      );
      
      const dataWithActual = sortedData.filter(item => 
        item.actual !== undefined && item.actual !== null
      );
      
      if (dataWithActual.length >= 2) {
        const currentMonth = dataWithActual[dataWithActual.length - 1];
        const previousMonth = dataWithActual[dataWithActual.length - 2];
        
        const currentValue = currentMonth.actual;
        const previousValue = previousMonth.actual;
        
        if (previousValue === 0) {
          setRevenueTrend({ 
            percentage: currentValue > 0 ? 100 : 0, 
            isUp: currentValue > 0,
            currentValue,
            previousValue
          });
        } else {
          const percentageChange = ((currentValue - previousValue) / previousValue) * 100;
          setRevenueTrend({ 
            percentage: Math.abs(percentageChange.toFixed(1)), 
            isUp: percentageChange > 0,
            currentValue,
            previousValue
          });
        }
        
        const currentMonthName = new Date(currentMonth.period).toLocaleDateString('fr-FR', { month: 'long' });
        const previousMonthName = new Date(previousMonth.period).toLocaleDateString('fr-FR', { month: 'long' });
        
        setRevenueTrend(prev => ({
          ...prev,
          currentMonthName,
          previousMonthName
        }));
      }
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [stats, insurances, payments, revenue] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentInsurances(),
        dashboardService.getRecentPayments(),
        dashboardService.getMonthlyRevenue()
      ]);
      
      setDashboardData(stats);
      setRecentInsurances(insurances);
      setRecentPayments(payments);
      setMonthlyRevenueData(revenue);
      
      localStorage.setItem('dashboard_cache', JSON.stringify({
        stats,
        insurances,
        payments,
        revenue,
        timestamp: Date.now()
      }));
    } catch (err) {
      setError(err.message);
      const cached = localStorage.getItem('dashboard_cache');
      if (cached) {
        const data = JSON.parse(cached);
        setDashboardData(data.stats);
        setRecentInsurances(data.insurances);
        setRecentPayments(data.payments);
        setMonthlyRevenueData(data.revenue);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredData = async () => {
    setLoading(true);
    try {
      const filters = {
        status: selectedStatus !== 'Tous' ? selectedStatus : null,
        startDate: dateFilter.startDate || null,
        endDate: dateFilter.endDate || null
      };

      const [stats, insurances, payments, revenue] = await Promise.all([
        dashboardService.getDashboardStats(filters),
        dashboardService.getRecentInsurances(filters),
        dashboardService.getRecentPayments(filters),
        dashboardService.getMonthlyRevenue(filters)
      ]);
      
      setDashboardData(stats);
      setRecentInsurances(insurances);
      setRecentPayments(payments);
      setMonthlyRevenueData(revenue);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    
    setDateFilter(prev => {
      if (name === 'endDate' && prev.startDate && value < prev.startDate) {
        return { ...prev, [name]: prev.startDate };
      }
      if (name === 'startDate' && prev.endDate && value > prev.endDate) {
        return { ...prev, [name]: prev.endDate };
      }
      return { ...prev, [name]: value };
    });
  };

  const resetFilters = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setSelectedStatus('Tous');
    setIsFiltering(false);
    loadDashboardData();
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F9FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E265F]"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <UnauthorizedDashboard />;
  }

  return (
    <div className={`min-h-screen bg-[#F9FAFC] ${currentLanguage === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {isOffline && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md flex items-center shadow-sm">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <span>Mode hors ligne : Affichage des données en cache</span>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center shadow-sm">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#1E265F]">Tableau de bord des assurances</h1>
            {isFiltering && (
              <p className="text-sm text-[#999AB6] mt-1">
                <span className="font-medium">Vue filtrée</span> • {selectedStatus !== 'Tous' ? `Statut: ${selectedStatus}` : ''}
                {dateFilter.startDate && ` • Période: ${formatDate(dateFilter.startDate)} - ${dateFilter.endDate ? formatDate(dateFilter.endDate) : 'présent'}`}
              </p>
            )}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex flex-col md:flex-row items-center gap-2 bg-white p-3 rounded-lg shadow-md w-full md:w-auto">
              <div className="flex items-center gap-1 w-full md:w-auto">
                <CalendarIcon className="h-4 w-4 text-[#999AB6]" />
                <input
                  type="date"
                  name="startDate"
                  value={dateFilter.startDate}
                  onChange={handleDateFilterChange}
                  className="border border-[#E5E7EB] rounded px-2 py-1 w-full md:w-36 focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] text-sm"
                  placeholder="Date de début"
                />
              </div>
              <span className="text-[#999AB6] hidden md:inline">à</span>
              <div className="flex items-center gap-1 w-full md:w-auto mt-2 md:mt-0">
                <CalendarIcon className="h-4 w-4 text-[#999AB6] md:hidden" />
                <input
                  type="date"
                  name="endDate"
                  value={dateFilter.endDate}
                  onChange={handleDateFilterChange}
                  className="border border-[#E5E7EB] rounded px-2 py-1 w-full md:w-36 focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] text-sm"
                  placeholder="Date de fin"
                />
              </div>
              <button
                onClick={resetFilters}
                className="bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded border border-[#E5E7EB] text-[#1E265F] text-sm transition-colors mt-2 md:mt-0 w-full md:w-auto flex items-center justify-center gap-1"
              >
                <FunnelIcon className="h-3 w-3" /> Réinitialiser
              </button>
            </div>
            <button
              onClick={loadDashboardData}
              className="p-3 bg-white rounded-lg shadow-md hover:bg-gray-50 text-[#1E265F] border border-[#E5E7EB] flex-shrink-0"
              title="Actualiser les données"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Clients Totaux"
            value={dashboardData?.totalClients}
            icon={<UsersIcon className="h-5 w-5 text-[#1E265F]" />}
      
          />
          <MetricCard
            title="Insurances Actives"
            value={dashboardData?.active}
            icon={<DocumentCheckIcon className="h-5 w-5 text-[#1E265F]" />}
        
          />
          <MetricCard
            title="Revenu Mensuel"
            value={formatCurrency(dashboardData?.monthlyRevenue)}
            icon={<CurrencyDollarIcon className="h-5 w-5 text-[#1E265F]" />}
            trend={revenueTrend.percentage > 0 ? `+${revenueTrend.percentage}%` : `-${revenueTrend.percentage}%`}
            trendUp={revenueTrend.isUp}
       
          />
          <MetricCard
            title="Paiements en Attente"
            value={formatCurrency(dashboardData.remainingPayments)}
            icon={<ClockIcon className="h-5 w-5 text-[#1E265F]" />}

          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatusBadge 
            title="Actif" 
            count={dashboardData?.active} 
            color="green" 
            onClick={() => setSelectedStatus('Actif')}
            isSelected={selectedStatus === 'Actif'}
          />
          <StatusBadge 
            title="Expiré" 
            count={dashboardData?.expired} 
            color="red" 
            onClick={() => setSelectedStatus('Expiré')}
            isSelected={selectedStatus === 'Expiré'}
          />
          <StatusBadge 
            title="Résilié" 
            count={dashboardData?.termination} 
            color="yellow" 
            onClick={() => setSelectedStatus('Résilié')}
            isSelected={selectedStatus === 'Résilié'}
          />
          <StatusBadge 
            title="Annulé" 
            count={dashboardData?.canceled} 
            color="gray" 
            onClick={() => setSelectedStatus('Annulé')}
            isSelected={selectedStatus === 'Annulé'}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-xl border border-gray-100">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-[#1E265F]">Aperçu des revenus</h2>
              <p className="text-sm text-[#999AB6]">Revenus mensuels {new Date().getFullYear()}</p>
            </div>
            <div className="p-6">
              <RevenueChart data={monthlyRevenueData} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-xl border border-gray-100">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-[#1E265F]">Comparaison mensuelle</h2>
              <p className="text-sm text-[#999AB6]">Analyse des tendances de revenus</p>
            </div>
            <div className="p-6">
              <RevenueTrendCard revenueTrend={revenueTrend} formatCurrency={formatCurrency} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <DataTable 
            title="Insurances Récentes"
            type="insurances"
            data={recentInsurances}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            columns={[
              { header: 'Numéro de police', accessor: 'policyNumber', link: true },
              { header: 'Client', accessor: 'clientName' },
              { header: 'Date de fin', accessor: 'endDate', formatter: formatDate },
              { header: 'Prime', accessor: 'primeTTC', formatter: formatCurrency },
              { header: 'Statut', accessor: 'status', badge: true }
            ]}
          />
          
          <DataTable
            title="Paiements Récents"
            type="payments"
            data={recentPayments}
            columns={[
              { header: 'Client', accessor: 'clientName' },
              { header: 'Montant', accessor: 'amount', formatter: formatCurrency },
              { header: 'Date', accessor: 'paymentDate', formatter: formatDate },
              { header: 'Méthode', accessor: 'paymentMethod', formatter: m => paymentMethodLabels[m] || m },
              { header: 'Référence', accessor: 'reference' }
            ]}
          />
        </div>

        <div className="flex items-center justify-center text-xs text-[#999AB6] mb-6">
          <ShieldCheckIcon className="h-4 w-4 text-[#1E265F] mr-1" />
          Vos données sont sécurisées et chiffrées
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, link, trend, trendUp }) => (
  <Link to={link} 
    className="bg-white p-5 rounded-lg shadow-xl hover:shadow-lg transition-shadow border border-gray-100">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-[#999AB6]">{title}</p>
        <p className="text-2xl font-semibold text-[#1E265F]">{value || 0}</p>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'} mt-1`}>
            {trendUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-[#F5F7FF] rounded-full border border-gray-100">{icon}</div>
    </div>
  </Link>
);

const StatusBadge = ({ title, count, color }) => (
  <Link 
    to={`/assurance-cases?status=${title.toLowerCase()}`}
    className={`p-4 rounded-lg shadow-md border transition-all cursor-pointer hover:bg-${color}-50`}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-[#999AB6]">Insurances</p>
        <p className="font-medium text-[#1E265F]">{title}</p>
      </div>
      <span className={`${statusColors[title]} px-3 py-1 rounded-full text-sm font-medium`}>
        {count || 0}
      </span>
    </div>
  </Link>
);

const RevenueTrendCard = ({ revenueTrend, formatCurrency }) => {
  if (!revenueTrend.currentMonthName) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[#999AB6]">
        <ClockIcon className="h-12 w-12 mb-3" />
        <p className="text-center">En attente des données de tendance...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center mb-4">
          {revenueTrend.isUp ? (
            <div className="p-4 bg-green-50 rounded-full">
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
          ) : (
            <div className="p-4 bg-red-50 rounded-full">
              <TrendingDown className="h-12 w-12 text-red-600" />
            </div>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-3xl font-bold text-[#1E265F]">{revenueTrend.percentage}%</p>
          <p className={`text-lg font-medium ${revenueTrend.isUp ? 'text-green-600' : 'text-red-600'}`}>
            {revenueTrend.isUp ? 'Augmentation' : 'Diminution'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-[#999AB6]">{revenueTrend.previousMonthName}</p>
            <p className="font-semibold text-[#1E265F]">{formatCurrency(revenueTrend.previousValue)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#999AB6]">{revenueTrend.currentMonthName}</p>
            <p className="font-semibold text-[#1E265F]">{formatCurrency(revenueTrend.currentValue)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DataTable = ({ title, type, data, columns, selectedStatus, onStatusChange }) => (
  <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
    <div className="p-5 border-b flex justify-between items-center">
      <h3 className="font-semibold text-[#1E265F]">{title}</h3>
      {type === 'insurances' && (
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-[#E5E7EB] rounded px-2 py-1 focus:outline-none focus:ring-[#1E265F] focus:border-[#1E265F] text-sm"
          >
            {['Tous', 'Actif', 'Expiré', 'Résilié', 'Annulé'].map(opt => (
              <option key={opt} value={opt === 'Tous' ? 'All' : opt}>
                {opt}
              </option>
            ))}
          </select>
          <Link to={`/${type}`} className="text-[#1E265F] hover:text-[#272F65] text-sm flex items-center">
            Voir tout
          </Link>
        </div>
      )}
      {type === 'payments' && (
        <Link to={`/${type}`} className="text-[#1E265F] hover:text-[#272F65] text-sm flex items-center">
          Voir tout
        </Link>
      )}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#F5F7FF]">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-3 text-left text-xs font-medium text-[#1E265F] uppercase border-b">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length > 0 ? data.map((item) => (
            <tr key={item.id} className="hover:bg-[#F9FAFC]">
              {columns.map((col) => (
                <td key={col.header} className="px-4 py-3 whitespace-nowrap text-sm">
                  {col.link ? (
                    <Link to={`/${type}/${item.id}`} className="text-[#1E265F] hover:text-blue-700 font-medium">
                      {item[col.accessor]}
                    </Link>
                  ) : col.badge ? (
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[item[col.accessor]]}`}>
                      {item[col.accessor]}
                    </span>
                  ) : (
                    col.formatter ? col.formatter(item[col.accessor]) : item[col.accessor]
                  )}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-[#999AB6]">
                Aucune donnée disponible
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const RevenueChart = ({ data }) => {
  const chartData = data.map(item => {
    const date = new Date(item.period);
    return {
      month: date.toLocaleDateString('fr-FR', { month: 'long' }),
      actual: item.actual,
      projected: item.projected
    };
  });

  const chartConfig = {
    actual: {
      label: "Revenu réel",
      color: "#1E265F",
    },
    projected: {
      label: "Revenu projeté",
      color: "#999AB6",
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          <p className="font-medium text-[#1E265F] mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}: {formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} stroke="#EAEAF2" strokeDasharray="4" />
          <XAxis 
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
            stroke="#999AB6"
          />
          <YAxis 
            tickFormatter={value => `${value} MAD`}
            stroke="#999AB6"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Legend 
            verticalAlign="top"
            align="right"
            iconSize={10}
            iconType="circle"
            wrapperStyle={{ paddingBottom: '10px' }}
          />
          <Bar 
            dataKey="actual" 
            name={chartConfig.actual.label}
            fill={chartConfig.actual.color} 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="projected" 
            name={chartConfig.projected.label}
            fill={chartConfig.projected.color} 
            radius={[4, 4, 0, 0]} 
            fillOpacity={0.6}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};