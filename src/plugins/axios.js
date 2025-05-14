import axios from 'axios';

// Get the server URL from environment variables or use a default
const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8080';
console.log('API Server URL:', serverUrl);

const axiosInstance = axios.create({
  baseURL: serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log all outgoing requests
axiosInstance.interceptors.request.use(
  config => {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
      console.log('API Response:', response.data);
      return response;
  },
  (error) => {
    // Check if the error response has data
    console.error("API Error:", error); 
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data); // Forward the backend error details
    }
    return Promise.reject({ message: "An unexpected error occurred!" }); // Fallback error
  }
);

const token = localStorage.getItem('access_token');
if (token != null) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('Added authorization token to headers');
}

export default axiosInstance;
