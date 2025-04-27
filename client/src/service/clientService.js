// src/service/clientService.js

import { axiosClient } from "./axiosClient";




// Get all clients with filters
// src/service/clientService.js - Updated getClients function

export const getClients = async (filters) => {
    try {
      // Convert boolean string values to actual booleans if needed
      const processedFilters = { ...filters };
      
      // Handle isDriver filter conversion from string to boolean
      if (processedFilters.isDriver === 'true') processedFilters.isDriver = true;
      if (processedFilters.isDriver === 'false') processedFilters.isDriver = false;
      
      // Remove empty filters to avoid sending unnecessary parameters
      Object.keys(processedFilters).forEach(key => {
        if (processedFilters[key] === '') {
          delete processedFilters[key];
        }
      });
      
      const response = await axiosClient.get(`/clients`, { 
        params: processedFilters,
        withCredentials: true 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  };

// Get single client by ID with associated vehicles
export const getClient = async (clientId) => {
  try {
    const response = await axiosClient.get(`/clients/${clientId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching client details:', error);
    throw error;
  }
};

// Create new client
export const createClient = async (clientData) => {
  try {
    const response = await axiosClient.post(`/clients`, clientData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

// Update existing client
export const updateClient = async (clientId, clientData) => {
  try {
    const response = await axiosClient.put(`clients/${clientId}`, clientData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

// Delete client
export const deleteClient = async (clientId) => {
  try {
    const response = await axiosClient.delete(`/clients/${clientId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

// Get client statistics
export const getClientStats = async () => {
  try {
    const response = await axiosClient.get(`/clients/stats`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching client statistics:', error);
    throw error;
  }
};