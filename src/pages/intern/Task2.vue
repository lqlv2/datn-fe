<script setup>
import {ref, onMounted, computed} from "vue";
import {useAuthStore} from "@/stores/authStore";
import {useTaskStore} from "@/stores/taskStore";
import {useProjectStore} from "@/stores/projectStore";
import {useRouter} from "vue-router";
import {QuillEditor} from "@vueup/vue-quill";

const quillEditorRef = ref(null);
const quillEditTaskRef = ref(null);

const isModalOpen = ref(false);
const isAddTaskModalOpen = ref(false);
const isTaskDetailModalOpen = ref(false);
const taskStore = useTaskStore();
const allTasks = computed(() => taskStore.allTasks);
const currentPage = computed(() => taskStore.currentPage);
const {
  fetchOwnTasks,
  updateTaskStatus,
  createTask,
} = taskStore;

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
  progress: 0,
  timeSpent: 0,
  note: "",
});

const fetchTasks = (page = 1, size = 10, status = taskStore.status) => {
  fetchOwnTasks(page, size, status);
};

const handleAddTask = async () => {
  await createTask(newTask.value);
  fetchTasks(currentPage.value, pagination.pageSize, taskStore.status);
  isAddTaskModalOpen.value = false;
  isModalOpen.value = true;
};

onMounted(() => {
  fetchTasks()
});

const handlePaginationChange = (paginationConfig) => {
  pagination.pageSize = paginationConfig.pageSize;
  fetchTasks(paginationConfig.current, pagination.pageSize, taskStore.status);
};
const editorOptions = {
  theme: 'snow',
  readOnly: true,
  modules: {
    toolbar: false
  },
};

const proofEditorOptions = {
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
  placeholder: 'Enter work description...'
};
const editTask = (record) => {
  taskDetail.value = {
    id: record.id,
    title: record.title,
    description: record.description,
    dueDate: record.dueDate,
    progress: record.progress || 0,
    timeSpent: record.timeSpent || 0,
    note:  "",
  };
  isTaskDetailModalOpen.value = true;
}
const updateTaskInfo = async (id) => {
  await updateTaskStatus({...taskDetail.value, taskId: id});
  fetchTasks(currentPage.value, pagination.pageSize, taskStore.status);
  isTaskDetailModalOpen.value = false;
}
</script>

<template>
  <div>
    <h2 style="margin-left: 10px">Task List</h2>
    <div
        style="margin-bottom: 16px; display: flex; gap: 10px; align-items: center"
    >
      <a-select
          v-model:value="taskStore.status"
          placeholder="Status"
          style="width: 130px; margin-left: 10px"
          @change="
          fetchTasks(pagination.current, pagination.pageSize, taskStore.status)
        "
      >
        <a-select-option :value="null">All</a-select-option>
        <a-select-option value="PENDING">Pending</a-select-option>
        <a-select-option value="IN PROGRESS">In Progress</a-select-option>
        <a-select-option value="COMPLETED">Completed</a-select-option>
      </a-select>
    </div>

    <a-table
        :dataSource="allTasks"
        :pagination="pagination"
        @change="handlePaginationChange"
        rowKey="id"
        bordered
        :scroll="{ x: 1500, y: 500 }"
    >
      <a-table-column
          title="ID"
          data-index="id"
          key="id"
          width="20"
          fixed="left"
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
      />

      <a-table-column
          title="Due Date"
          data-index="dueDate"
          key="dueDate"
          width="150"
          align="center"
      />
      <a-table-column title="Actions" align="center" fixed="right" :width="200">
        <template #default="{ record }">
          <a-button
              @click="editTask(record)"
              type="text"
              style="
              padding: 2px;
              min-width: auto;
              height: auto;
              margin-left: 7px;
            "
          >
            View
          </a-button>
        </template>
      </a-table-column>
    </a-table>

    <a-modal
        v-model:open="isTaskDetailModalOpen"
        title="Task detail"
        @ok="handleAddTask"
        width="60vw"
    >
      <a-form layout="vertical">
        <a-row>
          <a-col :span="18">
            <a-form-item label="Title">
              <a-input
                  v-model:value="taskDetail.title"
                  placeholder="Enter task title"
                  :disabled="true"

              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="Due Date">
              <a-date-picker
                  :disabled="true"
                  v-model:value="taskDetail.dueDate"
                  placeholder="Select due date"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :disabledDate="(current) => current && current < new Date().setHours(0,0,0,0)"
                  style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <div style="height: 280px">
          <a-form-item label="Description">
            <div style="height: 200px">
              <QuillEditor v-model:content="taskDetail.description" content-type="html" :options="editorOptions"
                           readonly
                           ref="quillEditorRef"/>
            </div>
          </a-form-item>
        </div>

        <a-form-item label="Progress">
          <a-slider v-model:value="taskDetail.progress" :min="0" :max="100" :step="5"/>
        </a-form-item>
        
        <a-form-item label="Time Spent (hours)">
          <a-input-number v-model:value="taskDetail.timeSpent" :min="0" :step="0.5" style="width: 100%"/>
        </a-form-item>
        
        <a-form-item label="Proof of Work">
          <div style="height: 200px">
            <QuillEditor v-model:content="taskDetail.note" content-type="html" :options="proofEditorOptions"
                       ref="quillEditTaskRef"/>
          </div>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button key="back" @click="isTaskDetailModalOpen = false">Cancel</a-button>
        <a-button key="submit" type="primary" @click="updateTaskInfo(taskDetail.id)">Update</a-button>
      </template>
    </a-modal>
  </div>
</template>

<style scoped>
h2 {
  margin-bottom: 16px;
}

.modal-1000px {
  width: 1000px !important;
}
</style>