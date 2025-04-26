import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient } from '../../service/clientService';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { NewPolicyModal } from '../AssuranceCase/NewPolicyModal';
import { ReplacePolicyModal } from '../AssuranceCase/ReplacePolicyModal';

export const ClientPolicy = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showNewPolicyModal, setShowNewPolicyModal] = useState(false);
  const [showReplacePolicyModal, setShowReplacePolicyModal] = useState(false);

  useEffect(() => {
    const fetchClientAndPolicies = async () => {
      try {
        setLoading(true);
        // Fetch client data
        const clientData = await getClient(id);
        setClient(clientData);
        
        // In a real app, you would also fetch all policies for this client
        // const policyData = await getPoliciesByClientId(id);
        // setPolicies(policyData);
        
        // For now, using empty array
        setPolicies([]);
        
      } catch (err) {
        setError('Failed to fetch client data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchClientAndPolicies();
    }
  }, [id]);

  const handlePolicyCreated = (newPolicy) => {
    setPolicies(prev => [newPolicy, ...prev]);
  };

  const handleNewPolicy = () => {
    setShowNewPolicyModal(true);
  };

  const handleReplacePolicy = () => {
    setShowReplacePolicyModal(true);
  };

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

  if (!client) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        Client not found
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/clients')}
          className="inline-flex items-center text-[#1E265F] hover:text-[#272F65] mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Clients
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{client.name}</h1>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <span className="mr-4">Card Number: {client.numCarte}</span>
              <span>Tel: {client.telephone}</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={handleNewPolicy}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1E265F] hover:bg-[#272F65]"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              New Policy
            </button>
            <button
              onClick={handleReplacePolicy}
              className="inline-flex items-center px-4 py-2 border border-[#1E265F] text-sm font-medium rounded-md text-[#1E265F] bg-white hover:bg-gray-50"
            >
              Replace Policy
            </button>
          </div>
        </div>
      </div>
      
      {/* Policy List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Policies</h3>
          <p className="mt-1 text-sm text-gray-500">
            List of all insurance policies for this client
          </p>
        </div>
        
        {policies.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            <p>No policies found for this client.</p>
            <button
              onClick={handleNewPolicy}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1E265F] hover:bg-[#272F65]"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Create First Policy
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {policies.map((policy) => (
              <li key={policy._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1E265F] truncate">
                      {policy.policyNumber}
                    </p>
                    <div className="mt-1 flex items-center">
                      <span className="text-sm text-gray-500 mr-4">
                        {policy.insuranceType}
                      </span>
                      <span className="text-sm text-gray-500">
                        Usage: {policy.usage}
                      </span>
                    </div>
                  </div>
                  <div className="ml-6 flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {policy.primeTTC} DH
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      From {new Date(policy.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {policy.comment && (
                  <div className="mt-2 text-sm text-gray-500 italic">
                    Note: {policy.comment}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Modals */}
      <NewPolicyModal
        isOpen={showNewPolicyModal}
        onClose={() => setShowNewPolicyModal(false)}
        client={client}
        onPolicyCreated={handlePolicyCreated}
      />
      
      <ReplacePolicyModal
        isOpen={showReplacePolicyModal}
        onClose={() => setShowReplacePolicyModal(false)}
        client={client}
        onPolicyCreated={handlePolicyCreated}
      />
    </div>
  );
};