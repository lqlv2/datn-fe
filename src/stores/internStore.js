import { defineStore } from 'pinia';
import {
  filterInterns,
  exportExcel,
  deleteIntern,
  updateIntern,
  addIntern,
  uploadIternImage,
  getCurrentIntern
} from '@/services/internService';

export const useInternStore = defineStore('internStore', {
  state: () => ({
    interns: [],
    totalElements: 1,
    currentPage: 1,
    filters: {
      position: null,
      status: null,
      startDate: null,
      endDate: null,
    },
    selectedIntern: null,
    currentIntern: null
  }),

  actions: {
    // Fetch and filter interns
    async filterStoreInterns(page = 1, size = 10, filter = this.filters) {
      try {
        // Prepare the parameters
        const params = {
          ...filter,
          page,
          size,
        };

        const response = await filterInterns(params);

        this.interns = response.data.data.data;
        this.currentPage = response.data.data.currentPage;
        console.log(this.currentPage);
        this.totalElements = response.data.data.totalElements;
      } catch (error) {
        console.error('Failed to filter interns:', error);
      }
    },

    async getCurrent() {
      try {
        const response = await getCurrentIntern();
        this.currentIntern = response.data.data;
        console.log(this.currentIntern);
      } catch (error) {
        console.error('Failed to filter interns:', error);
      }
    },

    // Export interns data to Excel
    async exportInternsToExcel(filter = this.filters) {
      try {
        const params = { ...filter };
        const response = await exportExcel(params);

        const url = window.URL.createObjectURL(new Blob([response.data]));
        console.log(response.data);
        console.log(params);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'khaidz.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('Exported interns to Excel successfully.');
      } catch (error) {
        console.error('Failed to export interns to Excel:', error);
      }
    },

    // Delete an intern by ID
    async delete(id) {
      try {
        await deleteIntern(id);
        this.interns = this.interns.filter((intern) => intern.id !== id); // Remove intern from state
        console.log(`Deleted intern with ID ${id}.`);
      } catch (error) {
        console.error('Failed to delete intern:', error);
      }
    },

    async update(internId, internData) {
      try {
        await updateIntern(internId, internData);
        this.filterStoreInterns(this.currentPage);
        this.selectedIntern = null;
      } catch (error) {
        console.error('Failed to update intern:', error);
      }
    },

    async add(internData) {
      try {
        await addIntern(internData);
        this.filterStoreInterns(this.currentPage);
      } catch (error) {
        console.error('Failed to create intern:', error);
      }
    },

    async uploadImage(email, file) {
      try {
        if (!file) {
          console.error('No file selected for upload');
          return;
        }

        const formData = new FormData();
        formData.append('image', file);

        await uploadIternImage(email, formData);
        console.log('Image uploaded successfully');
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    },

    // Set selected intern
    setSelectedIntern(intern) {
      this.selectedIntern = intern;
    },

    // Clear selected intern
    clearSelectedIntern() {
      this.selectedIntern = null;
    },
  },
});
