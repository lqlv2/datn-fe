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
    scheduleEvents: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchInternClasses(internId) {
      try {
        console.log('Store: Fetching intern classes for intern ID:', internId);
        this.loading = true;
        const response = await internClassService.fetchInternClasses(internId);
        console.log('API response for intern classes:', response);
        this.internClasses = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message;
        console.error('Failed to fetch intern classes:', error);
        message.error('Failed to fetch your classes');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAvailableClasses(internId) {
      try {
        console.log('Store: Fetching available classes for intern ID:', internId);
        this.loading = true;
        const response = await internClassService.fetchAvailableClasses(internId);
        console.log('API response for available classes:', response);
        this.availableClasses = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message;
        console.error('Failed to fetch available classes:', error);
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
        console.log('Store: Submitting test for test ID:', testId, 'intern ID:', internId);
        console.log('Answers payload:', answers);
        this.loading = true;
        
        // Ensure we have a valid answers object even if empty
        const answersPayload = answers || {};
        
        const response = await testService.submitTest(testId, internId, answersPayload);
        console.log('Test submission response:', response);
        this.currentTestResult = response.data;
        message.success('Test submitted successfully');
        return response;
      } catch (error) {
        this.error = error.message || 'Failed to submit test';
        console.error('Failed to submit test:', error);
        
        // Check for specific error types
        if (error.response) {
          if (error.response.status === 404) {
            message.error('Test not found or no longer available');
          } else if (error.response.status === 400) {
            message.error('Invalid test submission: ' + (error.response.data?.message || 'Please check your answers'));
          } else {
            message.error(this.error);
          }
        } else {
          message.error(this.error);
        }
        
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTestResultByIntern(testId, internId) {
      try {
        console.log('Store: Fetching test result for test ID:', testId, 'intern ID:', internId);
        this.loading = true;
        const response = await testService.fetchTestResultByIntern(testId, internId);
        console.log('Fetched test result:', response);
        
        // Process the response to ensure it has the correct structure
        let testResult;
        
        if (response.data) {
          // If the API returns a nested data structure
          testResult = response.data;
          // Ensure testId is set
          if (!testResult.testId) {
            testResult.testId = testId;
          }
        } else {
          // If the API returns a flat structure
          testResult = response;
          // Ensure testId is set
          if (!testResult.testId) {
            testResult.testId = testId;
          }
        }
        
        // Store the updated result
        this.currentTestResult = testResult;
        
        // Return the response with the expected structure
        return { data: testResult };
      } catch (error) {
        // Don't show error message for 404 - it's expected when a user hasn't taken a test yet
        if (error.response && error.response.status === 404) {
          console.log('No test result found for this intern/test combination - likely not taken yet');
          this.currentTestResult = null;
        } else {
          this.error = error.message || 'Failed to fetch test result';
          console.error('Error fetching test result:', error);
          message.error('Failed to fetch test result');
        }
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
    },
    
    // New schedule-related actions
    async fetchScheduleEvents(internId, startDate, endDate) {
      try {
        console.log('Store: Fetching schedule events for intern ID:', internId, 'from', startDate, 'to', endDate);
        this.loading = true;
        const response = await internClassService.fetchInternCalendarEvents(internId, startDate, endDate);
        console.log('API response for schedule events:', response);
        return response.data;
      } catch (error) {
        this.error = error.message;
        console.error('Failed to fetch schedule events:', error);
        message.error('Failed to fetch schedule events');
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 