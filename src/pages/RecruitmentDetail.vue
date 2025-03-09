<template>
  <div class="recruitment-details-container">
    <ArrowLeftOutlined
      class="back-icon"
      @click="goBack"
      aria-label="Back to Recruitment"
    />

    <div class="header">
      <p class="request-id"><strong>Request ID:</strong> {{ requestId }}</p>
      <div class="status-department">
        <p><strong>Department:</strong> {{ recruit.department || "N/A" }}</p>
        <p class="status" :data-status="recruit.status">
          <strong>Status:</strong> {{ recruit.status }}
        </p>
      </div>
    </div>

    <div v-if="recruitDetail.length === 0" class="no-data">
      <p>No recruitment details available for this request.</p>
    </div>

    <div v-else class="details-list">
      <div class="general-info">
        <p><strong>Quarter:</strong> {{ recruit.quarter || "N/A" }}</p>
        <p><strong>Year:</strong> {{ recruit.year || "N/A" }}</p>
        <p>
          <strong>Created At:</strong>
          {{ recruit.createdAt ? formatDate(recruit.createdAt) : "N/A" }}
        </p>
        <p v-if="recruit.approvedAt">
          <strong>Approved At:</strong> {{ formatDate(recruit.approvedAt) }}
        </p>
      </div>

      <div
        v-for="(detail, index) in recruitDetail"
        :key="index"
        class="detail-card"
      >
        <h3 class="position">{{ detail.position }}</h3>
        <p><strong>Number of Requests:</strong> {{ detail.numberOfRq }}</p>
        <p><strong>Required Skills:</strong> {{ detail.requiredSkill }}</p>
        <p><strong>Job Description:</strong></p>
        <p>{{ detail.jobDescription }}</p>
      </div>

      <!-- Accept/Deny buttons for COO -->
      <div
        v-if="recruit.status === 'PENDING' && userRole === 'COO'"
        class="actions"
      >
        <textarea
          v-model="comment"
          placeholder="Add your comment"
          rows="4"
          class="comment-box"
        ></textarea>
        <div class="buttons">
          <button @click="acceptRequest" class="accept-button">Accept</button>
          <button @click="denyRequest" class="deny-button">Deny</button>
        </div>
      </div>

      <div v-else-if="recruit.status !== 'PENDING'" class="comment-display">
        <p>
          <strong>Comment:</strong>
          {{ recruit.apComment || "No comment available" }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter, useRoute } from "vue-router";
import { useRecEduStore } from "@/stores/recruitEduStore";
import { ArrowLeftOutlined } from "@ant-design/icons-vue"; // Import Ant Design Icon
import { message } from "ant-design-vue";

const recEduStore = useRecEduStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const recruitDetail = computed(() => recEduStore.listCurrentRecruitmentDetail);
const recruit = computed(() => recEduStore.selectedRecruitment);
const requestId = route.params.id;
const userRole = computed(() => authStore.userRole); 
const comment = ref(null); 

const goBack = () => {
  router.push("/recruit-edu"); 
};

const formatDate = (date) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleDateString(undefined, options);
};

const acceptRequest = async () => {
  try {
    await recEduStore.acceptRecruitmentRequest(requestId, comment.value);
    message.success("Request approved successfully");
    goBack();
  } catch (error) {
    message.error("An error occurred. Please try again.");
  }
};

const denyRequest = async () => {
  try {
    await recEduStore.denyRecruitmentRequest(requestId, comment.value);
    message.success("Request denied successfully");
    goBack();
  } catch (error) {
    message.error("An error occurred. Please try again.");
  }
};
</script>

<style scoped>
.recruitment-details-container {
  margin: 20px auto;
  padding: 20px;
  max-width: 800px;
  font-family: Arial, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.request-id {
  text-align: center;
  color: #555;
  margin-bottom: 20px;
}

.no-data {
  text-align: center;
  color: #999;
  font-size: 16px;
  margin-top: 20px;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.general-info {
  margin-bottom: 20px;
  color: #555;
}

.detail-card {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.detail-card h3 {
  margin: 0 0 8px;
  color: #007bff;
}

.detail-card p {
  margin: 4px 0;
  color: #555;
}

.actions {
  margin-top: 20px;
  text-align: center;
}

.comment-box {
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.accept-button,
.deny-button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
}

.accept-button {
  background-color: #4caf50;
  color: white;
}

.deny-button {
  background-color: #f44336;
  color: white;
}

.status {
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 4px;
}

.status[data-status="APPROVED"] {
  color: #ffffff;
  background-color: #2a5334; 
}

.status[data-status="PENDING"] {
  color: #474545;
  background-color: #f6dd92;
}

.status[data-status="DENIED"] {
  color: #474545;
  background-color: #dc3545; 
}

.status-department {
  display: flex;
  align-items: center;
  gap: 20px; /* Space between department and status */
}

.comment-display {
  padding: 10px; /* Add padding for spacing */
  font-size: 14px; /* Match font size with input for consistency */
  line-height: 1.6; /* Enhance readability */
  background-color: #f0f0f0; /* Light background for separation */
  border: 1px solid #ddd; /* Subtle border for structure */
  border-radius: 5px; /* Rounded corners */
  color: #333; /* Dark text for readability */
  word-wrap: break-word; /* Ensure long words break to the next line */
  white-space: pre-line; /* Preserve line breaks in the comment text */
}
</style>
