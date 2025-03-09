import axiosInstance from '@/plugins/axios';

const API_PROJECT = '/projects';

// List personal projects
export const listPersonalProject = (params) => {
  return axiosInstance.get(`${API_PROJECT}/list-personal-projects`, {
    params,
  });
};

export const listCompanyProject = (params) => {
  return axiosInstance.get(`${API_PROJECT}/list-company-projects`, {
    params,
  });
};

export const addPersonalProject = (projectRequest) => {
  return axiosInstance.post(`${API_PROJECT}/add-personal`, projectRequest);
};

export const addCompanyProject = (projectRequest) => {
  return axiosInstance.post(`${API_PROJECT}/add-company`, projectRequest);
};

export const approveProjectTransfer = (transferId, approveComment) => {
  return axiosInstance.post(`${API_PROJECT}/approve-transfer`, null, {
    params: {
      transferId,
      approveComment,
    },
  });
};

export const denyProjectTransfer = (transferId, approveComment) => {
  return axiosInstance.post(`${API_PROJECT}/deny-transfer`, null, {
    params: {
      transferId,
      approveComment,
    },
  });
};

export const choosePersonalProject = (projectId) => {
  return axiosInstance.post(`${API_PROJECT}/choose-personal-project/${projectId}`);
};

export const getInternListForAssignPersonalProject = () => {
  return axiosInstance.get(`${API_PROJECT}/list-for-assign-personal`);
};

export const getInternListForAssignCompanyProject = () => {
  return axiosInstance.get(`${API_PROJECT}/list-for-assign-company`);
};

// List intern projects for the current intern
export const listOwnInternProject = () => {
  return axiosInstance.get(`${API_PROJECT}/list-own-intern-project`);
};

export const listInternProjectForMentor = () => {
  return axiosInstance.get(`${API_PROJECT}/list-intern-project-for-mentor`);
};

export const createProjectTransfer = (transferRequest) => {
  return axiosInstance.post(`${API_PROJECT}/create-transfer`, transferRequest);
};

export const assignInternsToProject = (assignRequest) => {
  return axiosInstance.post(`${API_PROJECT}/assign-intern`, assignRequest);
};

export const listPersonalProjectTransfer = () => {
  return axiosInstance.get(`${API_PROJECT}/list-personal-transfer`);
};

export const listCompanyProjectTransfer = () => {
  return axiosInstance.get(`${API_PROJECT}/list-company-transfer`);
};

export const listOwnProjectTransfer = () => {
  return axiosInstance.get(`${API_PROJECT}/own-transfer`);
};

