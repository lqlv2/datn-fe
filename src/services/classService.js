// Class service for handling class management API calls
import axiosInstance from '@/plugins/axios';

const API_PREFIX = '/api';

export const fetchClasses = async (params = {}) => {
  const response = await axiosInstance.get(`${API_PREFIX}/classes`, { params });
  return response.data;
};

export const fetchClassById = async (id) => {
  const response = await axiosInstance.get(`${API_PREFIX}/classes/${id}`);
  return response.data;
};

export const fetchClassByCode = async (code) => {
  const response = await axiosInstance.get(`${API_PREFIX}/classes/code/${code}`);
  return response.data;
};

export const createClass = async (classData) => {
  const formattedData = formatClassData(classData);
  const response = await axiosInstance.post(`${API_PREFIX}/classes`, formattedData);
  return response.data;
};

export const updateClass = async (id, classData) => {
  const formattedData = formatClassData(classData);
  const response = await axiosInstance.put(`${API_PREFIX}/classes/${id}`, formattedData);
  return response.data;
};

export const deleteClass = async (id) => {
  const response = await axiosInstance.delete(`${API_PREFIX}/classes/${id}`);
  return response.data;
};

export const fetchClassInterns = async (classId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/classes/${classId}/interns`);
  return response.data;
};

export const fetchInternsNotInClass = async (classId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/classes/${classId}/interns-not-in-class`);
  return response.data;
};

export const addInternToClass = async (classId, internId) => {
  const response = await axiosInstance.post(`${API_PREFIX}/classes/${classId}/interns/${internId}`);
  return response.data;
};

export const removeInternFromClass = async (classId, internId) => {
  const response = await axiosInstance.delete(`${API_PREFIX}/classes/${classId}/interns/${internId}`);
  return response.data;
};

// Helper functions to format data
const formatClassData = (classData) => {
  const formattedData = { ...classData };
  
  // Format dates and times for the API
  if (formattedData.startDate && typeof formattedData.startDate !== 'string') {
    formattedData.startDate = formattedData.startDate.toISOString();
  }
  
  if (formattedData.endDate && typeof formattedData.endDate !== 'string') {
    formattedData.endDate = formattedData.endDate.toISOString();
  }
  
  if (formattedData.startTime && typeof formattedData.startTime !== 'string') {
    formattedData.startTime = formattedData.startTime.format('HH:mm');
  }
  
  if (formattedData.endTime && typeof formattedData.endTime !== 'string') {
    formattedData.endTime = formattedData.endTime.format('HH:mm');
  }
  
  return formattedData;
};

// Document related endpoints - unified S3 approach
export const uploadClassDocument = async (classId, documentData) => {
  console.log('uploadClassDocument called with classId:', classId);
  console.log('documentData:', documentData);
  
  const formData = new FormData();
  formData.append('file', documentData.file);
  formData.append('title', documentData.title);
  formData.append('description', documentData.description || '');
  formData.append('type', documentData.type);
  
  try {
    // Use unified S3 document endpoint
    const response = await axiosInstance.post(`${API_PREFIX}/classes/${classId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Upload response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in uploadClassDocument:', error);
    console.error('Error response:', error.response);
    throw error;
  }
};

export const fetchClassDocuments = async (classId) => {
  // Use unified S3 document endpoint
  const response = await axiosInstance.get(`${API_PREFIX}/classes/${classId}/documents`);
  return response.data;
};

export const deleteClassDocument = async (classId, documentKey) => {
  // Use unified S3 document endpoint with the S3 key
  const response = await axiosInstance.delete(`${API_PREFIX}/classes/${classId}/documents`, {
    data: { key: documentKey }
  });
  return response.data;
};

export const downloadClassDocument = async (documentKey) => {
  // Get a presigned URL for download
  const downloadUrl = `/api/classes/documents/${documentKey}/download")`;
  return directDownloadDocument(downloadUrl);
};

export const getDocumentPresignedUrl = async (classId, documentKey) => {
  // Use unified S3 document endpoint with the document key
  const response = await axiosInstance.get(`${API_PREFIX}/classes/${classId}/documents/url`, {
    params: { key: documentKey }
  });
  return response.data;
};

export const directDownloadDocument = async (url) => {
  return await axiosInstance.get(url, {
    responseType: 'blob',
  });
};

export const fetchClassStatistics = async (classId) => {
  const response = await axiosInstance.get(`${API_PREFIX}/classes/${classId}/statistics`);
  return response.data;
};
