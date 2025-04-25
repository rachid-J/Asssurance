
import { useState, useEffect } from 'react';
import { createPolicy } from '../../service/policyservice';
import { PolicyModalBase } from './PolicyModalBase';


export function ReplacePolicyModal({ isOpen, onClose, client, onPolicyCreated }) {
    const [formData, setFormData] = useState({
      policyNumber: '',
      insuranceType: 'Remplacement de police',
      usage: '',
      comment: 'Policy replacement',
      primeHT: '',
      primeTTC: '',
      startDate: new Date().toISOString().split('T')[0]
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
  
    // Reset form when client changes
    useEffect(() => {
      if (client && isOpen) {
        setFormData({
          ...formData,
          clientId: client._id,
          clientName: client.name
        });
      }
    }, [client, isOpen]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
  
      try {
        const newPolicy = await createPolicy({
          ...formData,
          primeHT: parseFloat(formData.primeHT),
          primeTTC: parseFloat(formData.primeTTC),
          isReplacement: true
        });
        
        onPolicyCreated(newPolicy);
        onClose();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create replacement policy');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <PolicyModalBase 
        isOpen={isOpen} 
        onClose={onClose} 
        title={`Replace Policy for ${client?.name || ''}`}
      >
        {error && (
          <div className="mb-4 text-sm text-red-600">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700">
                New Policy Number
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
              <input
        type="text"
        name="insuranceType"
        id="insuranceType"
        readOnly
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        value={formData.insuranceType}
      />
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
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.primeHT}
                onChange={handleChange}
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
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.primeTTC}
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
              {loading ? 'Creating...' : 'Replace Policy'}
            </button>
          </div>
        </form>
      </PolicyModalBase>
    );
  }