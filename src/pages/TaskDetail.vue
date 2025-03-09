<script setup>
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useTaskStore } from "@/stores/taskStore";
import { ArrowLeftOutlined } from "@ant-design/icons-vue";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();
const taskStore = useTaskStore();
const task = computed(() => taskStore.selectedTask);
const { addComment, updateTaskStatus } = taskStore;
const currentUsername = computed(() => authStore.usernameDetail);

const currentComment = reactive({
  taskId: task.value.id,
  comment: "",
});

const updateStatus = reactive({
  taskId: task.value.id,
  status: task.value.status,
});

const goBack = () => {
  router.push("/task");
};

const updateProgress = () => {
    task.value.status = updateStatus.status;
    updateTaskStatus(updateStatus);
}

const sendComment = () => {
  if (currentComment.comment.trim() === "") return;

  addComment(currentComment);

  task.value.comments.push({
    name: currentUsername.value, 
    content: currentComment.comment,
    createdAt: new Date().toLocaleString(),
  });

  currentComment.comment = "";
};
</script>

<template>
  <div class="task-detail-container">
    <div class="task-info">
      <ArrowLeftOutlined class="back-icon" @click="goBack" />
      <div class="task-header">
        <h2>Task Information</h2>
        <button @click="updateProgress" class="update-progress-button">Update Progress</button>
        <a-select
          v-model:value="updateStatus.status"
          placeholder="Update Progress"
          style="width: 150px; margin-left: 10px"
        >
          <a-select-option value="PENDING">Pending</a-select-option>
          <a-select-option value="IN PROGRESS">In Progress</a-select-option>
          <a-select-option value="COMPLETED">Completed</a-select-option>
        </a-select>
      </div>

      <table class="task-table">
        <tr>
          <th>ID</th>
          <td>{{ task.id }}</td>
        </tr>
        <tr>
          <th>Title</th>
          <td>{{ task.title }}</td>
        </tr>
        <tr>
          <th>Assigned To</th>
          <td>{{ task.assignedTo }}</td>
        </tr>
        <tr>
          <th>Project Name</th>
          <td>{{ task.projectName }}</td>
        </tr>
        <tr>
          <th>Status</th>
          <td>{{ task.status }}</td>
        </tr>
        <tr>
          <th>Due Date</th>
          <td>{{ task.dueDate }}</td>
        </tr>
        <tr>
          <th>Assigned At</th>
          <td>{{ task.assignedAt }}</td>
        </tr>
        <tr>
          <th>Created At</th>
          <td>{{ task.createdAt }}</td>
        </tr>
        <tr>
          <th>Description</th>
          <td class="task-description">{{ task.description }}</td>
        </tr>
      </table>
    </div>

    <div class="comments-section">
      <h2>Comments</h2>
      <div v-if="task?.comments.length === 0" class="no-comments">
        No comments yet.
      </div>

      <div
        v-for="(comment, index) in task?.comments"
        :key="index"
        class="comment"
        :class="{ 'own-comment': comment.name === currentUsername }"
      >
        <div class="comment-name">{{ comment.name }}</div>
        <div class="comment-content">{{ comment.content }}</div>
        <div class="comment-date">{{ comment.createdAt }}</div>
        
      </div>

      <div class="comment-input">
        <textarea
          v-model="currentComment.comment"
          placeholder="Write a comment..."
          class="comment-textarea"
        ></textarea>
        <button @click="sendComment" class="send-button">Send</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-detail-container {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.task-info {
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
}

.task-table th,
.task-table td {
  padding: 8px;
  border: 1px solid #ddd;
}

.task-table th {
  background-color: #f4f4f4;
  text-align: left;
  width: 30%;
}

.comments-section {
  flex: 1;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.comment {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  background: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.comment-content {
  background: #fff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-date {
  margin-top: 5px;
  font-size: 12px;
  color: gray;
  text-align: right;
}

.no-comments {
  color: gray;
  text-align: center;
}

.task-description {
  word-wrap: break-word; /* Ensures long words break into the next line */
  max-width: 500px; /* You can adjust this width based on your layout */
  white-space: pre-wrap; /* This keeps any line breaks in the description */
  overflow-wrap: break-word; /* Ensures the text doesn't overflow outside the box */
  padding: 10px; /* Adds some padding around the description */
  border-radius: 5px; /* Rounded corners for better visual appeal */
}

.comment-input {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
}

.comment-textarea {
  width: 100%;
  min-height: 50px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  resize: vertical;
}

.send-button {
  margin-top: 10px;
  padding: 10px;
  background-color: #1e7cd3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.send-button:hover {
  background-color: #40a9ff;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.update-progress-button {
  padding: 8px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer; 
  transition: background-color 0.3s ease; 
}

.update-progress-button:hover {
  background-color: #218838; /* Slightly darker green on hover */
}

.update-progress-button:hover {
  background-color: #218838;
}

.own-comment {
  background-color: #e3edf7; 
  border: 1px solid #007bff;
}
</style>
