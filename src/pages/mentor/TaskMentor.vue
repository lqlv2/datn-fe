<template>
  <div class="task-management">
    <div class="page-header">
      <h2 class="header-title">Task List</h2>

      <a-button
          v-if="userRole === 'MENTOR'"
          type="primary"
          class="add-task-button"
          @click="showAddTaskModal"
      >
        <template #icon>
          <PlusOutlined/>
        </template>
        Add Task
      </a-button>
    </div>

    <div class="filter-container">
      <a-row :gutter="[24, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-select
                v-model:value="taskStore.status"
                placeholder="Status"
                class="filter-select"
                allow-clear
                @change="
                fetchTasks(pagination.current, pagination.pageSize, taskStore.status)
              "
            >
              <a-select-option v-for="item in TaskStatus" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
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
            width="20"
            align="center"
        />

        <a-table-column
            title="Title"
            data-index="title"
            key="title"
            width="130"
            align="center"
        />

        <a-table-column
            title="Status"
            data-index="status"
            key="status"
            width="130"
            align="center"
        >
          <template #default="{ text }">
            <a-tag :color="getStatusColor(text)" class="status-tag">
              {{ text }}
            </a-tag>
          </template>
        </a-table-column>

        <a-table-column
            title="Due Date"
            data-index="dueDate"
            key="dueDate"
            width="150"
            align="center"
        />
        <a-table-column
            title="Created At"
            data-index="createdAt"
            key="createdAt"
            width="150"
            align="center"
        />

        <a-table-column title="Actions" align="center">
          <template #default="{ record }">
            <a-button type="primary" size="small" class="action-button" @click="viewTask(record)">
              <eye-outlined/>
              View
            </a-button>
          </template>
        </a-table-column>
      </a-table>
    </div>

    <a-modal
        v-model:open="isAddTaskModalOpen"
        title="Add New Task"
        @ok="handleAddTask"
        width="60vw"
        class="task-modal"
    >
      <a-form layout="vertical">
        <a-form-item label="Title" required>
          <a-input
              v-model:value="newTask.title"
              placeholder="Enter task title"
          />
        </a-form-item>
        <div style="height: 280px">
          <a-form-item label="Description" required>
            <div style="height: 200px">
              <QuillEditor v-model:content="newTask.description" content-type="html" :options="editorOptions"
                           ref="quillEditTaskRef"/>
            </div>
          </a-form-item>
        </div>

        <a-form-item label="Due Date" required>
          <a-date-picker
              v-model:value="newTask.dueDate"
              placeholder="Select due date"
              style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
        v-model:open="isTaskDetailModalOpen"
        title="Task detail"
        width="60vw"
        class="task-modal"
    >
      <a-form layout="vertical">
        <a-form-item label="Title" required>
          <a-input
              v-model:value="taskDetail.title"
              placeholder="Enter task title"
          />
        </a-form-item>
        <div style="height: 280px">
          <a-form-item label="Description" required>
            <div style="height: 200px">
              <QuillEditor v-model:content="taskDetail.description" content-type="html" :options="editorOptions"
                           ref="quillEditorRef"/>
            </div>
          </a-form-item>
        </div>

        <a-form-item label="Due Date" required>
          <a-date-picker
              v-model:value="taskDetail.dueDate"
              placeholder="Select due date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabledDate="(current) => current && current < new Date().setHours(0,0,0,0)"
              style="width: 100%"
          />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button key="back" @click="isTaskDetailModalOpen = false">Cancel</a-button>
        <a-button key="submit" type="primary" @click="updateTaskInfo(taskDetail.id)">Update</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import {useAuthStore} from "@/stores/authStore";
import {useTaskStore} from "@/stores/taskStore";
import {useProjectStore} from "@/stores/projectStore";
import {useRouter} from "vue-router";
import {QuillEditor} from "@vueup/vue-quill";
import {EyeOutlined, PlusOutlined} from "@ant-design/icons-vue";

const quillEditorRef = ref(null);
const quillEditTaskRef = ref(null);

const isAddTaskModalOpen = ref(false);
const isTaskDetailModalOpen = ref(false);
const router = useRouter();
const projectStore = useProjectStore();
const authStore = useAuthStore();
const taskStore = useTaskStore();
const allTasks = computed(() => taskStore.allTasks);
const currentPage = computed(() => taskStore.currentPage);
const {
  fetchOwnTasks,
  fetchAllTasks,
  createTask,
  updateTask,
} = taskStore;

const TaskStatus = [
  {value: null, label: "All"},
  {value: 'New', label: 'New'},
  {value: 'Assigned', label: 'Assigned'},
  {value: 'Done', label: 'Done'},
];

const userRole = computed(() => authStore.userRole);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

const newTask = ref({
  title: "",
  description: "",
  dueDate: null,
});

const taskDetail = ref({
  id: null,
  title: "",
  description: "",
  dueDate: '',
});

const showAddTaskModal = () => {
  projectStore.fetchPersonalProjects();
  isAddTaskModalOpen.value = true;
};

const fetchTasks = (page = 1, size = 10, status = taskStore.status) => {
  if (userRole.value === "INTERN") {
    fetchOwnTasks(page, size, status);
  } else {
    fetchAllTasks(page, size, status);
  }
};

const handleAddTask = async () => {
  const task = await createTask(newTask.value);
  fetchTasks(currentPage.value, pagination.pageSize, taskStore.status);
  isAddTaskModalOpen.value = false;
  console.log(task);
  task.id && await router.push(`/mentor/task/${task.id}`);
};

onMounted(fetchTasks);

const handlePaginationChange = (paginationConfig) => {
  pagination.pageSize = paginationConfig.pageSize;
  fetchTasks(paginationConfig.current, pagination.pageSize, taskStore.status);
};
const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{'header': 1}, {'header': 2}],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ]
  },
  placeholder: 'Enter task description...'
};
const viewTask = (record) => {
  router.push(`/mentor/task/${record.id}`);

}
const updateTaskInfo = async (id) => {
  await updateTask({id: id, ...taskDetail.value});
  fetchTasks(currentPage.value, pagination.pageSize, taskStore.status);
  isTaskDetailModalOpen.value = false;
}

const getStatusColor = (status) => {
  switch (status) {
    case 'New':
      return 'orange';
    case 'Assigned':
      return 'blue';
    case 'Done':
      return 'green';
    default:
      return 'gray';
  }
};
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.add-task-button {
  background-color: #1890ff;
  color: white;
  border-radius: 6px;
  font-weight: 500;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.status-tag {
  padding: 2px 8px;
  border-radius: 12px;
}

.action-button {
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.task-modal :deep(.ant-modal-content) {
  border-radius: 8px;
  overflow: hidden;
}

.task-modal :deep(.ant-modal-header) {
  background-color: #f9fafc;
  padding: 16px 24px;
  border-bottom: 1px solid #eaeaea;
}

.task-modal :deep(.ant-modal-title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.task-modal :deep(.ant-modal-body) {
  padding: 20px;
}

.task-modal :deep(.ant-modal-footer) {
  border-top: 1px solid #eaeaea;
  padding: 12px 24px;
  background-color: #f9fafc;
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

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .add-task-button {
    width: 100%;
  }
}
</style>
