import axios from 'axios';

const baseURL = import.meta.env.VITE_SERVER_URL;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error response has data
    console.log("Axios Error:", error); // This will show you the full error structure
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data); // Forward the backend error details
    }
    return Promise.reject({ message: "An unexpected error occurred!" }); // Fallback error
  }
);

const token = localStorage.getItem('access_token');
if (token != null) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default axiosInstance;
