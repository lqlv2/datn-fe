import { defineStore } from 'pinia';
import {
  listCriteria,
  listInternProjects,
  evaluateInternProject,
  getEvaluationsForIntern,
  getEvaluationsForMentor,
} from '@/services/evaluationService';

export const useEvaluationStore = defineStore('evaluation', {
  state: () => ({
    criteriaList: [],
    internProjects: [],
    evaluations: {},
    internEvaluations: [],
    mentorEvaluations: [],
    selectedInternProject: null,
    internFeedbacks: [],
    feedBackRequestOfEDU: [],
    feedBackIncomingForIntern: null,
  }),

  actions: {
    async fetchInternEvaluation() {
      try {
        const response = await getEvaluationsForIntern();
        this.internEvaluations = response.data.data;
      } catch (error) {
        console.error('Error fetching itern evlautiosn:', error);
      }
    },

    async fetchMentorEvaluation() {
      try {
        const response = await getEvaluationsForMentor();
        this.mentorEvaluations = response.data.data;
      } catch (error) {
        console.error('Error fetching itern evlautiosn:', error);
      }
    },

    async fetchCriteria() {
      try {
        const response = await listCriteria();
        this.criteriaList = response.data.data;
      } catch (error) {
        console.error('Error fetching evaluation criteria:', error);
      }
    },

    async fetchInternProjects() {
      try {
        const response = await listInternProjects();
        this.internProjects = response.data.data;
      } catch (error) {
        console.error('Error fetching intern projects:', error);
      }
    },

    setSelectedInternProject(project) {
      this.selectedInternProject = project;
      if (this.evaluations[project.id]) {
        return;
      }
      this.evaluations[project.id] = {};
      this.criteriaList.forEach((criteria) => {
        this.evaluations[project.id][criteria.id] = ''; 
      });
    },

     async evalutate(internprojectId, evaluateData) {
       try {
         await evaluateInternProject(internprojectId, evaluateData);
       } catch (error) {
         console.error('Failed to add recruit:', error);
       }
     },

    // Clear selected intern project
    clearSelectedInternProject() {
      this.selectedInternProject = null;
    },

    // Update evaluation score for a specific intern project and criteria
    updateEvaluation(internProjectId, criteriaId, score) {
      if (this.evaluations[internProjectId]) {
        this.evaluations[internProjectId][criteriaId] = score;
      }
    },
  },
});
