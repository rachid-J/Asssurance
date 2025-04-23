import axios from 'axios';


// Create request queue for offline mode
const requestQueue = [];

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // Add timeout to detect server unavailability
});

// Request interceptor to handle offline state
axiosClient.interceptors.request.use(
  config => {
    // Check if browser is offline before making request
    if (!navigator.onLine) {
      const error = new Error('You are currently offline');
      error.config = config;
      error.isOffline = true;
      
      // For GET requests, try to serve cached data
      if (config.method === 'get') {
        const cachedData = localStorage.getItem(`cache_${config.url}`);
        if (cachedData) {
          error.cachedData = JSON.parse(cachedData);
        }
      } else {
        // Queue non-GET requests to retry when online
        requestQueue.push(config);
      }
      
      return Promise.reject(error);
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    // Cache successful GET responses for offline use
    if (response.config.method === 'get') {
      try {
        localStorage.setItem(`cache_${response.config.url}`, JSON.stringify(response.data));
      } catch (e) {
        console.warn('Failed to cache response:', e);
      }
    }
    return response;
  },
  (error) => {
    // Handle 401 unauthorized as before
    if (error.response && error.response.status === 401) {
      // Maybe dispatch logout or redirect
    }
    
    // Return cached data for offline GET requests
    if (error.isOffline && error.cachedData) {
      return Promise.resolve({
        data: error.cachedData,
        status: 200,
        statusText: 'OK (Cached)',
        headers: {},
        config: error.config,
        fromCache: true
      });
    }
    
    // Handle timeout and network errors
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Server unreachable or timeout');
      // You could dispatch an action here to update UI
    }
    
    return Promise.reject(error);
  }
);

// Function to retry queued requests when back online
export const retryQueuedRequests = () => {
  const requestsToRetry = [...requestQueue];
  requestQueue.length = 0; // Clear the queue
  
  requestsToRetry.forEach(config => {
    axiosClient(config).catch(() => {
      // If the request fails again, requeue it
      requestQueue.push(config);
    });
  });
};

// Set up event listener to retry requests when connection is restored
if (typeof window !== 'undefined') {
  window.addEventListener('online', retryQueuedRequests);
}