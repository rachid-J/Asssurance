// client/src/service/policyservice.js
import { axiosClient } from './axiosClient';

// Policy management
export const getPolicies = async (searchParams = {}) => {
  try {
    const response = await axiosClient.get('/policies', { params: searchParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching policies:', error);
    throw error;
  }
};

export const createPolicy = async (policyData) => {
  try {
    // Ensure numeric values are properly parsed
    const formattedData = {
      ...policyData,
      primeHT: parseFloat(policyData.primeHT),
      primeTTC: parseFloat(policyData.primeTTC)
    };
    
    const response = await axiosClient.post('/policies', formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating policy:', error);
    // Re-throw with more consistent error structure
    if (error.response && error.response.data) {
      throw { ...error, message: error.response.data.message || 'Failed to create policy' };
    }
    throw error;
  }
};

export const updatePolicy = async (id, policyData) => {
  try {
    const response = await axiosClient.put(`/policies/${id}`, policyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating policy ${id}:`, error);
    throw error;
  }
};

export const deletePolicy = async (id) => {
  try {
    const response = await axiosClient.delete(`/policies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting policy ${id}:`, error);
    throw error;
  }
};

export const getPolicyTotals = async (searchParams = {}) => {
  try {
    const response = await axiosClient.get('/policies/totals', { params: searchParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching policy totals:', error);
    throw error;
  }
};

// Payment management
export const getPolicyPayments = async (policyId) => {
  try {
    const response = await axiosClient.get(`/policies/${policyId}/payments`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payments for policy ${policyId}:`, error);
    throw error;
  }
};

export const updatePayment = async (policyId, advanceNumber, paymentData) => {
  try {
    const response = await axiosClient.put(
      `/policies/${policyId}/payments/${advanceNumber}`, 
      paymentData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating payment ${advanceNumber} for policy ${policyId}:`, error);
    throw error;
  }
};

export const completeAllPayments = async (policyId, paymentData) => {
    try {
      // Convert payment date to ISO format
      const formattedData = {
        ...paymentData,
        paymentDate: new Date(paymentData.paymentDate).toISOString()
      };
  
      const response = await axiosClient.post(
        `/policies/${policyId}/payments/complete`,
        formattedData
      );
      return response.data;
    } catch (error) {
      console.error(`Error completing payments for policy ${policyId}:`, error);
      throw error;
    }
  };