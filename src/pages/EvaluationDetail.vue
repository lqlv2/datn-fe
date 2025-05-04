<template>
  <div class="container mx-auto p-4">
    <a-card title="Intern Evaluation Details" class="mb-4">
      <!-- Header with Back Button -->
      <div class="flex justify-between mb-4">
        <a-button @click="goBack">
          <left-outlined /> Back to List
        </a-button>
        <a-button type="primary" @click="showEditModal">
          <edit-outlined /> Edit Evaluation
        </a-button>
      </div>

      <!-- Evaluation Summary -->
      <a-descriptions title="Evaluation Summary" bordered :column="2" class="mb-6">
        <a-descriptions-item label="Intern Name">
          {{ evaluation.name }}
        </a-descriptions-item>
        <a-descriptions-item label="Project">
          {{ evaluation.project }}
        </a-descriptions-item>
        <a-descriptions-item label="Overall Score">
          <a-progress
              :percent="evaluation.score"
              :format="(percent) => `${percent}/100`"
              status="active"
          />
        </a-descriptions-item>
        <a-descriptions-item label="Status">
          <a-tag :color="getStatusColor(evaluation.status)">
            {{ evaluation.status.toUpperCase() }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Evaluator">
          {{ evaluation.evaluator }}
        </a-descriptions-item>
        <a-descriptions-item label="Date">
          {{ evaluation.date }}
        </a-descriptions-item>
      </a-descriptions>

      <!-- Evaluation Criteria -->
      <a-card title="Evaluation Criteria" class="mb-4">
        <a-table
            :columns="criteriaColumns"
            :data-source="evaluation.criteria"
            :pagination="false"
            row-key="criterion"
        >
          <template #score="{ text }">
            <a-progress
                :percent="text * 5"
                :format="() => `${text}/20`"
                size="small"
                status="active"
            />
          </template>
          <template #comments="{ text }">
            {{ text || 'No comments provided' }}
          </template>
        </a-table>
      </a-card>
    </a-card>

    <!-- Edit Evaluation Modal -->
    <a-modal
        v-model:visible="editModalVisible"
        title="Edit Evaluation"
        @ok="handleEditEvaluation"
        :confirm-loading="confirmLoading"
        width="600px"
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
        <a-form-item label="Evaluator" name="evaluator">
          <a-input v-model:value="formState.evaluator" placeholder="Enter evaluator name" />
        </a-form-item>
        <a-form-item label="Status" name="status">
          <a-select v-model:value="formState.status" placeholder="Select status">
            <a-select-option value="Excellent">Excellent</a-select-option>
            <a-select-option value="Good">Good</a-select-option>
            <a-select-option value="Average">Average</a-select-option>
            <a-select-option value="Poor">Poor</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
            v-for="criterion in formState.criteria"
            :key="criterion.criterion"
            :label="criterion.criterion"
            :name="['criteria', criterion.criterion, 'score']"
        >
          <a-input-number
              v-model:value="criterion.score"
              :min="0"
              :max="20"
              placeholder="Score (0-20)"
              style="width: 100%"
          />
          <a-textarea
              v-model:value="criterion.comments"
              placeholder="Add comments (optional)"
              :rows="2"
              class="mt-2"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  LeftOutlined,
  EditOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// Mock Data (Single Evaluation)
const evaluation = ref({
  id: 1,
  name: 'John Doe',
  project: 'Web Development',
  score: 85,
  status: 'Excellent',
  evaluator: 'Sarah Connor',
  date: '2025-04-15',
  criteria: [
    { criterion: 'Technical Skills', score: 18, comments: 'Strong coding skills, quick to learn frameworks.' },
    { criterion: 'Communication', score: 16, comments: 'Clear in meetings, needs slight improvement in written reports.' },
    { criterion: 'Teamwork', score: 17, comments: 'Collaborates well with peers.' },
    { criterion: 'Problem-Solving', score: 19, comments: 'Innovative solutions to complex issues.' },
    { criterion: 'Initiative', score: 15, comments: '' },
  ],
});

// Table Columns for Criteria
const criteriaColumns = [
  {
    title: 'Criterion',
    dataIndex: 'criterion',
    key: 'criterion',
  },
  {
    title: 'Score',
    dataIndex: 'score',
    key: 'score',
    slots: { customRender: 'score' },
  },
  {
    title: 'Comments',
    dataIndex: 'comments',
    key: 'comments',
    slots: { customRender: 'comments' },
  },
];

// Form State for Editing
const formState = ref({ ...evaluation.value });

// Form Rules
const formRules = {
  name: [{ required: true, message: 'Please enter intern name' }],
  project: [{ required: true, message: 'Please enter project name' }],
  evaluator: [{ required: true, message: 'Please enter evaluator name' }],
  status: [{ required: true, message: 'Please select status' }],
  criteria: {
    'Technical Skills': {
      score: [
        { required: true, message: 'Please enter score' },
        { type: 'number', min: 0, max: 20, message: 'Score must be between 0 and 20' },
      ],
    },
    Communication: {
      score: [
        { required: true, message: 'Please enter score' },
        { type: 'number', min: 0, max: 20, message: 'Score must be between 0 and 20' },
      ],
    },
    Teamwork: {
      score: [
        { required: true, message: 'Please enter score' },
        { type: 'number', min: 0, max: 20, message: 'Score must be between 0 and 20' },
      ],
    },
    'Problem-Solving': {
      score: [
        { required: true, message: 'Please enter score' },
        { type: 'number', min: 0, max: 20, message: 'Score must be between 0 and 20' },
      ],
    },
    Initiative: {
      score: [
        { required: true, message: 'Please enter score' },
        { type: 'number', min: 0, max: 20, message: 'Score must be between 0 and 20' },
      ],
    },
  },
};

// Modal and Form Refs
const editModalVisible = ref(false);
const confirmLoading = ref(false);
const formRef = ref(null);

// Router
const router = useRouter();

// Computed for Overall Score
const overallScore = computed(() => {
  return formState.value.criteria.reduce((sum, crit) => sum + crit.score, 0);
});

// Methods
const goBack = () => {
  router.push('/evaluations'); // Adjust route as needed
};

const showEditModal = () => {
  formState.value = {
    ...evaluation.value,
    criteria: evaluation.value.criteria.map((crit) => ({ ...crit })),
  }; // Deep copy
  editModalVisible.value = true;
};

const handleEditEvaluation = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;
    // Simulate API call
    setTimeout(() => {
      evaluation.value = {
        ...formState.value,
        score: overallScore.value,
      };
      message.success('Evaluation updated successfully');
      editModalVisible.value = false;
      confirmLoading.value = false;
      formRef.value.resetFields();
    }, 1000);
  } catch (error) {
    message.error('Please fill in all required fields');
    confirmLoading.value = false;
  }
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

:deep(.ant-progress) {
  @apply w-full;
}
</style>