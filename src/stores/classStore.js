// Class store for state management
import { defineStore } from 'pinia';
import * as classService from '@/services/classService';
import { message } from 'ant-design-vue';

export const useClassStore = defineStore('class', {
  state: () => ({
    classes: [],
    currentClass: null,
    tests: [],
    currentTest: null,
    testResults: [],
    statistics: null,
    classDocuments: [],
    loading: false,
    error: null,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  }),

  actions: {
    async fetchClasses(params = {}) {
      try {
        this.loading = true;
        const response = await classService.fetchClasses(params);
        if (response.data) {
          this.classes = response.data.content || [];
          this.pagination.current = response.data.page;
          this.pagination.pageSize = response.data.size;
          this.pagination.total = response.data.totalElements;
        }
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch classes');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchClassById(id) {
      try {
        this.loading = true;
        const response = await classService.fetchClassById(id);
        this.currentClass = response.data;
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch class details');
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchClassByCode(code) {
      try {
        this.loading = true;
        const response = await classService.fetchClassByCode(code);
        this.currentClass = response.data;
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch class details');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createClass(classData) {
      try {
        this.loading = true;
        const response = await classService.createClass(classData);
        message.success('Class created successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to create class');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateClass(id, classData) {
      try {
        this.loading = true;
        const response = await classService.updateClass(id, classData);
        message.success('Class updated successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to update class');
        throw error;
      } finally {
        this.loading = false;
      }
    },    
    
    async deleteClass(id) {
      try {
        this.loading = true;
        const response = await classService.deleteClass(id);
        message.success('Class deleted successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to delete class');
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Method for working with mock data
    setClasses(classes) {
      this.classes = classes;
    },
    
    async fetchClassInterns(classId) {
      try {
        this.loading = true;
        const response = await classService.fetchClassInterns(classId);
        return response.data;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch class interns');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchInternsNotInClass(classId) {
      try {
        this.loading = true;
        const response = await classService.fetchInternsNotInClass(classId);
        return response.data;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch available interns');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addInternToClass(classId, internId) {
      try {
        this.loading = true;
        const response = await classService.addInternToClass(classId, internId);
        message.success('Intern added to class successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to add intern to class');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async removeInternFromClass(classId, internId) {
      try {
        this.loading = true;
        const response = await classService.removeInternFromClass(classId, internId);
        message.success('Intern removed from class successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to remove intern from class');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTests(classId) {
      try {
        this.loading = true;
        const response = await classService.fetchTests(classId);
        this.tests = response.data || [];
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch tests');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTestById(classId, testId) {
      try {
        this.loading = true;
        const response = await classService.fetchTestById(classId, testId);
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

    async createTest(classId, testData) {
      try {
        this.loading = true;
        const response = await classService.createTest(classId, testData);
        message.success('Test created successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to create test');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTestResults(classId, testId) {
      try {
        this.loading = true;
        const response = await classService.fetchTestResults(classId, testId);
        this.testResults = response.data || [];
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch test results');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async submitTestScore(classId, testId, scores) {
      try {
        this.loading = true;
        const response = await classService.submitTestScore(classId, testId, scores);
        message.success('Test scores submitted successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to submit test scores');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchClassStatistics(classId) {
      try {
        this.loading = true;
        const response = await classService.fetchClassStatistics(classId);
        this.statistics = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch class statistics');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Document related actions
    async uploadClassDocument(classId, documentData) {
      try {
        this.loading = true;
        const response = await classService.uploadClassDocument(classId, documentData);
        message.success('Document uploaded successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to upload document');
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchClassDocuments(classId) {
      try {
        this.loading = true;
        const response = await classService.fetchClassDocuments(classId);
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to fetch documents');
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async getDocumentPresignedUrl(classId, documentKey) {
      try {
        this.loading = true;
        const response = await classService.getDocumentPresignedUrl(classId, documentKey);
        return response.data;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to get document URL');
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async downloadClassDocument(classId, documentKey) {
      try {
        this.loading = true;
        const response = await classService.downloadClassDocument(documentKey);
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to download document');
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async directDownloadDocument(url) {
      try {
        this.loading = true;
        const response = await classService.directDownloadDocument(url);
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to download document');
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteClassDocument(classId, documentKey) {
      try {
        this.loading = true;
        const response = await classService.deleteClassDocument(classId, documentKey);
        message.success('Document deleted successfully');
        return response;
      } catch (error) {
        this.error = error.message;
        message.error('Failed to delete document');
        throw error;
      } finally {
        this.loading = false;
      }
    }
  },
});
