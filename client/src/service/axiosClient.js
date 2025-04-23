import axios from 'axios';



export const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // 👈 Important for cookie-based auth
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  axiosClient.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        // Maybe dispatch logout or redirect
    
      }
      return Promise.reject(error);
    }
  );