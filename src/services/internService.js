import axiosInstance from '@/plugins/axios';

const API_INTERN = '/interns';

export const filterInterns = (params) => {
  return axiosInstance.get(`${API_INTERN}/filter`, {
    params,
  });
};

export const exportExcel = (params) => {
  return axiosInstance.get(`${API_INTERN}/export`,  {
    params: params,
    responseType: 'blob',
  });
};

export const deleteIntern = (id) => {
  return axiosInstance.delete(`${API_INTERN}/${id}`);
};

export const updateIntern = (id, internData) => {
  return axiosInstance.put(`${API_INTERN}/${id}`, internData);
};

export const addIntern = (internData) => {
  return axiosInstance.post(API_INTERN, internData);
};

export const getUnassignedIntern = () => {
  return axiosInstance.get(`${API_INTERN}/list-unassigned`);
};

export const uploadIternImage = (email, formData) => {
  return axiosInstance.post(`${API_INTERN}/image-upload/${email}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getCurrentIntern = () => {
  return axiosInstance.get(`${API_INTERN}/current`);
};