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
  const response = await axiosInstance.post(
    `${API_PREFIX}/tests/${testId}/submit?internId=${internId}`, 
    answers
  );
  return response.data;
};

export const fetchTestResults = async (testId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/tests/${testId}/results`);
  return response.data;
};

export const fetchTestResultByIntern = async (testId, internId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/tests/${testId}/results/${internId}`);
  return response.data;
}; 