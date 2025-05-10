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
            <a-button type="primary" @click="isDeleteModalVisible = true">Delete</a-button>
            <a-button>Share</a-button>
            <a-dropdown>
              <a-button>More</a-button>
              <a-menu slot="overlay">
                <a-menu-item key="clone">Clone</a-menu-item>
                <a-menu-item key="delete">Delete</a-menu-item>
              </a-menu>
            </a-dropdown>
          </div>
        </div>

        <!-- Task Description -->
        <a-card title="Task Detail" class="task-card" style="margin-bottom: 24px">
          <a-row>
            <a-form-item label="Title">
              <a-input
                  v-model:value="task.title"
                  placeholder="Enter task title"
                  style="width: 100%"/>

            </a-form-item>
          </a-row>
          <a-row>
            <a-form-item label="Description">
              <QuillEditor
                  v-model:content="task.description"
                  content-type="html"
                  style="height: 200px"/>
            </a-form-item>
          </a-row>
          <a-row>
            <a-form-item label="Due date">
              <a-date-picker v-model:value="task.dueDate" format="YYYY-MM-DD" style="width: 100%" value-format="YYYY-MM-DD"/>
            </a-form-item>
          </a-row>
          <a-row>
            <a-form-item label="Priority">
              <a-select v-model:value="task.priority" style="width: 100%">
                <a-select-option value="High">High</a-select-option>
                <a-select-option value="Medium">Medium</a-select-option>
                <a-select-option value="Low">Low</a-select-option>
              </a-select>
            </a-form-item>
          </a-row>
          <a-row justify="end">
            <a-button
                type="primary"
                style="margin-top: 16px"
                @click="updateTask"
                >Update</a-button>
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
              <a-row>
                <a-col :span="16">
                  <a-select v-model:value="task.status" style="width: 140px" :default-value="task.status || 'New'">
                    <a-select-option v-for="st in TaskStatus" :value="st.value">{{ st.label }}</a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="8">
                  <a-button type="primary" style="margin-left: 10px" @click="updateTask">Update</a-button>
                </a-col>
              </a-row>
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
                <a-button type="primary" v-if="record.status === 'Unassigned'" @click="handleAssignTask(record.taskId, record.internId)">Assign</a-button>
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
<!--            <a-descriptions-item :label="assignSt.fullname">-->
<!--              <div class="status-row">-->
<!--                <span>{{ assignSt.status }}</span>-->
<!--                <div style="margin-left: auto;">-->
<!--                  <a-button type="primary" v-if="assignSt.status === 'Unassigned'" @click="handleAssignTask(assignSt.taskId, assignSt.internId)">Assign</a-button>-->
<!--                  <a-tooltip title="View Details" v-else>-->
<!--                    <EditOutlined style="color: blue" @click="viewDetail(assignSt.taskId, assignSt.internId)"/>-->
<!--                  </a-tooltip>-->
<!--                </div>-->
<!--              </div>-->
<!--            </a-descriptions-item>-->
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </div>

  <a-modal
      v-model:visible="isDeleteModalVisible"
      title="Delete Task"
      @ok="handleDelete"
      @cancel="isDeleteModalVisible = false"
      :ok-button-props="{ type: 'primary' }"
  >
    <a-typography>
      Are you sure you want to permanently delete this task? This action
      cannot be undone.
    </a-typography>
  </a-modal>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue';
import axiosInstance from '@/plugins/axios';
import {useRouter, useRoute} from "vue-router";
import {message} from 'ant-design-vue';
import {QuillEditor} from "@vueup/vue-quill";
import {PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined} from "@ant-design/icons-vue";
import {useTaskStore} from "@/stores/taskStore.js";

const router = useRouter();
const route = useRoute();
const taskStore = useTaskStore();

const TaskStatus = [
  {value: 'New', label: 'New'},
  {value: 'Assigned', label: 'Assigned'},
  {value: 'Done', label: 'Done'},
];

const isDeleteModalVisible = ref(false);
const handleDelete = async () => {
  try {
    await taskStore.deleteTask(task.id);
    message.success('Task deleted successfully');
    await router.push('/task');
  } catch (error) {
    message.error('Failed to delete task');
  }
};

const handleAssignTask = async (taskId, internId) => {
  await taskStore.assignTask(taskId, [internId]);
  message.success('Task assigned successfully');
  await fetchTaskDetails(route.params.id);
};

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

const updateTask = async () => {
  try {
    const response = await axiosInstance.put(`/tasks?taskId=${task.id}`, {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
    });
    if (response.status === 200) {
      message.success('Task updated successfully');
    }
  } catch (error) {
    console.error('Failed to update task:', error);
  }
  await fetchTaskDetails(route.params.id);
};

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