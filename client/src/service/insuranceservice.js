// client/src/service/insuranceservice.js
import { axiosClient } from './axiosClient';

/**
 * Insurance Management API Functions
 */

// Get all insurances with optional search parameters
export const getInsurances = async (searchParams = {}) => {
  try {
    // searchParams can now include createdby: userId
    const response = await axiosClient.get('/insurances', { params: searchParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching insurances:', error);
    throw error;
  }
};

// Get single insurance by ID
export const getInsuranceById = async (insuranceId) => {
  if (!insuranceId) {
    throw new Error('Insurance ID is required');
  }

  try {
    const response = await axiosClient.get(`/insurances/${insuranceId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching insurance details:', error);
    throw error;
  }
};

// Create a new insurance policy
export const createInsurance = async (insuranceData) => {
  try {
    const response = await axiosClient.post('/insurances', insuranceData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
};

// Update an existing insurance policy
export const updateInsurance = async (id, insuranceData) => {
  try {
    const response = await axiosClient.put(`/insurances/${id}`, insuranceData);
    return response.data;
  } catch (error) {
    console.error(`Error updating insurance ${id}:`, error);
    throw error;
  }
};

// Delete an insurance policy
export const deleteInsurance = async (id) => {
  try {
    const response = await axiosClient.delete(`/insurances/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting insurance ${id}:`, error);
    throw error;
  }
};

// Get insurance statistics and totals
export const getInsuranceTotals = async (searchParams = {}) => {
  try {
    const response = await axiosClient.get('/insurances/totals', { params: searchParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching insurance totals:', error);
    throw error;
  }
};

// Get insurance statistics by status
export const getInsuranceStats = async () => {
  try {
    const response = await axiosClient.get('/insurances/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching insurance statistics:', error);
    throw error;
  }
};

/**
 * Insurance Payment Management API Functions
 */

// Get payments for a specific insurance policy
export const getInsurancePayments = async (insuranceId) => {
  try {
    const response = await axiosClient.get(`/payments/${insuranceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payments for insurance ${insuranceId}:`, error);
    throw error;
  }
};

// Create a new payment for an insurance policy
export const createPayment = async (insuranceId, paymentData) => {
  try {
    const response = await axiosClient.post(
      `/payments/${insuranceId}`,
      paymentData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create payment');
  }
};

// Update an existing payment
export const updatePayment = async (paymentId, paymentData) => {
  try {
    const response = await axiosClient.put(`/payments/${paymentId}`, paymentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Payment update failed');
  }
};

// Mark all payments as complete for an insurance policy
export const completeAllPayments = async (insuranceId, paymentData) => {
  try {
    const response = await axiosClient.post(
      `/insurances/${insuranceId}/payments/complete`,
      paymentData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Full payment failed');
  }
};

/**
 * Insurance Documents Management API Functions
 */

// Get all documents for a specific insurance policy
export const getInsuranceDocuments = async (insuranceId) => {
  try {
    const response = await axiosClient.get(`documents/${insuranceId}/insurances`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching documents for insurance ${insuranceId}:`, error);
    throw error;
  }
};

// Upload a new document for an insurance policy
export const uploadInsuranceDocument = async (insuranceId, documentFile, metadata = {}) => {
  try {
    const formData = new FormData();
    formData.append('document', documentFile);
    
    // Add any metadata
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const response = await axiosClient.post(
      `/documents/${insuranceId}/insurances`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error uploading document for insurance ${insuranceId}:`, error);
    throw new Error(error.response?.data?.message || 'Document upload failed');
  }
};

// Delete a document
export const deleteInsuranceDocument = async (documentId) => {
  try {
    const response = await axiosClient.delete(`/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting document ${documentId}:`, error);
    throw error;
  }
};

// Download a document
export const downloadInsuranceDocument = async (documentId) => {
  try {
    const response = await axiosClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error downloading document ${documentId}:`, error);
    throw error;
  }
};

// Update document metadata
export const updateDocumentMetadata = async (documentId, metadata) => {
  try {
    const response = await axiosClient.put(`/documents/${documentId}`, metadata);
    return response.data;
  } catch (error) {
    console.error(`Error updating document metadata ${documentId}:`, error);
    throw error;
  }
};

/**
 * Insurance Status Management
 */

// Renew an insurance policy
export const renewInsurance = async (insuranceId) => {
  try {
    const response = await axiosClient.put(`/insurances/${insuranceId}/renew`);
    return response.data;
  } catch (error) {
    console.error(`Error renewing insurance ${insuranceId}:`, error);
    throw error;
  }
};

// Cancel an insurance policy
export const cancelInsurance = async (insuranceId) => {
  try {
    const response = await axiosClient.put(`/insurances/${insuranceId}/cancel`);
    return response.data;
  } catch (error) {
    console.error(`Error canceling insurance ${insuranceId}:`, error);
    throw error;
  }
};

export const changeInsuranceTypeToResel = async (insuranceId) => {
  try {
    const response = await axiosClient.put(`/insurances/${insuranceId}/type-resel`);
    return response.data;
  } catch (error) {
    console.error(`Error changing insurance type ${insuranceId}:`, error);
    throw error;
  }
};