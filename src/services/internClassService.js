// Intern class service for handling class API calls for interns
import axiosInstance from '@/plugins/axios';

const API_PREFIX = '/interns';

export const fetchInternClasses = async (internId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/${internId}/classes`);
  return response.data;
};

export const fetchAvailableClasses = async (internId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/${internId}/available-classes`);
  return response.data;
};

export const registerForClass = async (internId, classId) => {
  const response = await axiosInstance.post(`${API_PREFIX}/${internId}/register-class/${classId}`);
  return response.data;
};

export const unregisterFromClass = async (internId, classId) => {
  const response = await axiosInstance.delete(`${API_PREFIX}/${internId}/unregister-class/${classId}`);
  return response.data;
};

export const fetchInternTests = async (internId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/${internId}/tests`);
  return response.data;
};

export const fetchInternTestStatistics = async (internId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/${internId}/test-statistics`);
  return response.data;
}; 