<template>
  <div class="task-management">
    <div class="page-header">
      <h2 class="header-title">Task List</h2>
    </div>
    
    <div class="filter-container">
      <a-row gutter="24" align="middle">
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-select
                v-model:value="taskStore.status"
                placeholder="Status"
                class="filter-select"
                @change="fetchTasks(pagination.current, pagination.pageSize, taskStore.status)"
            >
              <a-select-option :value="null">All</a-select-option>
              <a-select-option value="To do">To do</a-select-option>
              <a-select-option value="Pending">Pending</a-select-option>
              <a-select-option value="In Progress">In Progress</a-select-option>
              <a-select-option value="Done">Done</a-select-option>
            </a-select>
          </div>
        </a-col>
      </a-row>
    </div>

    <div class="table-container">
      <a-table
          :dataSource="allTasks"
          :pagination="pagination"
          @change="handlePaginationChange"
          rowKey="id"
          bordered
          :scroll="{ x: 1500, y: 500 }"
          :row-class-name="(_record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')"
          class="custom-table"
      >
        <a-table-column
            title="ID"
            data-index="id"
            key="id"
            align="center"
        />

        <a-table-column
            title="Title"
            data-index="title"
            key="title"
            align="center"
        />
        <a-table-column
            title="Assigned at"
            data-index="createdAt"
            key="createdAt"
            align="center"
        />

        <a-table-column
            title="Due Date"
            data-index="dueDate"
            key="dueDate"
            align="center"
        />

        <a-table-column
            title="Status"
            data-index="status"
            key="status"
            align="center"
        >
          <template #default="{ text }">
            <a-tag :color="getStatusColor(text)" class="status-tag">
              {{ text }}
            </a-tag>
          </template>
        </a-table-column>

        <a-table-column title="Actions" align="center">
          <template #default="{ record }">
            <a-button type="primary" size="small" @click="viewTask(record)" class="action-button">
              <eye-outlined />
              View
            </a-button>
          </template>
        </a-table-column>
      </a-table>
    </div>
  </div>
</template>


<script setup>
import {computed, onMounted, ref} from "vue";
import {useTaskStore} from "@/stores/taskStore";
import {useRouter} from "vue-router";
import {EyeOutlined} from "@ant-design/icons-vue";

const router = useRouter();
const taskStore = useTaskStore();
const allTasks = computed(() => taskStore.allTasks);
const {
  fetchOwnTasks,
} = taskStore;

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});


const fetchTasks = (page = 1, size = 10, status = taskStore.status) => {
  fetchOwnTasks(page, size, status);
};


onMounted(() => {
  fetchTasks()
});

const getStatusColor = (status) => {
  switch (status) {
    case 'To Do':
      return 'orange';
    case 'Done':
      return 'green';
    case 'In Progress':
      return 'blue';
    case 'Pending':
      return 'yellow';
    default:
      return 'gray';
  }
};

const handlePaginationChange = (paginationConfig) => {
  pagination.pageSize = paginationConfig.pageSize;
  fetchTasks(paginationConfig.current, pagination.pageSize, taskStore.status);
};

const viewTask = (record) => {
  router.push(`/intern/task/${record.id}`);
}
</script>
<style scoped>
.task-management {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eaeaea;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.filter-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.filter-item {
  margin-bottom: 16px;
}

.filter-select {
  width: 100%;
  border-radius: 6px;
}

.table-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
}

.custom-table :deep(.ant-table) {
  border-radius: 8px;
}

.custom-table :deep(.ant-table-thead > tr > th) {
  background-color: #f0f5ff;
  font-weight: 600;
  padding: 16px;
  color: #1f2937;
}

.custom-table :deep(.ant-table-tbody > tr.table-row-light) {
  background-color: #ffffff;
}

.custom-table :deep(.ant-table-tbody > tr.table-row-dark) {
  background-color: #f7faff;
}

.custom-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #e6f7ff !important;
}

.custom-table :deep(.ant-table-tbody > tr > td) {
  padding: 16px;
}

.action-button {
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .task-management {
    padding: 12px;
  }
  
  .filter-container,
  .table-container {
    padding: 16px;
  }
  
  .header-title {
    font-size: 1.25rem;
  }
}
</style>
