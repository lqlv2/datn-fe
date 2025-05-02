<template>
  <div class="task-detail-container">
    <!-- Breadcrumb -->
    <a-breadcrumb style="margin-bottom: 24px">
      <a-breadcrumb-item>
        <router-link to="/task">
          <a-typography-link>Tasks</a-typography-link>
        </router-link>
      </a-breadcrumb-item>
      <a-breadcrumb-item>
        <a-typography-text strong>{{ task.id }}</a-typography-text>
      </a-breadcrumb-item>
    </a-breadcrumb>

    <a-row :gutter="[24, 24]">
      <!-- Main Content -->
      <a-col :xs="24" :lg="16">
        <!-- Task Header -->
        <div class="task-header">
          <a-typography-title :level="2">{{ task.title }}</a-typography-title>
          <div class="task-actions">
            <a-button type="primary" icon="edit">Edit</a-button>
            <a-button icon="share-alt">Share</a-button>
            <a-dropdown>
              <a-button icon="ellipsis">More</a-button>
              <a-menu slot="overlay">
                <a-menu-item key="clone">Clone</a-menu-item>
                <a-menu-item key="delete">Delete</a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
        </div>

        <!-- Task Description -->
        <a-card title="Description" class="task-card" style="margin-bottom: 24px">
          <a-typography-text v-html="task.description" />
        </a-card>

        <!-- Activity Section -->
        <a-card title="Activity" class="task-card">
          <a-tabs default-active-key="comments" type="card">
            <a-tab-pane key="comments" tab="Comments">
              <div class="comment-section">
                <div class="comments">
                  <a-comment
                      v-for="(comment, index) in task.comments"
                      :key="index"
                      class="comment"
                  >
                    <template #content>
                      <div class="comment-header">
                        <a-typography-text strong class="comment-author">
                          {{ comment.username }}
                        </a-typography-text>
                        <a-typography-text type="secondary" class="comment-time">
                          {{ comment.time }}
                        </a-typography-text>
                      </div>
                      <a-typography-text v-html="comment.content" />
                    </template>
                  </a-comment>
                </div>
                <div class="comment-input">
                  <QuillEditor content-type="html" v-model:content="newComment" />
                  <a-button
                      type="primary"
                      :loading="commentLoading"
                      style="margin-top: 16px"
                      @click="addComment"
                  >
                    Comment
                  </a-button>
                </div>
              </div>
            </a-tab-pane>
            <a-tab-pane key="workLog" tab="Work Log">
              <a-form layout="vertical">
                <a-form-item label="Date">
                  <a-date-picker style="width: 100%" />
                </a-form-item>
                <a-form-item label="Hours">
                  <a-input-number style="width: 100%" :min="0" />
                </a-form-item>
                <a-form-item label="Description">
                  <a-textarea style="width: 100%" :rows="4" />
                </a-form-item>
                <a-button type="primary">Add Work Log</a-button>
              </a-form>
            </a-tab-pane>
            <a-tab-pane key="history" tab="History">
              <a-typography-text>History content here</a-typography-text>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>

      <!-- Sidebar -->
      <a-col :xs="24" :lg="8">
        <a-card class="task-card">
          <a-descriptions title="Task Details" :column="1" bordered>
            <a-descriptions-item label="Priority">
              <a-tag :color="priorityColor(task.priority)">
                {{ task.priority }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Status">
              <a-select v-model="task.status" style="width: 100%">
                <a-select-option value="To Do">To Do</a-select-option>
                <a-select-option value="In Progress">In Progress</a-select-option>
                <a-select-option value="Done">Done</a-select-option>
              </a-select>
            </a-descriptions-item>
            <a-descriptions-item label="Created">
              {{ task.createdAt }}
            </a-descriptions-item>
            <a-descriptions-item label="Due Date">
              {{ task.dueDate }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import axiosInstance from '@/plugins/axios';

const task = reactive({
  id: '',
  title: '',
  description: '',
  status: 'To Do',
  priority: 'Medium',
  createdAt: '',
  dueDate: '',
  comments: [],
});
const newComment = ref('');
const commentLoading = ref(false);

const priorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return 'red';
    case 'Medium':
      return 'orange';
    case 'Low':
      return 'green';
    default:
      return 'blue';
  }
};

const addComment = async () => {
  if (newComment.value) {
    commentLoading.value = true;
    try {
      const response = await axiosInstance.post('/tasks/comment', {
        taskId: task.id,
        comment: newComment.value,
      });
      task.comments = response.data.data || [];
      newComment.value = '<p></p>';
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      commentLoading.value = false;
    }
  }
};

const fetchTaskDetails = async () => {
  try {
    const response = await axiosInstance.get(`/tasks/intern/${1}`);
    if (response.status === 200) {
      Object.entries(response.data.data).forEach(([key, value]) => {
        task[key] = value;
      });
    }
  } catch (error) {
    console.error('Failed to fetch task details:', error);
  }
};

onMounted(() => {
  fetchTaskDetails();
});
</script>

<style scoped>
.task-detail-container {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.task-actions .ant-btn {
  margin-left: 8px;
  transition: all 0.3s;
}

.task-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.comment-section {
  padding: 16px 0;
}

.comments {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  margin-right: 8px;
}

.comment-time {
  font-size: 12px;
}

.comment-input {
  margin-top: 24px;
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-section h4 {
  margin-bottom: 8px;
  color: #595959;
}

@media (max-width: 768px) {
  .task-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .task-actions {
    margin-top: 16px;
  }

  .task-actions .ant-btn {
    margin-left: 0;
    margin-right: 8px;
  }
}
</style>