// client/src/service/clientService.js
import { axiosClient } from './axiosClient';

/**
 * Get all clients with optional search parameters
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.search - Search term for client name
 * @param {number} searchParams.page - Page number for pagination
 * @param {number} searchParams.limit - Number of items per page
 * @returns {Promise<Array>} - Array of client objects
 */
export const getClients = async (searchParams = {}) => {
  const response = await axiosClient.get('/clients', { params: searchParams });
  return response.data;
};

/**
 * Get a single client by ID
 * @param {string} id - Client ID
 * @returns {Promise<Object>} - Client object
 */
export const getClient = async (id) => {
  const response = await axiosClient.get(`/clients/${id}`);
  return response.data;
};

/**
 * Create a new client
 * @param {Object} clientData - Client data object
 * @param {string} clientData.name - Client name
 * @param {string} clientData.telephone - Client telephone number
 * @param {string} clientData.numCarte - Client card number
 * @returns {Promise<Object>} - Created client object
 */
export const createClient = async (clientData) => {
  const response = await axiosClient.post('/clients', clientData);
  return response.data;
};

/**
 * Update an existing client
 * @param {string} id - Client ID
 * @param {Object} clientData - Client data to update
 * @returns {Promise<Object>} - Updated client object
 */
export const updateClient = async (id, clientData) => {
  const response = await axiosClient.put(`/clients/${id}`, clientData);
  return response.data;
};

/**
 * Delete a client
 * @param {string} id - Client ID
 * @returns {Promise<Object>} - Response object
 */
export const deleteClient = async (id) => {
  const response = await axiosClient.delete(`/clients/${id}`);
  return response.data;
};