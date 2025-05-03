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
const router = useRouter();
const selectedInternAddForm = ref(null);
const selectedIntern = ref(null);
const projectStore = useProjectStore();
const authStore = useAuthStore();
const taskStore = useTaskStore();
const internsOfProject = computed(() => taskStore.internsOfProject);
const allTasks = computed(() => taskStore.allTasks);
const ownTasks = computed(() => taskStore.ownTasks);
const currentPage = computed(() => taskStore.currentPage);
const {
  fetchOwnTasks,
  fetchAllTasks,
  setSelectedTask,
  clearSelectedTask,
  fetchInternsOfProject,
  createTask,
  updateTask,
} = taskStore;
const selectedTask = computed(() => taskStore.selectedTask);

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

const redirectToTaskDetail = (task) => {
  setSelectedTask(task);
  router.push({name: "TaskDetail", params: {id: task.id}});
};

const showModal = async (record) => {
  setSelectedTask(record);
  await fetchInternsOfProject(record.id);
  isModalOpen.value = true;
};



const handleAssignTask = async () => {

  await taskStore.assignTask(selectedTask.value.id, Object.values(selectedIntern.value));
  clearSelectedTask();
  selectedIntern.value = null;
  fetchTasks(currentPage.value, pagination.pageSize, taskStore.status);
  isModalOpen.value = false;
};

const handleAddTask = async () => {
  await createTask(newTask.value);
  fetchTasks(currentPage.value, pagination.pageSize, taskStore.status);
  isAddTaskModalOpen.value = false;
  isModalOpen.value = true;
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
const editTask = (record) => {
  // taskDetail.value = {
  //   id: record.id,
  //   title: record.title,
  //   description: record.description,
  //   dueDate: record.dueDate,
  // };
  // isTaskDetailModalOpen.value = true;
  router.push(`/mentor/task/${record.id}`);

}
const updateTaskInfo = async (id) => {
  await updateTask({id: id, ...taskDetail.value});
  fetchTasks(currentPage.value, pagination.pageSize, taskStore.status);
  isTaskDetailModalOpen.value = false;
}
</script>

<template>
  <div>
    <h2 style="margin-left: 10px">Task List</h2>

    <a-button
        v-if="userRole === 'MENTOR'"
        style="
        float: right;
        margin-right: 8px;
        background-color: saddlebrown;
        color: aliceblue;
      "
        @click="showAddTaskModal"
    >Add Task
    </a-button
    >

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
      <a-table-column
          title="Created At"
          data-index="createdAt"
          key="createdAt"
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
            Edit
          </a-button>

          <a-button
              @click="showModal(record)"
              type="text"
              style="
              padding: 2px;
              min-width: auto;
              height: auto;
              margin-left: 7px;
            "
          >
            Assign
          </a-button>

          <a-button
              @click="deleteTask(record)"
              type="text"
              style="
              padding: 2px;
              min-width: auto;
              height: auto;
              margin-left: 7px;
            "
          >
            Delete
          </a-button>
        </template>
      </a-table-column>
    </a-table>

    <a-modal v-model:open="isModalOpen" title="Assign Tasks" @ok="handleAssignTask" class="modal-1000px">
      <a-select
          v-model:value="selectedIntern"
          placeholder="Select Intern"
          style="width: 100%"
          mode="multiple"
      >
        <a-select-option
            v-for="intern in internsOfProject"
            :key="intern.id"
            :value="intern.id"
        >
          {{ intern.fullname }}
        </a-select-option>
      </a-select>
    </a-modal>

    <a-modal
        v-model:open="isAddTaskModalOpen"
        title="Add New Task"
        @ok="handleAddTask"
        width="60vw"
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
        @ok="handleAddTask"
        width="60vw"
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

<style scoped>
h2 {
  margin-bottom: 16px;
}

.modal-1000px {
  width: 1000px !important;
}
</style>