import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  CalendarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { createClient } from '../../service/clientService';

export const ClientCreateForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    name: '',
    clientType: 'Particulier',
    idType: 'CIN',
    idNumber: '',
    dateOfBirth: '',
    gender: 'Masculin',
    maritalStatus: 'Célibataire',
    numberOfChildren: 0,
    profession: '',
    telephone: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
    isDriver: true,
    licenseCategory: '',
    licenseNumber: '',
    licenseCountry: '',
    licenseIssueDate: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.telephone) newErrors.telephone = 'Phone number is required';
    if (!formData.idNumber) newErrors.idNumber = 'ID number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (formData.isDriver && !formData.licenseNumber) {
      newErrors.licenseNumber = 'License number is required for drivers';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const newClient = await createClient(formData);
      navigate(`/clients/${newClient._id}`);
    } catch (error) {
      console.error('Client creation failed:', error);
      setErrors({ submit: error.message || 'Failed to create client' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Client</h1>
          <div /> {/* Spacer */}
        </div>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}
        {/* Personal Information Section */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-[#1E265F]" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Type */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['Particulier', 'Professionnel', 'Entreprise'].map(type => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="clientType"
                      value={type}
                      checked={formData.clientType === type}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#1E265F] focus:ring-[#1E265F]"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
              >
                <option value="Mr">Mr</option>
                <option value="Mme">Mme</option>
              </select>
            </div>
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm ${
                  errors.firstName ? 'border-red-500' : ''
                }`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            {/* ID Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Type
              </label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
              >
                <option value="CIN">CIN</option>
                <option value="Passport">Passport</option>
                <option value="Carte de séjour">Carte de séjour</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Number *
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                required
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm ${
                  errors.idNumber ? 'border-red-500' : ''
                }`}
              />
              {errors.idNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>
              )}
            </div>
            {/* Carte Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carte Number
              </label>
              <input
                type="text"
                name="numCarte"
                value={formData.numCarte}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
              />
            </div>
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm ${
                  errors.dateOfBirth ? 'border-red-500' : ''
                }`}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
              )}
            </div>
            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
              >
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
              </select>
            </div>
            {/* Marital Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
              >
                <option value="Célibataire">Célibataire</option>
                <option value="Marié">Marié</option>
                <option value="Divorcé">Divorcé</option>
                <option value="Veuf">Veuf</option>
              </select>
            </div>
            {/* Number of Children */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Children
              </label>
              <input
                type="number"
                name="numberOfChildren"
                value={formData.numberOfChildren}
                onChange={handleInputChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
              />
            </div>
            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profession
              </label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
              />
            </div>
          </div>
        </div>
        {/* Contact Information Section */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <PhoneIcon className="h-5 w-5 mr-2 text-[#1E265F]" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                required
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm ${
                  errors.telephone ? 'border-red-500' : ''
                }`}
              />
              {errors.telephone && (
                <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm ${
                  errors.address ? 'border-red-500' : ''
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm ${
                  errors.city ? 'border-red-500' : ''
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>
          </div>
        </div>
        {/* Driver Information Section */}
        <div className="pb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <IdentificationIcon className="h-5 w-5 mr-2 text-[#1E265F]" />
            Driver Information
          </h2>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="isDriver"
              checked={formData.isDriver}
              onChange={handleInputChange}
              className="h-4 w-4 text-[#1E265F] focus:ring-[#1E265F] rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              This client is a driver
            </label>
          </div>
          {formData.isDriver && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Category
                </label>
                <input
                  type="text"
                  name="licenseCategory"
                  value={formData.licenseCategory}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm ${
                    errors.licenseNumber ? 'border-red-500' : ''
                  }`}
                />
                {errors.licenseNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuing Country
                </label>
                <input
                  type="text"
                  name="licenseCountry"
                  value={formData.licenseCountry}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Issue Date
                </label>
                <input
                  type="date"
                  name="licenseIssueDate"
                  value={formData.licenseIssueDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm"
                />
              </div>
            </div>
          )}
        </div>
        {/* Form Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#1E265F] text-white rounded-md shadow-sm text-sm font-medium hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </form>
    </div>
  );
};