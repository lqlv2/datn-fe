import axiosInstance from '@/plugins/axios';

const API_MENTOR = '/mentors';

export const listMentor = (params) => {
  return axiosInstance.get(`${API_MENTOR}/list`, {
    params,
  });
};

export const deleteMentor = (id) => {
  return axiosInstance.delete(`${API_MENTOR}/${id}`);
};

export const updateMentor = (id, mentorData) => {
  return axiosInstance.put(`${API_MENTOR}/${id}`, mentorData);
};

export const addMentor = (mentorData) => {
  return axiosInstance.post(API_MENTOR, mentorData);
};

export const assignInterns = (assignRequest) => {
  return axiosInstance.post(`${API_MENTOR}/assign-intern`, assignRequest);
};

export const unassignIntern = (internId) => {
  return axiosInstance.post(`${API_MENTOR}/unassign-intern`, null, {
    params: {
      internId,
    },
  });
};

export const listUnassignedInterns = (mentorId, recommended ) => {
  return axiosInstance.get(`${API_MENTOR}/unassigned-intern/list`, {
    params: {
      mentorId,
      recommended,
    },
  });
};

export const toggleOpenStatus = (id) => {
  return axiosInstance.put(`${API_MENTOR}/toggle-open/${id}`);
}