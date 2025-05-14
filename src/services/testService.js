// Test service for handling test API calls
import axiosInstance from '@/plugins/axios';

const API_PREFIX = '/api';

export const fetchAllTests = async () => {
  const response = await axiosInstance.get(`${API_PREFIX}/tests`);
  return response.data;
};

export const fetchTestById = async (testId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/tests/${testId}`);
  return response.data;
};

export const fetchTestsByClassId = async (classId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/tests/class/${classId}`);
  return response.data;
};

export const createTest = async (classId, testData) => {
  const response = await axiosInstance.post(`${API_PREFIX}/tests/class/${classId}`, testData);
  return response.data;
};

export const getClassTest = async (classId, testId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/tests/class/${classId}/test/${testId}`);
  return response.data;
};

export const updateTest = async (classId, testId, testData) => {
  const response = await axiosInstance.put(`${API_PREFIX}/tests/class/${classId}/test/${testId}`, testData);
  return response.data;
};

export const deleteTest = async (classId, testId) => {
  const response = await axiosInstance.delete(`${API_PREFIX}/tests/class/${classId}/test/${testId}`);
  return response.data;
};

export const submitTest = async (testId, internId, answers) => {
  console.log(`Service: Submitting test ${testId} for intern ${internId} with ${Object.keys(answers).length} answers`);
  try {
    const response = await axiosInstance.post(
      `${API_PREFIX}/tests/${testId}/submit?internId=${internId}`, 
      answers
    );
    console.log('Service: Test submission successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Service: Test submission failed:', error);
    if (error.response && error.response.status === 404) {
      console.error('Service: Test or intern not found');
    } else if (error.response && error.response.status === 400) {
      console.error('Service: Invalid test submission data');
    }
    throw error;
  }
};

export const fetchTestResults = async (testId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/tests/${testId}/results`);
  return response.data;
};

export const fetchTestResultByIntern = async (testId, internId) => {
  console.log(`Service: Fetching test result for test ${testId} and intern ${internId}`);
  try {
    const response = await axiosInstance.get(`${API_PREFIX}/tests/${testId}/results/${internId}`);
    console.log('Service: Test result fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Service: Error fetching test result:', error);
    // Don't log as error for 404 - it's expected when test not taken yet
    if (error.response && error.response.status === 404) {
      console.log('Service: No test result found (expected for new tests)');
    }
    throw error;
  }
}; 