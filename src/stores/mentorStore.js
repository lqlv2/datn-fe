import { defineStore } from 'pinia';
import {
  listMentor,
  deleteMentor,
  updateMentor,
  addMentor,
  assignInterns,
  unassignIntern,
  listUnassignedInterns,
  toggleOpenStatus,
} from '@/services/mentorService';
import {message} from "ant-design-vue";

export const useMentorStore = defineStore('mentorStore', {
  state: () => ({
    mentors: [],
    unassignedInterns: [],
    openMentors: [],
    totalElements: 1,
    currentPage: 1,
    selectedMentor: null,
  }),

  actions: {
    // Fetch and filter mentors
    async list(page = 1, size = 10, filter = {}) {
      try {
        // Prepare the parameters
        const params = { page, size, ...filter };
        console.log(params)
        const response = await listMentor(params);

        this.mentors = response.data.data.data; // Assuming response structure matches
        this.currentPage = response.data.data.currentPage;
        this.totalElements = response.data.data.totalElements;
        this.openMentors = response.data.data.data.filter(
          (mentor) => mentor.open === true
        );
      } catch (error) {
        console.error('Failed to list mentors:', error);
      }
    },

    // Delete a mentor by ID
    async delete(id) {
      try {
        await deleteMentor(id);
        this.mentors = this.mentors.filter((mentor) => mentor.id !== id);
        console.log(`Deleted mentor with ID ${id}.`);
        message.success("Deleted mentor successfully");
      } catch (error) {
        console.error('Failed to delete mentor:', error);
        message.error(error?.message);
      }
    },

    // Update mentor details
    async update(mentorId, mentorData) {
      try {
        await updateMentor(mentorId, mentorData);
        this.list(this.currentPage);
        this.selectedMentor = null;
      } catch (error) {
        console.error('Failed to update mentor:', error);
      }
    },

    // Add a new mentor
    async add(mentorData) {
      try {
        await addMentor(mentorData);
        this.list(this.currentPage);
      } catch (error) {
        console.error('Failed to create mentor:', error);
      }
    },

    async unassign(internId) {
      try {
        console.log(internId);
        await unassignIntern(internId);
        this.list(this.currentPage);
      } catch (error) {
        console.error('Failed to fetch unassigned interns:', error);
      }
    },

    // Assign interns to a mentor
    async assign(mentorId, internIds) {
      try {
        const assignRequest = {
          mentorId: mentorId,
          internIds: internIds,
        };

        await assignInterns(assignRequest);
        this.list(this.currentPage);
        console.log('Interns successfully assigned to mentor.');
      } catch (error) {
        console.error('Failed to assign interns to mentor:', error);
      }
    },

    async fetchUnassignedInterns(mentorId, recommended) {
      try {
        console.log(mentorId);
        const response = await listUnassignedInterns(mentorId, recommended);
        this.unassignedInterns = response.data.data;
      } catch (error) {
        console.error('Failed to fetch unassigned interns:', error);
      }
    },

    async toggleOpen(mentorId) {
      try {
        console.log(mentorId);
        await toggleOpenStatus(mentorId);
        this.list(this.currentPage);
      } catch (error) {
        console.error('Failed to toggle mentor status:', error);
      }
    },

    // Set selected mentor
    setSelectedMentor(mentor) {
      this.selectedMentor = mentor;
    },

    // Clear selected mentor
    clearSelectedMentor() {
      this.selectedMentor = null;
    },
  },
});
