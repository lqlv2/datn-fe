import axiosInstance from '@/plugins/axios';

const API_RECEDU = '/recruit-edu';

export const listRecruitRequest = (params) => {
  return axiosInstance.get(`${API_RECEDU}/list-recruitment`, {
    params,
  });
};

export const listProgramRequest = () => {
    return axiosInstance.get(`${API_RECEDU}/list-program`);
};

export const addRecruitRequest = (recruitData) => {
  return axiosInstance.post(`${API_RECEDU}/intern-request`, recruitData);
};

export const addProgramRequest = (programData) => {
  return axiosInstance.post(`${API_RECEDU}/program-request`, programData);
};

export const acceptRecruitmentRequest = (id, comment) => {
  return axiosInstance.put(`${API_RECEDU}/intern-request/${id}/confirm`, comment);
};

export const denyRecruitmentRequest = (id, comment) => {
  return axiosInstance.put(`${API_RECEDU}/intern-request/${id}/cancel`, comment);
};

export const acceptProgramRequest = (id, comment) => {
  return axiosInstance.put(`${API_RECEDU}/program-request/${id}/confirm`, comment);
};

export const denyProgramRequest = (id, comment) => {
  return axiosInstance.put(`${API_RECEDU}/program-request/${id}/cancel`, comment);
};
