import { defineStore } from 'pinia';
import {
  listProgramRequest,
  listRecruitRequest,
  addProgramRequest,
  addRecruitRequest,
  acceptProgramRequest,
  acceptRecruitmentRequest,
  denyProgramRequest,
  denyRecruitmentRequest,
} from '@/services/recruitEduService';

export const useRecEduStore = defineStore('recedu', {
  state: () => ({
    recruitments: [],
    listCurrentRecruitmentDetail: [],
    selectedRecruitment: null,
    programs: [],
    totalRecruitments: 1,
    currentRecruitmentPage: 1,
    totalPrograms: 1,
    currentProgramPage: 1,
  }),

  actions: {
    async listRecruit(page = 1, size = 10) {
      try {
        // Prepare the parameters
        const params = { page, size };

        const response = await listRecruitRequest(params);
        this.recruitments = response.data.data.data;
        this.currentRecruitmentPage = response.data.data.currentPage;
        this.totalRecruitments = response.data.data.totalElements;
        console.log(this.recruitments);
      } catch (error) {
        console.error('Failed to list recruitments:', error);
      }
    },

    async listProgram() {
      try {
        const response = await listProgramRequest();
        this.programs = response.data.data.data;
        console.log(this.programs);
      } catch (error) {
        console.error('Failed to list programs:', error);
      }
    },

    async addRecruit(recruitData) {
      try {
        await addRecruitRequest(recruitData);
      } catch (error) {
        console.error('Failed to add recruit:', error);
      }
    },

    async addProgram(programData) {
      try {
        await addProgramRequest(programData);
        this.listProgram();
      } catch (error) {
        console.error('Failed to add program:', error);
      }
    },

    async acceptRecruitmentRequest(recruitId, comment) {
      try {
        await acceptRecruitmentRequest(recruitId, comment);
        console.log(
          `Recruitment request with ID ${recruitId} has been accepted with comment: "${comment}".`
        );
      } catch (error) {
        console.error(
          `Failed to accept recruitment request with ID ${recruitId}:`,
          error
        );
      }
    },

    async denyRecruitmentRequest(recruitId, comment) {
      try {
        await denyRecruitmentRequest(recruitId, comment);
        console.log(
          `Recruitment request with ID ${recruitId} has been denied with comment: "${comment}".`
        );
      } catch (error) {
        console.error(
          `Failed to deny recruitment request with ID ${recruitId}:`,
          error
        );
      }
    },

    async acceptProgramRequest(programId, comment) {
      try {
        await acceptProgramRequest(programId, comment);
        console.log(
          `Program request with ID ${programId} has been accepted with comment: "${comment}".`
        );
      } catch (error) {
        console.error(
          `Failed to accept program request with ID ${programId}:`,
          error
        );
      }
    },

    async denyProgramRequest(programId, comment) {
      try {
        await denyProgramRequest(programId, comment);
        console.log(
          `Program request with ID ${programId} has been denied with comment: "${comment}".`
        );
      } catch (error) {
        console.error(
          `Failed to deny program request with ID ${programId}:`,
          error
        );
      }
    },

    setCurrentRecruitment(recruitId) {
      // Find the recruitment by ID from the recruitments array
      const recruitment = this.recruitments.find(
        (recruit) => recruit.id === recruitId
      );

      if (recruitment) {
        this.selectedRecruitment = recruitment;
        this.listCurrentRecruitmentDetail = recruitment.requestDetails;
        console.log(this.listCurrentRecruitmentDetail);
      } else {
        console.warn(`Recruitment with ID ${recruitId} not found`);
      }
    },
  },
});
