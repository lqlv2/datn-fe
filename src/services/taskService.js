import axiosInstance from '@/plugins/axios';

const API_TASK = '/tasks';
const API_MENTOR = '/mentors';

export const listOwnTasks = (params) => {
  return axiosInstance.get(`${API_TASK}/intern`, { params });
};

export const listAllTasks = (params) => {
  return axiosInstance.get(`${API_TASK}`, { params });
};

export const assignTaskForIntern = (taskId, internIds) => {
  console.log(internIds)
  const params = new URLSearchParams();
  params.append('taskId', taskId);
  internIds.filter(id => id !== null && id !== undefined).forEach(id => params.append('internId', id));
  return axiosInstance.post(`${API_TASK}/assign?${params.toString()}`);
};

export const createTask = (taskRequest) => {
  return axiosInstance.post(`${API_TASK}/create`, taskRequest);
};

export const updateTask = (taskRequest) => {
  return axiosInstance.put(`${API_TASK}?taskId=${taskRequest.id}`, taskRequest);
};

export const updateTaskProgress = (updateStatusRequest) => {
  return axiosInstance.put(`${API_TASK}/progress`, updateStatusRequest);
};

export const addCommentToTask = (commentRequest) => {
  return axiosInstance.post(`${API_TASK}/comment`, commentRequest);
};

export const deleteTask = (taskId) => {
  return axiosInstance.delete(`${API_TASK}?taskId=${taskId}` );
};

export const listInternOfProject = (params) => {
  return axiosInstance.get(`${API_MENTOR}/interns/listByTask`, {
    params,
  });
};
