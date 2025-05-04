<template>
  <div class="container mx-auto p-4">
    <a-card title="Intern Evaluation Management" class="mb-4">
      <div class="flex justify-between mb-4">
        <a-button type="primary" @click="showAddModal">
          <plus-outlined /> Add Evaluation
        </a-button>
        <a-input-search
            v-model:value="searchText"
            placeholder="Search by intern name..."
            style="width: 200px"
            @search="onSearch"
        />
      </div>

      <a-table
          :columns="columns"
          :data-source="dataSource"
          :pagination="{ pageSize: 10 }"
          :loading="loading"
          row-key="id"
      >
        <template #status="{ text }">
          <a-tag :color="getStatusColor(text)">
            {{ text.toUpperCase() }}
          </a-tag>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="link" @click="viewEvaluation(record)">
              <eye-outlined /> View
            </a-button>
            <a-button type="link" @click="editEvaluation(record)">
              <edit-outlined /> Edit
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- Add Evaluation Modal -->
    <a-modal
        v-model:visible="addModalVisible"
        title="Add New Evaluation"
        @ok="handleAddEvaluation"
        :confirm-loading="confirmLoading"
    >
      <a-form
          :model="formState"
          :rules="formRules"
          layout="vertical"
          ref="formRef"
      >
        <a-form-item label="Intern Name" name="name">
          <a-input v-model:value="formState.name" placeholder="Enter intern name" />
        </a-form-item>
        <a-form-item label="Project" name="project">
          <a-input v-model:value="formState.project" placeholder="Enter project name" />
        </a-form-item>
        <a-form-item label="Score" name="score">
          <a-input-number
              v-model:value="formState.score"
              :min="0"
              :max="100"
              placeholder="Enter score (0-100)"
              style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="Status" name="status">
          <a-select v-model:value="formState.status" placeholder="Select status">
            <a-select-option value="Excellent">Excellent</a-select-option>
            <a-select-option value="Good">Good</a-select-option>
            <a-select-option value="Average">Average</a-select-option>
            <a-select-option value="Poor">Poor</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// Mock Data
const dataSource = ref([
  {
    id: 1,
    name: 'John Doe',
    project: 'Web Development',
    score: 85,
    status: 'Excellent',
  },
  {
    id: 2,
    name: 'Jane Smith',
    project: 'Data Analysis',
    score: 78,
    status: 'Good',
  },
  {
    id: 3,
    name: 'Alice Johnson',
    project: 'Mobile App',
    score: 65,
    status: 'Average',
  },
  {
    id: 4,
    name: 'Bob Brown',
    project: 'AI Research',
    score: 92,
    status: 'Excellent',
  },
  {
    id: 5,
    name: 'Emma Davis',
    project: 'UI/UX Design',
    score: 55,
    status: 'Poor',
  },
]);

// Table Columns
const columns = [
  {
    title: 'Intern Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: 'Mentor Name',
    dataIndex: 'project',
    key: 'project',
  },
  {
    title: 'Start date',
    dataIndex: 'project',
    key: 'project',
  },
  {
    title: 'End date',
    dataIndex: 'project',
    key: 'project',
  },

  {
    title: 'Score',
    dataIndex: 'score',
    key: 'score',
    sorter: (a, b) => a.score - b.score,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    filters: [
      { text: 'Excellent', value: 'Excellent' },
      { text: 'Good', value: 'Good' },
      { text: 'Average', value: 'Average' },
      { text: 'Poor', value: 'Poor' },
    ],
    onFilter: (value, record) => record.status === value,
    slots: { customRender: 'status' },
  },
  {
    title: 'Actions',
    key: 'action',
    slots: { customRender: 'action' },
  },
];

// Form State
const formState = ref({
  name: '',
  project: '',
  score: null,
  status: '',
});

// Form Rules
const formRules = {
  name: [{ required: true, message: 'Please enter intern name' }],
  project: [{ required: true, message: 'Please enter project name' }],
  score: [
    { required: true, message: 'Please enter score' },
    { type: 'number', min: 0, max: 100, message: 'Score must be between 0 and 100' },
  ],
  status: [{ required: true, message: 'Please select status' }],
};

// Modal and Form Refs
const addModalVisible = ref(false);
const confirmLoading = ref(false);
const formRef = ref(null);
const searchText = ref('');
const loading = ref(false);

// Computed for Filtered Data
const filteredData = computed(() => {
  if (!searchText.value) return dataSource.value;
  return dataSource.value.filter((item) =>
      item.name.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// Methods
const showAddModal = () => {
  addModalVisible.value = true;
  formState.value = { name: '', project: '', score: null, status: '' }; // Reset form
};

const handleAddEvaluation = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    // Simulate API call
    setTimeout(() => {
      dataSource.value.push({
        id: dataSource.value.length + 1,
        ...formState.value,
      });
      message.success('Evaluation added successfully');
      addModalVisible.value = false;
      confirmLoading.value = false;
      formRef.value.resetFields();
    }, 1000);
  } catch (error) {
    message.error('Please fill in all required fields');
    confirmLoading.value = false;
  }
};

const viewEvaluation = (record) => {
  message.info(`Viewing evaluation for ${record.name}`);
  // Add navigation or modal logic here
};

const editEvaluation = (record) => {
  message.info(`Editing evaluation for ${record.name}`);
  // Add edit modal or navigation logic here
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Excellent':
      return 'green';
    case 'Good':
      return 'blue';
    case 'Average':
      return 'orange';
    case 'Poor':
      return 'red';
    default:
      return 'gray';
  }
};

const onSearch = () => {
  // Triggered when search is performed
};
</script>

<style scoped>
/* Tailwind CSS for additional styling */
.container {
  @apply max-w-7xl;
}

/* Ant Design Vue overrides */
:deep(.ant-card) {
  @apply shadow-lg rounded-lg;
}

:deep(.ant-table) {
  @apply bg-white rounded-lg;
}

:deep(.ant-btn-link) {
  @apply text-blue-600 hover:text-blue-800;
}
</style>
<!--<template>-->
<!--  <div>-->
<!--    <h2 style="margin-left: 10px">Evaluations</h2>-->

<!--    <a-button-->
<!--        v-if="userRole === 'MENTOR'"-->
<!--        style="float: right; margin-right: 8px; background-color: saddlebrown; color: aliceblue;"-->
<!--        @click="showModal"-->
<!--    >-->
<!--      Add Evaluation-->
<!--    </a-button>-->

<!--    <div style="margin-bottom: 16px; display: flex; gap: 10px; align-items: center">-->
<!--      <a-select-->
<!--          v-model:value="evaluationStore.status"-->
<!--          placeholder="Status"-->
<!--          style="width: 130px; margin-left: 10px"-->
<!--          @change="fetchEvaluations(pagination.current, pagination.pageSize)"-->
<!--      >-->
<!--        <a-select-option value="PENDING">Pending</a-select-option>-->
<!--        <a-select-option value="COMPLETED">Completed</a-select-option>-->
<!--      </a-select>-->
<!--    </div>-->

<!--    <a-table-->
<!--        :dataSource="evaluations"-->
<!--        :pagination="pagination"-->
<!--        @change="handlePaginationChange"-->
<!--        rowKey="id"-->
<!--        bordered-->
<!--        :scroll="{ x: 1500, y: 500 }"-->
<!--    >-->
<!--      <a-table-column-->
<!--          title="ID"-->
<!--          data-index="id"-->
<!--          key="id"-->
<!--          width="20"-->
<!--          fixed="left"-->
<!--          align="center"-->
<!--      />-->
<!--      <a-table-column-->
<!--          title="Intern"-->
<!--          data-index="internName"-->
<!--          key="internName"-->
<!--          width="150"-->
<!--          align="center"-->
<!--      />-->
<!--      <a-table-column-->
<!--          title="Mentor"-->
<!--          data-index="mentorName"-->
<!--          key="mentorName"-->
<!--          width="150"-->
<!--          align="center"-->
<!--      />-->
<!--      <a-table-column-->
<!--          title="Score"-->
<!--          data-index="score"-->
<!--          key="score"-->
<!--          width="100"-->
<!--          align="center"-->
<!--      />-->
<!--      <a-table-column-->
<!--          title="Feedback"-->
<!--          data-index="feedback"-->
<!--          key="feedback"-->
<!--          width="200"-->
<!--          align="center"-->
<!--      />-->
<!--      <a-table-column-->
<!--          title="Status"-->
<!--          data-index="status"-->
<!--          key="status"-->
<!--          width="130"-->
<!--          align="center"-->
<!--      />-->
<!--      <a-table-column title="Actions" align="center" fixed="right" :width="170">-->
<!--        <template #default="{ record }">-->
<!--          <a-button-->
<!--              v-if="userRole === 'MENTOR'"-->
<!--              @click="showModal(record)"-->
<!--              type="text"-->
<!--              style="padding: 2px; min-width: auto; height: auto"-->
<!--          >-->
<!--            <img src="@/assets/edit.png" alt="Edit" style="width: 16px; height: 16px" />-->
<!--          </a-button>-->
<!--          <a-button-->
<!--              v-if="userRole === 'MENTOR'"-->
<!--              @click="handleDelete(record)"-->
<!--              type="text"-->
<!--              style="padding: 2px; min-width: auto; height: auto; margin-left: 7px"-->
<!--          >-->
<!--            <img src="@/assets/delete.png" alt="Delete" style="width: 15px; height: 15px" />-->
<!--          </a-button>-->
<!--        </template>-->
<!--      </a-table-column>-->
<!--    </a-table>-->

<!--    <a-modal v-model:open="isModalOpen" title="Evaluation" @ok="handleOk">-->
<!--      <a-form layout="vertical">-->
<!--        <a-form-item label="Intern" required>-->
<!--          <a-select v-model:value="newEvaluation.internId" placeholder="Select Intern">-->
<!--            <a-select-option-->
<!--                v-for="intern in evaluationStore.interns"-->
<!--                :key="intern.id"-->
<!--                :value="intern.id"-->
<!--            >-->
<!--              {{ intern.fullname }} - {{ intern.position }}-->
<!--            </a-select-option>-->
<!--          </a-select>-->
<!--        </a-form-item>-->

<!--        <a-form-item label="Mentor" required>-->
<!--          <a-select v-model:value="newEvaluation.mentorId" placeholder="Select Mentor">-->
<!--            <a-select-option-->
<!--                v-for="mentor in evaluationStore.mentors"-->
<!--                :key="mentor.id"-->
<!--                :value="mentor.id"-->
<!--            >-->
<!--              {{ mentor.fullname }} - {{ mentor.position }}-->
<!--            </a-select-option>-->
<!--          </a-select>-->
<!--        </a-form-item>-->

<!--        <a-form-item label="Score" required>-->
<!--          <a-input-number v-model:value="newEvaluation.score" :min="1" :max="5" />-->
<!--        </a-form-item>-->

<!--        <a-form-item label="Feedback">-->
<!--          <a-textarea v-model:value="newEvaluation.feedback" placeholder="Enter feedback" />-->
<!--        </a-form-item>-->
<!--      </a-form>-->
<!--    </a-modal>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import {ref, onMounted, computed, reactive} from "vue";-->
<!--import { useAuthStore } from "@/stores/authStore";-->
<!--import { useEvaluationStore } from "@/stores/evaluationStore";-->
<!--import { useRouter } from "vue-router";-->

<!--const isModalOpen = ref(false);-->
<!--const selectedIntern = ref(null);-->
<!--const evaluationStore = useEvaluationStore();-->
<!--const authStore = useAuthStore();-->
<!--const router = useRouter();-->

<!--const userRole = computed(() => authStore.userRole);-->
<!--const evaluations = computed(() => evaluationStore.evaluations);-->
<!--const selectedEvaluation = computed(() => evaluationStore.selectedEvaluation);-->
<!--const pagination = reactive({-->
<!--  current: 1,-->
<!--  pageSize: 10,-->
<!--  total: 0,-->
<!--});-->

<!--const {-->
<!--  fetchEvaluations,-->
<!--  setSelectedEvaluation,-->
<!--  createEvaluation,-->
<!--  updateEvaluation,-->
<!--  deleteEvaluation,-->
<!--} = evaluationStore;-->

<!--const newEvaluation = ref({-->
<!--  internId: null,-->
<!--  mentorId: null,-->
<!--  taskId: null,-->
<!--  score: null,-->
<!--  feedback: "",-->
<!--});-->

<!--const showModal = (evaluation) => {-->
<!--  setSelectedEvaluation(evaluation);-->
<!--  isModalOpen.value = true;-->
<!--};-->

<!--const handleOk = async () => {-->
<!--  if (selectedEvaluation.value) {-->
<!--    await updateEvaluation(selectedEvaluation.value);-->
<!--  } else {-->
<!--    await createEvaluation(newEvaluation.value);-->
<!--  }-->
<!--  fetchEvaluations(pagination.current, pagination.pageSize);-->
<!--  isModalOpen.value = false;-->
<!--};-->

<!--const handleDelete = async (evaluation) => {-->
<!--  await deleteEvaluation(evaluation.id);-->
<!--  fetchEvaluations(pagination.current, pagination.pageSize);-->
<!--};-->

<!--const handlePaginationChange = (paginationConfig) => {-->
<!--  pagination.pageSize = paginationConfig.pageSize;-->
<!--  fetchEvaluations(paginationConfig.current, pagination.pageSize);-->
<!--};-->

<!--onMounted(() => {-->
<!--  fetchEvaluations(pagination.current, pagination.pageSize);-->
<!--});-->
<!--</script>-->

<!--<style scoped>-->
<!--h2 {-->
<!--  margin-bottom: 16px;-->
<!--}-->
<!--</style>-->
