import axiosInstance from '@/plugins/axios';

const API_ACCOUNT = '/accounts';

export const listAccount = (params) => {
  return axiosInstance.get(`${API_ACCOUNT}/list`, {
    params,
  });
};

export const deleteAccount = (id) => {
  return axiosInstance.delete(`${API_ACCOUNT}/${id}`);
};

export const updateAccount = (id, accountData) => {
  return axiosInstance.put(`${API_ACCOUNT}/${id}`, accountData);
};

export const addAccount = (accountData) => {
  return axiosInstance.post(API_ACCOUNT, accountData);
};

