// PaymentService.js

import { axiosClient } from "./axiosClient";




/**
 * Service class for handling payment-related API requests
 */
export class PaymentService {
  /**
   * Get all payments with optional filtering
   * @param {Object} filters - Optional filter parameters
   * @returns {Promise} - Promise resolving to payments array
   */
  async getAllPayments(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params if they exist
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await axiosClient.get(`/payments${query}`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw this._handleError(error);
    }
  }
  
  /**
   * Get a single payment by ID
   * @param {string} paymentId - The ID of the payment to fetch
   * @returns {Promise} - Promise resolving to payment object
   */
  async getPaymentById(paymentId) {
    try {
      const response = await axiosClient.get(`/payments/${paymentId}`);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment with ID ${paymentId}:`, error);
      throw this._handleError(error);
    }
  }
  
  /**
   * Get all payments for a specific insurance policy
   * @param {string} insuranceId - The ID of the insurance policy
   * @returns {Promise} - Promise resolving to payments array
   */
  async getInsurancePayments(insuranceId) {
    try {
      const response = await axiosClient.get(`/insurances/${insuranceId}/payments`);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching payments for insurance ${insuranceId}:`, error);
      throw this._handleError(error);
    }
  }
  
  /**
   * Create a new payment
   * @param {Object} paymentData - Payment data object
   * @returns {Promise} - Promise resolving to created payment
   */
  async createPayment(paymentData) {
    try {
      const response = await axiosClient.post(`/payments`, paymentData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw this._handleError(error);
    }
  }
  
  /**
   * Update an existing payment
   * @param {string} paymentId - The ID of the payment to update
   * @param {Object} paymentData - Updated payment data
   * @returns {Promise} - Promise resolving to updated payment
   */
  async updatePayment(paymentId, paymentData) {
    try {
      const response = await axiosClient.put(`/payments/${paymentId}`, paymentData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error updating payment ${paymentId}:`, error);
      throw this._handleError(error);
    }
  }
  
  /**
   * Delete a payment
   * @param {string} paymentId - The ID of the payment to delete
   * @returns {Promise} - Promise resolving to delete confirmation
   */
  async deletePayment(paymentId) {
    try {
      const response = await axiosClient.delete(`/payments/${paymentId}`);
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting payment ${paymentId}:`, error);
      throw this._handleError(error);
    }
  }
  
  /**
   * Create multiple payments in bulk
   * @param {Array} paymentsArray - Array of payment objects
   * @returns {Promise} - Promise resolving to array of created payments
   */
  async bulkCreatePayments(paymentsArray) {
    try {
      const response = await axiosClient.post(`/payments/bulk`, paymentsArray, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating bulk payments:', error);
      throw this._handleError(error);
    }
  }
  
  /**
   * Get payment statistics
   * @param {Object} filters - Optional filter parameters for statistics
   * @returns {Promise} - Promise resolving to payment statistics
   */
  async getPaymentStatistics(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params if they exist
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await axiosClient.get(`/payments/stats${query}`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching payment statistics:', error);
      throw this._handleError(error);
    }
  }
  
  /**
   * Get advanced payment report with filters and grouping
   * @param {Object} params - Report parameters including filters and grouping options
   * @returns {Promise} - Promise resolving to payment report data
   */
  async getPaymentReport(params = {}) {
    try {
      const response = await axiosClient.post(`/payments/report`, params, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating payment report:', error);
      throw this._handleError(error);
    }
  }
  
  /**
   * Export payments to CSV or PDF
   * @param {string} format - Export format ('csv' or 'pdf')
   * @param {Object} filters - Filters to apply before export
   * @returns {Promise} - Promise resolving to blob data for download
   */
  async exportPayments(format = 'csv', filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const response = await axiosClient.get(`/payments/export?${queryParams.toString()}`, {
        withCredentials: true,
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error exporting payments as ${format}:`, error);
      throw this._handleError(error);
    }
  }
  
  /**
   * Search for payments using various criteria
   * @param {string} searchTerm - Search term to look for in references or linked entities
   * @returns {Promise} - Promise resolving to matching payments
   */
  async searchPayments(searchTerm) {
    try {
      const response = await axiosClient.get(`/payments/search?term=${encodeURIComponent(searchTerm)}`);
      
      return response.data;
    } catch (error) {
      console.error('Error searching payments:', error);
      throw this._handleError(error);
    }
  }
  
  /**
   * Get payment methods statistics
   * @returns {Promise} - Promise resolving to payment methods statistics
   */
  async getPaymentMethodStats() {
    try {
      const response = await axiosClient.get(`/payments/method-stats`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching payment method statistics:', error);
      throw this._handleError(error);
    }
  }
  
  /**
   * Process error responses
   * @param {Error} error - Error object from axios
   * @returns {Error} - Processed error with appropriate message
   * @private
   */
  _handleError(error) {
    if (error.response) {
      // Server responded with an error status code
      const message = error.response.data?.message || 'Server error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('No response received from server. Please check your connection.');
    } else {
      // Error in setting up the request
      return error;
    }
  }
}

// Export as singleton instance
export const paymentService = new PaymentService();

// Export the class for testing or custom instantiation
export default PaymentService;