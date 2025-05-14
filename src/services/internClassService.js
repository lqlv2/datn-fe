// Intern class service for handling class API calls for interns
import axiosInstance from '@/plugins/axios';

const API_PREFIX = '/interns';

export const fetchInternClasses = async (internId) => {
  console.log(`Service: Making API request to ${API_PREFIX}/${internId}/classes`);
  try {
    const response = await axiosInstance.get(`${API_PREFIX}/${internId}/classes`);
    console.log('Service: Received response for intern classes:', response.data);
    return response.data;
  } catch (error) {
    console.error('Service: Error fetching intern classes:', error);
    throw error;
  }
};

export const fetchAvailableClasses = async (internId) => {
  console.log(`Service: Making API request to ${API_PREFIX}/${internId}/available-classes`);
  try {
    const response = await axiosInstance.get(`${API_PREFIX}/${internId}/available-classes`);
    console.log('Service: Received response for available classes:', response.data);
    return response.data;
  } catch (error) {
    console.error('Service: Error fetching available classes:', error);
    throw error;
  }
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

// New schedule-related endpoints
export const fetchInternSchedule = async (internId, startDate, endDate) => {
  const response = await axiosInstance.get(
    `${API_PREFIX}/${internId}/schedule?startDate=${startDate}&endDate=${endDate}`
  );
  return response.data;
};

export const fetchInternCalendarEvents = async (internId, startDate, endDate) => {
  console.log(`Service: Making API request to ${API_PREFIX}/${internId}/calendar-events?startDate=${startDate}&endDate=${endDate}`);
  try {
    const response = await axiosInstance.get(
      `${API_PREFIX}/${internId}/calendar-events?startDate=${startDate}&endDate=${endDate}`
    );
    console.log('Service: Received response for calendar events:', response.data);
    return response.data;
  } catch (error) {
    console.error('Service: Error fetching calendar events:', error);
    throw error;
  }
}; 