import { defineStore } from 'pinia';
import {
  uploadDocument,
  deleteDocument,
  listDocument,
  listProgramDocument,
} from '@/services/documentService';

export const useDocumentStore = defineStore('document', {
  state: () => ({
    documents: [],
    programDocs: [],
    totalElements: 1,
    currentPage: 1,
    filters: {
      title: null,
      format: null,
      type: null,
    },
  }),

  actions: {
    async list(page = 1, size = 10, filter = this.filters) {
      try {
        const params = {
          ...filter,
          page: page,
          size: size,
        };

        const response = await listDocument(params);

        this.documents = response.data.data.data;
        this.currentPage = response.data.data.currentPage;
        this.totalElements = response.data.data.totalElements;
        console.log(this.documents);
      } catch (error) {
        console.error('Failed to list documents:', error);
      }
    },

    async listProgramDoc() {
      try {
        const response = await listProgramDocument();

        this.programDocs = response.data.data;
        console.log(this.programDocs);
      } catch (error) {
        console.error('Failed to list program documents:', error);
      }
    },

    async upload(file, title, description, type) {
      await uploadDocument(file, title, description, type);
      this.list(this.currentPage);
    },

    async deleteDocument(id) {
      this.loading = true;
      this.error = null;
      try {
        await deleteDocument(id);
        this.documents = this.documents.filter((doc) => doc.id !== id);
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to delete document';
      } finally {
        this.loading = false;
      }
    },
  },
});
