import { useState, useEffect } from 'react';
import { createPolicy } from '../../service/policyservice';
import { PolicyModalBase } from './PolicyModalBase';

export function NewPolicyModal({ isOpen, onClose, client, type, onPolicyCreated  }) {
  const [formData, setFormData] = useState({
    policyNumber:  type === 'AF' ? client?.policyNumber : 'Remplacement de police',
    insuranceType: type === 'AF' ? 'Affaire Nouvelle' : 'Remplacement de police',
    usage: '',
    comment: type === 'AF' ? 'New policy' : 'Policy replacement',
    primeHT: '',
    primeTTC: '',
    primeActuel: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  console.log(client)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Insurance type options
  const insuranceTypes = [
    'Affaire Nouvelle', 
    'Remplacement de police',
    'Auto',
    'Habitation',
    'Santé',
    'Vie'
  ];

  // Reset form when client changes
  useEffect(() => {
    if (client && isOpen) {
      setFormData(prev => ({
        ...prev,
        clientId: client._id,
        clientName: client.name,
        insuranceType: type === 'AF' ? 'Affaire Nouvelle' : 'Remplacement de police',
        comment: type === 'AF' ? 'New policy' : 'Policy replacement'
      }));
    }
  }, [client, isOpen, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Calculate TTC from HT with a 20% tax rate (adjust as needed)
  const calculateTTC = (ht) => {
    if (!ht || isNaN(parseFloat(ht))) return '';
    return (parseFloat(ht) * 1.2).toFixed(2);
  };

  // Handle HT change with automatic TTC calculation
  const handleHTChange = (e) => {
    const htValue = e.target.value;
    setFormData({
      ...formData,
      primeHT: htValue,
      primeTTC: calculateTTC(htValue)
    });
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.policyNumber.trim()) {
      setError('Policy number is required');
      return false;
    }
    if (!formData.usage.trim()) {
      setError('Usage is required');
      return false;
    }
    if (!formData.primeHT || isNaN(parseFloat(formData.primeHT))) {
      setError('Prime HT must be a valid number');
      return false;
    }
    if (!formData.primeTTC || isNaN(parseFloat(formData.primeTTC))) {
      setError('Prime TTC must be a valid number');
      return false;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Ensure numbers are properly parsed
      const dataToSubmit = {
        ...formData,
        primeHT: parseFloat(formData.primeHT),
        primeTTC: parseFloat(formData.primeTTC)
      };
      
      const newPolicy = await createPolicy(dataToSubmit);
      console.log('New policy created:', newPolicy);
      onPolicyCreated(newPolicy);
      onClose();
    } catch (err) {
      console.error('Policy creation error:', err);
      setError(err.message || 'Failed to create policy. Please check all fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PolicyModalBase 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`${type === 'AF' ? 'New Policy' : 'Policy Replacement'} for ${client?.name || ''}`}
    >
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
        <input type="hidden" name="policyType" value={type} />
          <div>
            <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700">
              Policy Number
            </label>
            <input
              type="text"
              name="policyNumber"
              id="policyNumber"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.policyNumber}
              onChange={handleChange}
            />
          </div>
          
          <div>
        <label htmlFor="insuranceType" className="block text-sm font-medium text-gray-700">
          Insurance Type
        </label>
        <select
          name="insuranceType"
          id="insuranceType"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={formData.insuranceType}
          onChange={handleChange}
          disabled={type === 'RP'} // Disable if replacement
        >
          {insuranceTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

          
          <div>
            <label htmlFor="usage" className="block text-sm font-medium text-gray-700">
              Usage
            </label>
            <input
              type="text"
              name="usage"
              id="usage"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.usage}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="primeHT" className="block text-sm font-medium text-gray-700">
              Prime HT
            </label>
            <input
              type="number"
              name="primeHT"
              id="primeHT"
              step="0.01"
              min="0"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.primeHT}
              onChange={handleHTChange}
            />
          </div>
          
          <div>
            <label htmlFor="primeTTC" className="block text-sm font-medium text-gray-700">
              Prime TTC
            </label>
            <input
              type="number"
              name="primeTTC"
              id="primeTTC"
              step="0.01"
              min="0"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.primeTTC}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="primeTTC" className="block text-sm font-medium text-gray-700">
              Prime Actule
            </label>
            <input
              type="number"
              name="primeActuel"
              id="primeActuel"
              step="0.01"
              min="0"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.primeActuel}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
              Comment
            </label>
            <textarea
              name="comment"
              id="comment"
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={formData.comment}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-[#1E265F] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2"
          disabled={loading}
        >
          {loading ? 'Processing...' : type === 'AF' ? 'Create Policy' : 'Replace Policy'}
        </button>
        </div>
      </form>
    </PolicyModalBase>
  );
}