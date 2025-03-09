<template>
  <div class="project-detail">
    <div class="header">
      <ArrowLeftOutlined class="back-icon" @click="goBack" />
      <h2>Project: {{ project.name }}</h2>

      <a-button
        v-if="!isChosen"
        type="primary"
        class="add-intern-btn"
        @click="handleButtonClick"
      >
        {{ userRole === "INTERN" ? "Choose Project" : "Assign Intern" }}
      </a-button>

      <a-button v-else type="primary" class="add-intern-btn" disabled>
        Chosen
      </a-button>
    </div>

    <div class="info">
      <p><strong>ID:</strong> {{ project.id }}</p>
      <p><strong>Description:</strong> {{ project.description }}</p>
      <p><strong>Tech Stack:</strong> {{ project.techStack }}</p>
      <p><strong>Domain:</strong> {{ project.domain }}</p>
      <p><strong>Start Date:</strong> {{ project.startDate }}</p>
      <p><strong>Due Date:</strong> {{ project.dueDate }}</p>
    </div>

    <h4>Interns:</h4>
    <a-table
      :columns="computedColumns"
      :data-source="project.interns"
      rowKey="id"
      bordered
    >
    </a-table>

    <a-modal v-model:open="isModalOpen" title="Assign Interns" @ok="handleOk">
      <a-select
        v-model:value="selectedInterns"
        mode="multiple"
        placeholder="Select interns"
        style="width: 100%"
      >
        <a-select-option
          v-for="intern in internList"
          :key="intern.id"
          :value="intern.id"
        >
          {{ intern.fullname }} - {{ intern.position }} - {{ intern.phone }} -
          {{ intern.status }}
        </a-select-option>
      </a-select>
    </a-modal>
  </div>
</template>
  
  <script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeftOutlined } from "@ant-design/icons-vue";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { useInternStore } from "@/stores/internStore";

const internStore = useInternStore();
const authStore = useAuthStore();
const userRole = computed(() => authStore.userRole);
const currentIntern = computed(() => internStore.currentIntern);
const router = useRouter();
const projectStore = useProjectStore();
const project = computed(() => projectStore.selectedProject);
const internList = computed(() => projectStore.internsForAssign);
const selectedInterns = ref([]);
const isModalOpen = ref(false);
const { choosePersonalProject } = projectStore;
const isChosen = ref(false);

const goBack = () => {
  router.push("/project");
};

const showModal = () => {
  isModalOpen.value = true;
};

const fetchInterns = async () => {
  if (project.value.type === "PERSONAL") {
    projectStore.fetchInternListForPersonalProject();
  } else {
    projectStore.fetchInternListForCompanyProject();
  }
};

const handleOk = async () => {
  const stage = project.value.type === "PERSONAL" ? "Stage 1" : "Stage 2";

  const assignProjectRequest = {
    projectId: project.value.id,
    internIds: selectedInterns.value,
    stage: stage,
  };

  await projectStore.assignIntern(assignProjectRequest);
  if (selectedInterns.value.length > 0) {
    const selectedInternObjects = internList.value.filter((intern) =>
      selectedInterns.value.includes(intern.id)
    );
    project.value.interns.push(...selectedInternObjects);
  }
  selectedInterns.value = [];
  fetchInterns();
  isModalOpen.value = false;
};

const chooseProject = async () => {
  await choosePersonalProject(project.value.id);
  isChosen.value = true;
  project.value.interns.push(currentIntern.value);
};

const checkIntern = async () => {
  if (
    project.value.interns.some((intern) => intern.id === currentIntern.value.id)
  ) {
    isChosen.value = true;
  }
};

const baseColumns = [
  {
    title: "Full Name",
    dataIndex: "fullname",
    key: "fullname",
  },
  {
    title: "Phone Number",
    dataIndex: "phoneNumber",
    key: "phoneNumber",
  },
  {
    title: "Position",
    dataIndex: "position",
    key: "position",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
];

// Compute columns dynamically based on project type
const computedColumns = computed(() => {
  const columns =
    project.value.type === "COMPANY"
      ? [
          ...baseColumns,
          {
            title: "Mentor",
            dataIndex: "mentor",
            key: "mentor",
          },
        ]
      : [...baseColumns];

  return columns;
});

const handleButtonClick = () => {
  if (userRole.value === "INTERN") {
    chooseProject();
  } else {
    showModal();
  }
};

onMounted(async () => {
  if (userRole.value === "INTERN") {
    await internStore.getCurrent();
  } else {
    fetchInterns();
  }
  checkIntern();
});
</script>
  
  <style scoped>
.project-detail {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.back-icon {
  cursor: pointer;
  font-size: 24px;
}

.add-intern-btn {
  font-size: 14px;
}

.info p {
  margin: 5px 0;
}

.intern-list {
  list-style: none;
  padding: 0;
}

.intern-list li {
  background: #f5f5f5;
  padding: 8px;
  margin: 5px 0;
  border-radius: 5px;
}
</style>
  