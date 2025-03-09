import axiosInstance from '@/plugins/axios';

const API_EVALUATION = '/evaluation';

/**
 * Fetch all evaluation criteria
 * @returns {Promise} Axios response
 */
export const listCriteria = () => {
  return axiosInstance.get(`${API_EVALUATION}/criteria`);
};

/**
 * Fetch all intern projects to evaluate
 * @returns {Promise} Axios response
 */
export const listInternProjects = () => {
  return axiosInstance.get(`${API_EVALUATION}/list-intern-project`);
};

/**
 * Submit evaluation for an intern project
 * @param {number} internProjectId - The ID of the intern project
 * @param {Array} evaluations - The list of evaluation details
 * @returns {Promise} Axios response
 */
export const evaluateInternProject = (internProjectId, evaluations) => {
  return axiosInstance.post(`${API_EVALUATION}/${internProjectId}/evaluate`, evaluations);
};

/**
 * Fetch all evaluations for the mentor
 * @returns {Promise} Axios response containing the evaluations list for the mentor
 */
export const getEvaluationsForMentor = () => {
    return axiosInstance.get(`${API_EVALUATION}/for-mentor`);
  };
  
  /**
   * Fetch all evaluations for the intern
   * @returns {Promise} Axios response containing the evaluations list for the intern
   */
  export const getEvaluationsForIntern = () => {
    return axiosInstance.get(`${API_EVALUATION}/for-intern`);
  };
