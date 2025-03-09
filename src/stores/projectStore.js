import { defineStore } from 'pinia';
import {
  listPersonalProject,
  listCompanyProject,
  listOwnInternProject,
  addCompanyProject,
  addPersonalProject,
  assignInternsToProject,
  approveProjectTransfer,
  denyProjectTransfer,
  createProjectTransfer,
  getInternListForAssignPersonalProject,
  getInternListForAssignCompanyProject,
  choosePersonalProject,
  listInternProjectForMentor,
  listPersonalProjectTransfer,
  listCompanyProjectTransfer,
  listOwnProjectTransfer,
} from '@/services/projectService';

export const useProjectStore = defineStore('projectStore', {
  state: () => ({
    projects: [],
    internsForAssign: [],
    filters: {
      status: null,
      type: null,
      techStack: null,
    },
    unassignedInterns: [],
    totalElements: 1,
    currentPage: 1,
    selectedProject: null,
    transfers: []
  }),

  actions: {
    async fetchPersonalProjects(page = 1, size = 10, filter = this.filters) {
      try {
        const params = { ...filter, page, size };
        const response = await listPersonalProject(params);
        this.projects = response.data.data.data;
        this.currentPage = response.data.data.currentPage;
        this.totalElements = response.data.data.totalElements;
      } catch (error) {
        console.error('Failed to fetch personal projects:', error);
      }
    },

    async fetchCompanyProjects(page = 1, size = 10, filter = this.filters) {
      try {
        const params = { ...filter, page, size };
        const response = await listCompanyProject(params);
        this.projects = response.data.data.data;
        this.currentPage = response.data.data.currentPage;
        this.totalElements = response.data.data.totalElements;
      } catch (error) {
        console.error('Failed to fetch company projects:', error);
      }
    },

    async fetchOwnInternProjects(page = 1, size = 10) {
      try {
        const params = { page, size };
        const response = await listOwnInternProject(params);
        this.projects = response.data.data;
        console.log(this.projects);
      } catch (error) {
        console.error('Failed to fetch own intern projects:', error);
      }
    },
    
    async fetchInternProjectsForMentor() {
      try {
        const response = await listInternProjectForMentor();
        this.projects = response.data.data;
      } catch (error) {
        console.error('Failed to fetch own intern projects for mentor:', error);
      }
    },

    async addCompanyProject(projectData) {
      try {
        await addCompanyProject(projectData);
        this.fetchCompanyProjects(this.currentPage);
      } catch (error) {
        console.error('Failed to add company project:', error);
      }
    },

    async assignIntern(interns) {
      try {
        await assignInternsToProject(interns);
      } catch (error) {
        console.error('Failed to add company project:', error);
      }
    },

    async addPersonalProject(projectData) {
      try {
        await addPersonalProject(projectData);
        this.fetchPersonalProjects(this.currentPage);
      } catch (error) {
        console.error('Failed to assign intern to project', error);
      }
    },

    async approveTransfer(transferId, comment) {
      try {
        await approveProjectTransfer(transferId, comment);
        console.log('Project transfer approved.');
      } catch (error) {
        console.error('Failed to approve project transfer:', error);
      }
    },

    async denyTransfer(transferId, comment) {
      try {
        await denyProjectTransfer(transferId, comment);
        console.log('Project transfer denied.');
      } catch (error) {
        console.error('Failed to deny project transfer:', error);
      }
    },

    async createTransfer(transferData) {
      try {
        await createProjectTransfer(transferData);
        console.log('Project transfer created successfully.');
      } catch (error) {
        console.error('Failed to create project transfer:', error);
      }
    },

    async fetchPersonalProjectTransfer() {
      try {
        const response = await listPersonalProjectTransfer();
        this.transfers = response.data.data;
      } catch (error) {
        console.error('Failed to fetch personal transfer list project:', error);
      }
    },

    async fetchCompanyProjectTransfer() {
      try {
        const response = await listCompanyProjectTransfer();
        this.transfers = response.data.data;
      } catch (error) {
        console.error('Failed to fetch company transfer list project:', error);
      }
    },

    async fetchOwnProjectTransfer() {
      try {
        const response = await listOwnProjectTransfer();
        this.transfers = response.data.data;
      } catch (error) {
        console.error('Failed to fetch own transfer list project:', error);
      }
    },

    async fetchInternListForPersonalProject() {
      try {
        const response = await getInternListForAssignPersonalProject();
        this.internsForAssign = response.data.data;
      } catch (error) {
        console.error('Failed to fetch intern list for personal project:', error);
      }
    },

    // Get intern list for assigning company projects
    async fetchInternListForCompanyProject() {
      try {
        const response = await getInternListForAssignCompanyProject();
        this.internsForAssign = response.data.data;
      } catch (error) {
        console.error('Failed to fetch intern list for company project:', error);
      }
    },

    // Choose a personal project for an intern
    async choosePersonalProject(projectId) {
      try {
        await choosePersonalProject(projectId);
        console.log('Personal project chosen successfully.');
      } catch (error) {
        console.error('Failed to choose personal project:', error);
      }
    },

    // Set selected project
    setSelectedProject(project) {
      this.selectedProject = project;
    },

    // Clear selected project
    clearSelectedProject() {
      this.selectedProject = null;
    },
  },
});