import { axiosClient } from './axiosClient';

export const dashboardService = {
    getDashboardStats: async (filters = {}) => {
        try {
          const response = await axiosClient.get('/dashboard/stats', { 
            params: filters 
          });
          return response.data.data;
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message;
          console.error('Dashboard stats error:', errorMsg);
          throw new Error(errorMsg);
        }
      },
    
      getRecentInsurances: async (filters = {}) => {
        try {
          const response = await axiosClient.get('/dashboard/insurances', {
            params: {
              status: filters.status || 'All',
              limit: filters.limit || 5,
              startDate: filters.startDate,
              endDate: filters.endDate
            }
          });
          return response.data.data;
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message;
          console.error('Recent insurances error:', errorMsg);
          throw new Error(errorMsg);
        }
      },
    
  getRecentPayments: async (filters = {}) => {
    try {
      const response = await axiosClient.get('/dashboard/payments', {
        params: {
          limit: filters.limit || 5,
          startDate: filters.startDate,
          endDate: filters.endDate
        }
      });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('Recent payments error:', errorMsg);
      throw new Error(errorMsg);
    }
  },

  getMonthlyRevenue: async (filters = {}) => {
    try {
      const response = await axiosClient.get('/dashboard/revenue', {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate
        }
      });
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('Monthly revenue error:', errorMsg);
      throw new Error(errorMsg);
    }
  }
};