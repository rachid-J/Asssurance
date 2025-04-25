import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createClient } from '../../service/clientService'; // Adjust the import path as necessary

export const ClientModalCreate = ({ isOpen, onClose, onClientCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    telephone: '',
    numCarte: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', telephone: '', numCarte: '' });
      setErrors({});
    }
  }, [isOpen]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'telephone':
        return /^0[5-7]\d{8}$/.test(value) ? '' : 'Invalid Moroccan number (e.g., 0612345678)';
      case 'numCarte':
        return /^JE\d{7}$/.test(value) ? '' : 'Must be JE followed by 7 digits';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = Object.entries(formData).reduce((acc, [name, value]) => {
      const error = validateField(name, value);
      return error ? { ...acc, [name]: error } : acc;
    }, {});

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const newClient = await createClient(formData);
      onClientCreated(newClient);
      onClose();
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to create client' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Client</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 focus:ring-[#1E265F] focus:border-[#1E265F]`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telephone
              </label>
              <input
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="0612345678"
                className={`w-full rounded-md border ${
                  errors.telephone ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 focus:ring-[#1E265F] focus:border-[#1E265F]`}
              />
              {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                name="numCarte"
                value={formData.numCarte}
                onChange={handleChange}
                placeholder="JE1234567"
                className={`w-full rounded-md border ${
                  errors.numCarte ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 focus:ring-[#1E265F] focus:border-[#1E265F]`}
              />
              {errors.numCarte && <p className="text-red-500 text-sm mt-1">{errors.numCarte}</p>}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1E265F] hover:bg-[#272F65] rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};