// Test Question service for handling test question API calls
import axiosInstance from '@/plugins/axios';

const API_PREFIX = '/api';

export const fetchAllTestQuestions = async () => {
  const response = await axiosInstance.get(`${API_PREFIX}/test-questions`);
  return response.data;
};

export const fetchTestQuestionById = async (questionId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/test-questions/${questionId}`);
  return response.data;
};

export const fetchTestQuestionsByTestId = async (testId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/test-questions/test/${testId}`);
  return response.data;
};

export const createTestQuestion = async (questionData) => {
  const response = await axiosInstance.post(`${API_PREFIX}/test-questions`, questionData);
  return response.data;
};

export const updateTestQuestion = async (questionId, questionData) => {
  const response = await axiosInstance.put(`${API_PREFIX}/test-questions/${questionId}`, questionData);
  return response.data;
};

export const deleteTestQuestion = async (questionId) => {
  const response = await axiosInstance.delete(`${API_PREFIX}/test-questions/${questionId}`);
  return response.data;
};

export const createTestQuestionsBatch = async (testId, questionsData) => {
  const response = await axiosInstance.post(
    `${API_PREFIX}/test-questions/batch/test/${testId}`, 
    questionsData
  );
  return response.data;
}; 