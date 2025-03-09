<template>
  <div>
    <h2 class="header-title">Project Management</h2>
    <a-button
      style="background-color: royalblue; color: white; float: right"
      @click="redirectToRequest"
    >
      Request
    </a-button>

    <a-button
      v-if="userRole === 'INTERN' && showChooseProject === true"
      style="
        float: right;
        margin-right: 7px;
        background-color: seagreen;
        color: white;
      "
      @click="choosePP"
    >
      Choose Personal Project
    </a-button>

    <a-button
      v-if="userRole === 'INTERN'"
      style="
        float: right;
        margin-right: 7px;
        background-color: orange;
        color: white;
      "
      @click="showTransferModal"
    >
      Request Transfer Project
    </a-button>

    <a-button
      v-if="userRole === 'MENTOR'"
      style="
        float: right;
        margin-right: 7px;
        background-color: dodgerblue;
        color: white;
      "
      @click="toggleProjectType"
    >
      {{ showCompanyProject ? "Personal Project" : "Company Project" }}
    </a-button>

    <a-button
      v-if="showCompanyProject === true && userRole != 'INTERN'"
      style="
        float: right;
        margin-right: 7px;
        background-color: seagreen;
        color: white;
      "
      @click="showAddProjectModal"
    >
      {{ userRole === "DL" ? "Add Company Project" : "Add Personal Project" }}
    </a-button>

    <a-row gutter="16" style="margin-bottom: 16px">
      <a-col span="9">
        <a-input
          v-model:value="proFilter.techStack"
          placeholder="Tech Stack"
          allowClear
          style="width: 100%"
        />
      </a-col>

      <a-col span="4">
        <a-select
          v-model:value="proFilter.status"
          placeholder="Status"
          allowClear
          style="width: 100%"
        >
          <a-select-option value="Pending">Pending</a-select-option>
          <a-select-option value="On Progress">On Progress</a-select-option>
        </a-select>
      </a-col>

      <a-button type="primary" style="margin-left: 8px" @click="applyFilters"
        >Search</a-button
      >

      <a-button style="margin-left: 8px" @click="resetFilters">Reset</a-button>
    </a-row>

    <a-modal
      v-model:open="addProjectModalOpen"
      title="Add New Project"
      @ok="submitProject(projectForm)"
      @cancel="closeAddProjectModal"
    >
      <template #footer>
        <a-button key="back" @click="closeAddProjectModal">Cancel</a-button>
        <a-button
          key="submit"
          type="primary"
          @click="submitProject(projectForm)"
          >Submit</a-button
        >
      </template>

      <a-form layout="vertical" ref="addProjectForm" :model="projectForm">
        <!-- Project Name -->
        <a-form-item
          label="Project Name"
          name="name"
          :rules="[{ required: true, message: 'Please input project name' }]"
        >
          <a-input
            v-model:value="projectForm.name"
            placeholder="Enter project name"
          />
        </a-form-item>

        <!-- Domain -->
        <a-form-item
          label="Domain"
          name="domain"
          :rules="[{ required: true, message: 'Please input project domain' }]"
        >
          <a-input
            v-model:value="projectForm.domain"
            placeholder="Enter project domain"
          />
        </a-form-item>

        <!-- Tech Stack -->
        <a-form-item
          label="Tech Stack"
          name="techStack"
          :rules="[{ required: true, message: 'Please specify tech stack' }]"
        >
          <a-input
            v-model:value="projectForm.techStack"
            placeholder="Enter tech stack (e.g., Vue, Spring Boot)"
          />
        </a-form-item>

        <!-- Row for Start Date & Due Date -->
        <a-row :gutter="16">
          <!-- Start Date -->
          <a-col :span="12">
            <a-form-item
              label="Start Date"
              name="startDate"
              :rules="[{ required: true, message: 'Please select start date' }]"
            >
              <a-date-picker
                v-model:value="projectForm.startDate"
                placeholder="Select start date"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>

          <!-- Due Date -->
          <a-col :span="12">
            <a-form-item
              label="Due Date"
              name="dueDate"
              :rules="[{ required: true, message: 'Please select due date' }]"
            >
              <a-date-picker
                v-model:value="projectForm.dueDate"
                placeholder="Select due date"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Description" name="description">
          <a-textarea
            v-model:value="projectForm.description"
            placeholder="Enter project description"
            rows="2"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-table
      :data-source="projects"
      :pagination="pagination"
      @change="handlePaginationChange"
      bordered
      row-key="id"
      :scroll="{ x: 1500, y: 500 }"
    >
      <a-table-column
        title="#"
        :dataIndex="'id'"
        :width="70"
        fixed="left"
        align="center"
      />

      <a-table-column
        title="Name"
        :dataIndex="'name'"
        :width="130"
        align="center"
      />

      <a-table-column
        title="Domain"
        :dataIndex="'domain'"
        :width="130"
        align="center"
      />

      <a-table-column
        title="Tech Stack"
        :dataIndex="'techStack'"
        :width="150"
        align="center"
      />

      <a-table-column
        title="Start Date"
        :dataIndex="'startDate'"
        :width="150"
        align="center"
      />

      <a-table-column
        title="Due Date"
        :dataIndex="'dueDate'"
        :width="150"
        align="center"
      />

      <a-table-column
        title="Status"
        :dataIndex="'status'"
        :width="130"
        align="center"
      />

      <a-table-column
        title="Department"
        :dataIndex="'department'"
        :width="130"
        align="center"
      />

      <a-table-column
        title="Type"
        :dataIndex="'type'"
        :width="130"
        fixed="right"
        align="center"
      />

      <a-table-column title="Actions" align="center" fixed="right" :width="170">
        <template v-slot="{ record }">
          <a-button
            @click="redirectToProjectDetail(record)"
            type="text"
            style="padding: 2px; min-width: auto; height: auto"
          >
            <img
              src="@/assets/open-in-browser.png"
              alt="View"
              style="width: 16px; height: 16px"
            />
          </a-button>

          <!-- Edit -->
          <a-button
            @click="editProject(record)"
            type="text"
            style="
              padding: 2px;
              min-width: auto;
              height: auto;
              margin-left: 7px;
            "
          >
            <img
              src="@/assets/edit.png"
              alt="Edit"
              style="width: 16px; height: 16px"
            />
          </a-button>

          <a-button
            @click="deleteDoc(record)"
            type="text"
            style="
              padding: 2px;
              min-width: auto;
              height: auto;
              margin-left: 7px;
            "
          >
            <img
              src="@/assets/delete.png"
              alt="Delete"
              style="width: 15px; height: 15px"
            />
          </a-button>
        </template>
      </a-table-column>
    </a-table>

    <a-modal
      v-model:visible="isBoxVisible"
      title="You currently have a project"
      @cancel="closeModal"
    >
      <p>You currently have a project. Would you like to request a transfer?</p>
      <template #footer>
        <a-button @click="closeBox">Cancel</a-button>
        <a-button type="primary" @click="showTransferModal"
          >Request Transfer Project</a-button
        >
      </template>
    </a-modal>

    <a-modal
      v-model:visible="isTransferVisible"
      title="Can't create transfer request"
    >
      <p>
        You currently dont have any project or status of transfer is pending.
        Please contact your mentor/leader or choose personal project
      </p>
      <template #footer>
        <a-button @click="closeTransfer">Confirm</a-button>
      </template>
    </a-modal>

    <a-modal
      v-model:open="isModalVisible"
      title="Request Transfer Project"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form layout="vertical">
        <!-- Project ID -->
        <a-form-item label="Project ID">
          <a-input v-model:value="projects[0].id" disabled />
        </a-form-item>

        <!-- Project Name -->
        <a-form-item label="Project Name">
          <a-input v-model:value="projects[0].name" disabled />
        </a-form-item>

        <!-- Reason for Transfer -->
        <a-form-item label="Reason for Transfer" required>
          <a-textarea
            v-model:value="form.reason"
            placeholder="Enter your reason..."
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, h } from "vue";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { message, Modal } from "ant-design-vue";

const router = useRouter();
const projectStore = useProjectStore();
const authStore = useAuthStore();

const {
  fetchPersonalProjects,
  fetchCompanyProjects,
  fetchOwnInternProjects,
  fetchInternProjectsForMentor,
  addCompanyProject,
  addPersonalProject,
  createTransfer,
  setSelectedProject,
  fetchOwnProjectTransfer,
} = projectStore;

const projects = computed(() => projectStore.projects);
const currentPage = computed(() => projectStore.currentPage);
const userRole = computed(() => authStore.userRole);
const totalElements = computed(() => projectStore.totalElements);
const internTransfer = computed(() => projectStore.transfers);
const selectedProjects = computed(() => projectStore.selectedProject);
const addProjectForm = ref(null);
const addProjectModalOpen = ref(false);
const projectType = ref("");
const showCompanyProject = ref(true);
const showChooseProject = ref(true);
const isBoxVisible = ref(false);
const isTransferVisible = ref(false);

const proFilter = reactive({
  status: null,
  techStack: null,
  type: null,
});

const isModalVisible = ref(false);

const form = ref({
  reason: null,
});

const showTransferModal = () => {
  const hasPendingTransfer = internTransfer.value?.some(
    (transfer) => transfer.status === "PENDING"
  );

  if (!projects.value || projects.value.length <= 0 || hasPendingTransfer) {
    isTransferVisible.value = true;
  } else {
    isModalVisible.value = true;
  }
};

const applyFilters = () => {
  projectStore.filters = { ...proFilter };
  console.log(proFilter);
  console.log("Applied Filters:", projectStore.filters);
  list(1, pagination.pageSize, projectStore.filters);
};

const resetFilters = () => {
  proFilter.status = null;
  proFilter.type = null;
  proFilter.techStack = null;
  projectStore.filters = { ...proFilter };
  list(1, pagination.pageSize, projectStore.filters);
};

const toggleProjectType = () => {
  showCompanyProject.value = !showCompanyProject.value;
  if (showCompanyProject.value === false) {
    fetchInternProjectsForMentor();
  } else {
    fetchPersonalProjects();
  }
};

const closeBox = () => {
  isBoxVisible.value = false;
};

const closeTransfer = () => {
  isTransferVisible.value = false;
};

const pagination = reactive({
  current: currentPage,
  pageSize: 10,
  total: totalElements,
  pageSizeOptions: ["10", "20", "30"],
  showSizeChanger: true,
  showQuickJumper: true,
});

const projectForm = reactive({
  name: null,
  description: null,
  techStack: null,
  domain: null,
  startDate: null,
  dueDate: null,
});

const redirectToProjectDetail = (project) => {
  setSelectedProject(project);
  router.push({ name: "ProjectDetail", params: { id: project.id } });
};

const redirectToRequest = () => {
  router.push("/project-transfer");
};

const fetchProjectsByRole = () => {
  switch (userRole.value) {
    case "DL":
      fetchCompanyProjects();
      break;
    case "MENTOR":
      fetchPersonalProjects();
      break;
    case "INTERN":
      fetchOwnInternProjects();
      fetchOwnProjectTransfer();
      break;
    default:
      console.warn("Unknown role, no projects fetched");
  }
};

const handleCancel = () => {
  isBoxVisible.value = false;
  isModalVisible.value = false;
  form.value.reason = null;
};

const handlePaginationChange = (paginationConfig) => {
  pagination.pageSize = paginationConfig.pageSize;
  list(paginationConfig.current, pagination.pageSize, projectStore.filters);
};

const showAddProjectModal = () => {
  if (userRole.value === "DL") {
    projectType.value = "COMPANY";
  } else if (userRole.value === "MENTOR") {
    projectType.value = "PERSONAL";
  }
  addProjectModalOpen.value = true;
};

const closeAddProjectModal = () => {
  addProjectForm.value?.resetFields();
  addProjectModalOpen.value = false;
};

const choosePP = () => {
  if (projects.value && projects.value.length > 0) {
    isBoxVisible.value = true;
  } else {
    showChooseProject.value = false;
    fetchPersonalProjects();
  }
};

const handleSubmit = () => {
  if (!form.value.reason.trim()) {
    message.error("Please provide a reason for transfer!");
    return;
  }

  createTransfer(form.value);
  console.log("Transfer Request Submitted:", form.value);

  isModalVisible.value = false;
  form.value.reason = null;

  message.success("Your transfer request has been submitted.");
};

const submitProject = async (project) => {
  try {
    if (projectType.value === "COMPANY") {
      addCompanyProject(project);
    } else if (projectType.value === "PERSONAL") {
      addPersonalProject(project);
    }
    addProjectForm.value?.resetFields();
    addProjectModalOpen.value = false;
  } catch (error) {
    console.error("Error adding project:", error);
  }
};

onMounted(async () => {
  fetchProjectsByRole();
});
</script>

<style scoped>
.header-title {
  margin-left: 5px;
}
</style>
