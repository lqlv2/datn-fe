import { defineStore } from "pinia";
import {
  requestFeedback,
  respondFeedback,
  getInternsToRequest,
  getAllFeedbacks,
  getFeedbackForIntern,
  getFeedbackForDepartment,
} from "@/services/feedbackService";

export const useFeedbackStore = defineStore("feedback", {
  state: () => ({
    internsToRequest: [],
    allFeedbacks: [],
    feedbackForIntern: null,
    feedbackForDepartment: [],
    selectedFeedback: null,
  }),

  actions: {
    // Request feedback for an intern
    async requestFeedbackAction(feedbackRequest) {
      await requestFeedback(feedbackRequest);
    },

    // Respond to a feedback request
    async respondFeedbackAction(feedbackResponse) {
      await respondFeedback(feedbackResponse);
    },

    // Get the list of interns available for feedback requests
    async getInternsToRequestAction() {
      const response = await getInternsToRequest();
      this.internsToRequest = response.data.data;
    },

    // Fetch all feedback records
    async getAllFeedbacksAction() {
      const response = await getAllFeedbacks();
      this.allFeedbacks = response.data.data;
    },

    // Get feedback request for the currently logged-in intern
    async getFeedbackForInternAction() {
      const response = await getFeedbackForIntern();
      this.feedbackForIntern = response.data.data;
    },

    // Get feedback requested by the department
    async getFeedbackForDepartmentAction() {
      const response = await getFeedbackForDepartment();
      this.feedbackForDepartment = response.data.data;
    },

    // Set the selected feedback
    setSelectedFeedback(feedback) {
      this.selectedFeedback = feedback;
    },

    // Clear the selected feedback
    clearSelectedFeedback() {
      this.selectedFeedback = null;
    },
  },
});
