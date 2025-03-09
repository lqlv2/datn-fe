import { defineStore } from 'pinia';
import {
  listOwnTasks,
  listAllTasks,
  assignTaskForIntern,
  createTask,
  updateTaskProgress,
  addCommentToTask,
  listInternOfProject,
} from '@/services/taskService';

export const useTaskStore = defineStore('task', {
  state: () => ({
    ownTasks: [],
    allTasks: [],
    totalElements: 1,
    currentPage: 1,
    status: null,
    selectedTask: null,
    internsOfProject: [],
  }),
  actions: {
    async fetchOwnTasks(page = 1, size = 10, status = this.status) {
      try {
        const params = { page, size, status };
        const response = await listOwnTasks(params);
        this.ownTasks = response.data.data.data;
        this.currentPage = response.data.data.currentPage;
        this.totalElements = response.data.data.totalElements;
      } catch (error) {
        console.error('Error fetching own tasks:', error);
      }
    },

    async fetchAllTasks(page = 1, size = 10, status = this.status) {
      try {
        const params = { page, size, status };
        const response = await listAllTasks(params);
        this.allTasks = response.data.data.data;
        this.currentPage = response.data.data.currentPage;
        this.totalElements = response.data.data.totalElements;
      } catch (error) {
        console.error('Error fetching all tasks:', error);
      }
    },

    async assignTask(taskId, internId) {
      try {
        await assignTaskForIntern(taskId, internId);
      } catch (error) {
        console.error('Error assigning task:', error);
      }
    },

    async createTask(taskRequest) {
      try {
        const response = await createTask(taskRequest);
        this.selectedTask = response.data.data;
      } catch (error) {
        console.error('Error creating task:', error);
      }
    },

    async updateTaskStatus(updateStatusRequest) {
      try {
        await updateTaskProgress(updateStatusRequest);
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    },

    async addComment(comment) {
      try {
        await addCommentToTask(comment);
      } catch (error) {
        console.error('Error commenting task:', error);
      }
    },

    async fetchInternsOfProject(projectId) {
      try {
        const params = { projectId };
        const response = await listInternOfProject(params);
        this.internsOfProject = response.data.data;
      } catch (error) {
        console.error('Failed to fetch interns of proejct:', error);
      }
    },

    setSelectedTask(task) {
      this.selectedTask = task;
    },

    // Clear selected inter
    clearSelectedTask() {
      this.selectedTask = null;
    },
  },
});
