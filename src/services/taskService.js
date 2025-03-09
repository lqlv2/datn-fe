import axiosInstance from '@/plugins/axios';

const API_TASK = '/tasks';

export const listOwnTasks = (params) => {
  return axiosInstance.get(`${API_TASK}/list-own`, { params });
};

export const listAllTasks = (params) => {
  return axiosInstance.get(`${API_TASK}`, { params });
};

export const assignTaskForIntern = (taskId, internId) => {
  return axiosInstance.post(`${API_TASK}/assign`, null, {
    params: { taskId, internId },
  });
};

export const createTask = (taskRequest) => {
  return axiosInstance.post(`${API_TASK}/create`, taskRequest);
};

export const updateTaskProgress = (updateStatusRequest) => {
  return axiosInstance.put(`${API_TASK}/update-progress`, updateStatusRequest);
};

export const addCommentToTask = (commentRequest) => {
  return axiosInstance.post(`${API_TASK}/comment`, commentRequest);
};

export const listInternOfProject = (params) => {
  return axiosInstance.get(`${API_TASK}/list-intern-of-project`, {
    params,
  });
};
