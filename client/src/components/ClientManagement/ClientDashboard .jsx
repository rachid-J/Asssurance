import { useState, useEffect } from 'react';
import { getClients } from '../../service/clientService';
import { 
  UsersIcon, 
  PhoneIcon, 
  DocumentTextIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export const ClientDashboard = () => {
  const [clientStats, setClientStats] = useState({
    totalClients: 0,
    newClientsThisMonth: 0,
    mostCommonPrefix: '',
    averageClientsPerMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentClients, setRecentClients] = useState([]);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        const clients = await getClients();
        
        // Recent clients (last 5)
        const sortedClients = [...clients].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentClients(sortedClients.slice(0, 5));
        
        // Calculate statistics
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // New clients this month
        const newClientsCount = clients.filter(client => 
          new Date(client.createdAt) >= firstDayOfMonth
        ).length;
        
        // Calculate most common card prefix (first 2 chars after JE)
        const prefixes = {};
        clients.forEach(client => {
          if (client.numCarte && client.numCarte.length >= 4) {
            const prefix = client.numCarte.substring(2, 4);
            prefixes[prefix] = (prefixes[prefix] || 0) + 1;
          }
        });
        
        let mostCommonPrefix = '';
        let maxCount = 0;
        
        Object.entries(prefixes).forEach(([prefix, count]) => {
          if (count > maxCount) {
            mostCommonPrefix = prefix;
            maxCount = count;
          }
        });
        
        // Average clients per month (since first client)
        let firstClientDate = new Date();
        if (clients.length > 0) {
          firstClientDate = new Date(
            Math.min(...clients.map(client => new Date(client.createdAt).getTime()))
          );
        }
        
        const monthsDiff = (today.getFullYear() - firstClientDate.getFullYear()) * 12 + 
                          (today.getMonth() - firstClientDate.getMonth());
        
        const avgClientsPerMonth = monthsDiff > 0 
          ? (clients.length / monthsDiff).toFixed(1) 
          : clients.length;
        
        setClientStats({
          totalClients: clients.length,
          newClientsThisMonth: newClientsCount,
          mostCommonPrefix,
          averageClientsPerMonth: avgClientsPerMonth
        });
        
      } catch (err) {
        setError('Failed to fetch client data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E265F]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Client Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-[#1E265F] rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {clientStats.totalClients}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <ArrowTrendingUpIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">New This Month</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {clientStats.newClientsThisMonth}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <DocumentTextIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Common Card Prefix</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {clientStats.mostCommonPrefix ? `JE${clientStats.mostCommonPrefix}...` : 'N/A'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <PhoneIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Clients/Month</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {clientStats.averageClientsPerMonth}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Clients */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recently Added Clients</h3>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Client Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Telephone
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Card Number
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Added On
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentClients.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-sm text-gray-500">
                    No clients found
                  </td>
                </tr>
              ) : (
                recentClients.map((client) => (
                  <tr key={client._id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      {client.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {client.telephone}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {client.numCarte}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};