import axiosInstance from "@/plugins/axios";

const API_FEEDBACK = "/feedbacks";

/**
 * Request feedback for an intern
 * @param {Object} feedbackRequest - The feedback request payload
 * @returns {Promise} Axios response
 */
export const requestFeedback = (feedbackRequest) => {
  return axiosInstance.post(`${API_FEEDBACK}/request`, feedbackRequest);
};

/**
 * Respond to a feedback request
 * @param {Object} feedbackResponse - The feedback response payload
 * @returns {Promise} Axios response
 */
export const respondFeedback = (feedbackResponse) => {
  return axiosInstance.post(`${API_FEEDBACK}/respond`, feedbackResponse);
};

/**
 * Get the list of interns available for feedback requests
 * @returns {Promise} Axios response
 */
export const getInternsToRequest = () => {
  return axiosInstance.get(`${API_FEEDBACK}/interns-to-request`);
};

/**
 * Fetch all feedback records
 * @returns {Promise} Axios response
 */
export const getAllFeedbacks = () => {
  return axiosInstance.get(API_FEEDBACK);
};

/**
 * Get feedback request for the currently logged-in intern
 * @returns {Promise} Axios response
 */
export const getFeedbackForIntern = () => {
  return axiosInstance.get(`${API_FEEDBACK}/for-intern`);
};

/**
 * Get feedback requested by the department
 * @returns {Promise} Axios response
 */
export const getFeedbackForDepartment = () => {
  return axiosInstance.get(`${API_FEEDBACK}/for-department`);
};
