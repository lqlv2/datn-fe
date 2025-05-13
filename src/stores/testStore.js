import { defineStore } from 'pinia';
import { message } from 'ant-design-vue';
import * as testService from '@/services/testService';

export const useTestStore = defineStore('test', {
  state: () => ({
    tests: [],
    currentTest: null,
    testResults: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchAllTests() {
      try {
        this.loading = true;
        const response = await testService.fetchAllTests();
        this.tests = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch tests');
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

    async fetchTestsByClassId(classId) {
      try {
        this.loading = true;
        const response = await testService.fetchTestsByClassId(classId);
        return response.data;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch class tests');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createTest(classId, testData) {
      try {
        this.loading = true;
        const response = await testService.createTest(classId, testData);
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to create test');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getClassTest(classId, testId) {
      try {
        this.loading = true;
        const response = await testService.getClassTest(classId, testId);
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

    async updateTest(classId, testId, testData) {
      try {
        this.loading = true;
        const response = await testService.updateTest(classId, testId, testData);
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to update test');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTest(classId, testId) {
      try {
        this.loading = true;
        const response = await testService.deleteTest(classId, testId);
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to delete test');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async submitTest(testId, internId, answers) {
      try {
        this.loading = true;
        const response = await testService.submitTest(testId, internId, answers);
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to submit test');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTestResults(testId) {
      try {
        this.loading = true;
        const response = await testService.fetchTestResults(testId);
        this.testResults = response.data;
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch test results');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTestResultByIntern(testId, internId) {
      try {
        this.loading = true;
        const response = await testService.fetchTestResultByIntern(testId, internId);
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch intern test result');
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 