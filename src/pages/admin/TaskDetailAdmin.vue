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
          <a-row>
          </a-row>
          <div class="task-actions">
            <a-button type="primary" @click="isDeleteModalVisible = true" disabled>Delete</a-button>
            <a-button>Share</a-button>
          </div>
        </div>

        <!-- Task Description -->
        <a-card title="Task Detail" class="task-card" style="margin-bottom: 24px">
          <a-row :gutter="[16, 16]">
            <a-col :span="3">
              <a-typography>Title</a-typography>
            </a-col>
            <a-col :span="20">
              <a-input
                  v-model:value="task.title"
                  disabled
                  placeholder="Enter task title"
                  style="width: 100%"/>
            </a-col>
          </a-row>
          <a-row :gutter="[16, 16]" style="margin-top: 16px">
            <a-col :span="3">
              <a-typography>Description</a-typography>
            </a-col>
            <a-col :span="20">
              <QuillEditor
                  disabled
                  v-model:content="task.description"
                  content-type="html"
                  style="height: 200px"/>
            </a-col>
          </a-row>
          <a-row style="margin-top: 16px">
            <a-col :span="3">
              <a-typography>Due date</a-typography>
            </a-col>
            <a-col :span="20">
              <a-date-picker v-model:value="task.dueDate" format="YYYY-MM-DD" style="width: 100%"
                             value-format="YYYY-MM-DD" disabled/>
            </a-col>
          </a-row>
          <a-row style="margin-top: 16px">
            <a-col :span="3">
              <a-typography>Priority</a-typography>
            </a-col>
            <a-col :span="20">
              <a-select v-model:value="task.priority" style="width: 100%" disabled>
                <a-select-option value="High">High</a-select-option>
                <a-select-option value="Medium">Medium</a-select-option>
                <a-select-option value="Low">Low</a-select-option>
              </a-select>
            </a-col>
          </a-row>
        </a-card>
      </a-col>

      <!-- Sidebar -->
      <a-col :xs="24" :lg="8">
        <a-card class="task-card">
          <a-descriptions title="Task Details" :column="1" bordered>
            <a-descriptions-item label="Created">
              {{ task.createdAt }}
            </a-descriptions-item>
            <a-descriptions-item label="Status">
              {{task.status}}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card class="task-card" title="Status" style="margin-top: 24px">
          <a-table
              :data-source="assignStatus"
              :pagination="false"
              :row-key="record => record.internId"
              style="margin-bottom: 16px">
            <a-table-column
                title="Intern"
                data-index="fullname"
                key="intern"
            />
            <a-table-column
                title="Assign status"
                data-index="status"
                key="status"
            />
            <a-table-column
                title="Time spent"
                data-index="timeSpent"
                key="timeSpent"
            />
            <a-table-column
                title="Actions"
                data-index="action"
                key="action"
            >
              <template #default="{ record }">
                <a-button type="primary" v-if="record.status === 'Unassigned'" @click="handleAssignTask(record.taskId, record.internId)" disabled>Assign</a-button>
                <a-button type="primary" v-else @click="viewDetail(record.taskId, record.internId)">View</a-button>
              </template>
            </a-table-column>
          </a-table>
          <a-descriptions
              v-for="assignSt in assignStatus"
              :key="assignSt.internId"
              :column="1"
              bordered
              class="status-description"
          >
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue';
import axiosInstance from '@/plugins/axios';
import {useRouter, useRoute} from "vue-router";

const router = useRouter();
const route = useRoute();

const task = reactive({
  id: '',
  title: '',
  description: '',
  status: 'New',
  priority: 'Medium',
  createdAt: '',
  dueDate: '',
  comments: [],
});

const assignStatus = reactive([
  {
    "internId": 1,
    "fullname": "intern 1",
    "taskId": "1",
    "status": "Done"
  }
])

const viewDetail = (taskId, internId) => {
  router.push(`/intern/task/${taskId}?internId=${internId}`);
}

const fetchTaskDetails = async (taskId) => {
  try {
    const response = await axiosInstance.get(`/tasks/mentor/${taskId}`);
    const taskAssign = await axiosInstance.get(`/tasks/assigned?taskId=${taskId}`);

    if (response.status === 200) {
      Object.entries(response.data.data).forEach(([key, value]) => {
        task[key] = value;
      });
    }
    if (taskAssign.status === 200) {
      assignStatus.length = 0;
      taskAssign.data.data.forEach((item) => {
        assignStatus.push(item);
      });
    }
  } catch (error) {
    console.error('Failed to fetch task details:', error);
  }

};

onMounted(() => {
  fetchTaskDetails(route.params.id);
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
.status-row {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>