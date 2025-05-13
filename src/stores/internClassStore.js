import { defineStore } from 'pinia';
import { message } from 'ant-design-vue';
import * as internClassService from '@/services/internClassService';
import * as testService from '@/services/testService';

export const useInternClassStore = defineStore('internClass', {
  state: () => ({
    internClasses: [],
    availableClasses: [],
    internTests: [],
    testStatistics: null,
    currentTest: null,
    currentTestResult: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchInternClasses(internId) {
      try {
        this.loading = true;
        const response = await internClassService.fetchInternClasses(internId);
        this.internClasses = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch your classes');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAvailableClasses(internId) {
      try {
        this.loading = true;
        const response = await internClassService.fetchAvailableClasses(internId);
        this.availableClasses = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch available classes');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async registerForClass(internId, classId) {
      try {
        this.loading = true;
        const response = await internClassService.registerForClass(internId, classId);
        message.success('Successfully registered for class');
        await this.fetchInternClasses(internId);
        await this.fetchAvailableClasses(internId);
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to register for class');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async unregisterFromClass(internId, classId) {
      try {
        this.loading = true;
        const response = await internClassService.unregisterFromClass(internId, classId);
        message.success('Successfully unregistered from class');
        await this.fetchInternClasses(internId);
        await this.fetchAvailableClasses(internId);
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to unregister from class');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchInternTests(internId) {
      try {
        this.loading = true;
        const response = await internClassService.fetchInternTests(internId);
        this.internTests = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch your tests');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTestById(testId) {
      try {
        this.loading = true;
        const response = await testService.fetchTestById(testId);
        this.currentTest = response.data;
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch test details');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async submitTest(testId, internId, answers) {
      try {
        this.loading = true;
        const response = await testService.submitTest(testId, internId, answers);
        this.currentTestResult = response.data;
        message.success('Test submitted successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to submit test');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTestResultByIntern(testId, internId) {
      try {
        this.loading = true;
        const response = await testService.fetchTestResultByIntern(testId, internId);
        this.currentTestResult = response.data;
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch test result');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTestStatistics(internId) {
      try {
        this.loading = true;
        const response = await internClassService.fetchInternTestStatistics(internId);
        this.testStatistics = response.data;
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch test statistics');
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 