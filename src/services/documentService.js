import axiosInstance from '@/plugins/axios';

const API_DOCUMENT = '/documents';

export const listDocument = (params) => {
  return axiosInstance.get(`${API_DOCUMENT}/list`, {
    params,
  });
};

export const listProgramDocument = () => {
  return axiosInstance.get(`${API_DOCUMENT}/list-program-doc`);
};

export const uploadDocument = (file, title, description, type) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('description', description);
  formData.append('type', type);

  return axiosInstance.post(`${API_DOCUMENT}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteDocument = (id) => {
  return axiosInstance.delete(`${API_DOCUMENT}/${id}`);
};

export const downloadDocument = (id) => {
  return axiosInstance.get(`${API_DOCUMENT}/download/${id}`, {
    responseType: 'blob',
  });
};
