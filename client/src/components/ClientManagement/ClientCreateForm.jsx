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
    
    // Clear error for this field when it changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
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
    
    // Validate email format if provided
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Validate phone number format
    if (formData.telephone && !/^\d{8,15}$/.test(formData.telephone.replace(/[\s-+()]/g, ''))) {
      newErrors.telephone = 'Invalid phone number format';
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

  // Custom input class with increased height
  const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm py-3";
  const inputErrorClass = "mt-1 block w-full rounded-md border-red-500 ring-1 ring-red-500 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm py-3";

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Go back to clients list"
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
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            <p className="font-medium">Error</p>
            <p>{errors.submit}</p>
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
                Title <span className="text-red-500">*</span>
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm py-3"
              >
                <option value="Mr">Mr</option>
                <option value="Mme">Mme</option>
              </select>
            </div>
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className={errors.firstName ? inputErrorClass : inputClass}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={errors.name ? inputErrorClass : inputClass}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            {/* ID Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Type <span className="text-red-500">*</span>
              </label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm py-3"
              >
                <option value="CIN">CIN</option>
                <option value="Passport">Passport</option>
                <option value="Carte de séjour">Carte de séjour</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                required
                className={errors.idNumber ? inputErrorClass : inputClass}
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
                value={formData.numCarte || ''}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
                className={errors.dateOfBirth ? inputErrorClass : inputClass}
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
              )}
            </div>
            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm py-3"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1E265F] focus:ring-[#1E265F] sm:text-sm py-3"
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
                className={inputClass}
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
                className={inputClass}
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
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="e.g. +212 612345678"
                required
                className={errors.telephone ? inputErrorClass : inputClass}
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
                placeholder="example@domain.com"
                className={errors.email ? inputErrorClass : inputClass}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className={errors.address ? inputErrorClass : inputClass}
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
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className={errors.city ? inputErrorClass : inputClass}
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
              id="isDriver"
              type="checkbox"
              name="isDriver"
              checked={formData.isDriver}
              onChange={handleInputChange}
              className="h-4 w-4 text-[#1E265F] focus:ring-[#1E265F] rounded"
            />
            <label htmlFor="isDriver" className="ml-2 text-sm text-gray-700">
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
                  placeholder="e.g. B, C, D"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className={errors.licenseNumber ? inputErrorClass : inputClass}
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
                  placeholder="e.g. Morocco"
                  className={inputClass}
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
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </div>
        {/* Required Fields Note */}
        <div className="mt-2 text-sm text-gray-500">
          <span className="text-red-500">*</span> Required fields
        </div>
        {/* Form Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-3 bg-[#1E265F] text-white rounded-md shadow-sm text-sm font-medium hover:bg-[#272F65] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E265F] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 mr-1" />
                Create Client
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};