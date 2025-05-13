import { defineStore } from 'pinia';
import { message } from 'ant-design-vue';
import * as testQuestionService from '@/services/testQuestionService';

export const useTestQuestionStore = defineStore('testQuestion', {
  state: () => ({
    testQuestions: [],
    currentTestQuestion: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchAllTestQuestions() {
      try {
        this.loading = true;
        const response = await testQuestionService.fetchAllTestQuestions();
        this.testQuestions = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch test questions');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTestQuestionById(questionId) {
      try {
        this.loading = true;
        const response = await testQuestionService.fetchTestQuestionById(questionId);
        this.currentTestQuestion = response.data;
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch test question details');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTestQuestionsByTestId(testId) {
      try {
        this.loading = true;
        const response = await testQuestionService.fetchTestQuestionsByTestId(testId);
        this.testQuestions = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch test questions for this test');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createTestQuestion(questionData) {
      try {
        this.loading = true;
        const response = await testQuestionService.createTestQuestion(questionData);
        message.success('Test question created successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to create test question');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTestQuestion(questionId, questionData) {
      try {
        this.loading = true;
        const response = await testQuestionService.updateTestQuestion(questionId, questionData);
        message.success('Test question updated successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to update test question');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTestQuestion(questionId) {
      try {
        this.loading = true;
        const response = await testQuestionService.deleteTestQuestion(questionId);
        message.success('Test question deleted successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to delete test question');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createTestQuestionsBatch(testId, questionsData) {
      try {
        this.loading = true;
        const response = await testQuestionService.createTestQuestionsBatch(testId, questionsData);
        message.success('Test questions created successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to create test questions');
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 