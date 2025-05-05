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
        width="700px"
        :body-style="{ padding: '16px', background: '#f9fafb' }"
    >
      <template #title>
        <div style="font-size: 18px; font-weight: 600; color: #ffffff; padding: 12px 16px; background: linear-gradient(90deg, #1e40af, #3b82f6); border-radius: 6px 6px 0 0;">
          Edit Evaluation
        </div>
      </template>
      <a-form
          :model="formState"
          :rules="formRules"
          layout="vertical"
          ref="formRef"
          style="padding: 0 12px;"
      >
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <a-form-item label="Intern Name" name="name" style="margin-bottom: 12px;">
            <a-input
                v-model:value="formState.name"
                placeholder="Enter intern name"
                disabled
                style="padding: 6px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 4px; background: #e5e7eb; transition: border-color 0.2s;"
            />
          </a-form-item>
          <a-form-item label="Mentor" name="evaluator" style="margin-bottom: 12px;">
            <a-input
                v-model:value="formState.evaluator"
                placeholder="Enter evaluator name"
                disabled
                style="padding: 6px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 4px; background: #e5e7eb; transition: border-color 0.2s;"
            />
          </a-form-item>
        </div>
        <div style="margin-top: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0;">Evaluation Criteria</h3>
            <span style="font-size: 12px; color: #6b7280;">Score range: 0-10</span>
          </div>
          <a-form-item
              v-for="(criterion, index) in formState.criteriaList"
              :key="criterion.criteria"
              :label="criterion.criteria"
              :name="['criteria', criterion.criteria, 'score']"
              style="margin-bottom: 12px;"
          >
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <a-input-number
                    v-model:value="criterion.score"
                    :min="0"
                    :max="10"
                    placeholder="Score"
                    style="width: 80px; padding: 4px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 4px; transition: border-color 0.2s, box-shadow 0.2s;"
                />
                <div style="font-size: 12px; color: #4b5563; width: 40px; text-align: right;">
                  {{ criterion.score }}/10
                </div>
              </div>
              <a-progress
                  :percent="criterion.score * 10"
                  :showInfo="false"
                  style="margin: 4px 0; height: 6px;"
              />
              <a-textarea
                  v-model:value="criterion.comment"
                  placeholder="Add comments (optional)"
                  :rows="2"
                  style="padding: 6px; font-size: 14px; border: 1px solid #d1d5db; border-radius: 4px; resize: vertical; transition: border-color 0.2s, box-shadow 0.2s;"
              />
            </div>
            <a-divider v-if="index < formState.criteriaList.length - 1" style="margin: 8px 0; border-color: #e5e7eb;" />
          </a-form-item>
        </div>
        <a-form-item label="Overall Assessment" name="status" style="margin-top: 12px; margin-bottom: 0;">
          <a-select
              v-model:value="formState.status"
              placeholder="Select status"
              style="width: 100%; font-size: 14px; border: 1px solid #d1d5db; border-radius: 4px; transition: border-color 0.2s, box-shadow 0.2s;"
          >
            <a-select-option value="Excellent">
            <span style="display: flex; align-items: center; gap: 4px;">
              <trophy-outlined style="font-size: 14px; color: #f59e0b;" />
              Excellent
            </span>
            </a-select-option>
            <a-select-option value="Good">
            <span style="display: flex; align-items: center; gap: 4px;">
              <like-outlined style="font-size: 14px; color: #10b981;" />
              Good
            </span>
            </a-select-option>
            <a-select-option value="Average">
            <span style="display: flex; align-items: center; gap: 4px;">
              <dashboard-outlined style="font-size: 14px; color: #6b7280;" />
              Average
            </span>
            </a-select-option>
            <a-select-option value="Poor">
            <span style="display: flex; align-items: center; gap: 4px;">
              <warning-outlined style="font-size: 14px; color: #ef4444;" />
              Poor
            </span>
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; border-top: 1px solid #e5e7eb; background: #ffffff;">
          <a-button
              @click="editModalVisible = false"
              style="padding: 4px 12px; font-size: 14px; color: #4b5563; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; transition: background 0.2s;"
          >
            Cancel
          </a-button>
          <a-button
              type="primary"
              @click="handleEditEvaluation"
              :loading="confirmLoading"
          >
            Save
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  LeftOutlined,
  EditOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import {
  UserOutlined,
  TeamOutlined,
  TrophyOutlined,
  LikeOutlined,
  DashboardOutlined,
  WarningOutlined
} from '@ant-design/icons-vue';
import axiosInstance from "@/plugins/axios.js";
// Modal and Form Refs
const editModalVisible = ref(true);
const confirmLoading = ref(false);
const formRef = ref(null);

// Router
const router = useRouter();
const route = useRoute();



const internId = ref(route.params.id);

// Mock Data (Single Evaluation)
const evaluation = ref({
  id: 1,
  name: 'John Doe',
  project: 'Web Development',
  score: 85,
  status: 'Excellent',
  evaluator: 'Sarah Connor',
  date: '2025-04-15',
  criteriaList: [
    { criteria: 'Technical Skills', score: 18, comment: 'Strong coding skills, quick to learn frameworks.' },
    { criteria: 'Communication', score: 16, comment: 'Clear in meetings, needs slight improvement in written reports.' },
    { criteria: 'Teamwork', score: 17, comment: 'Collaborates well with peers.' },
    { criteria: 'Problem-Solving', score: 19, comment: 'Innovative solutions to complex issues.' },
    { criteria: 'Initiative', score: 15, comment: '' },
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
    // await formRef.value.validate();
    // confirmLoading.value = true;
    // // Simulate API call
    // setTimeout(() => {
    //   evaluation.value = {
    //     ...formState.value,
    //     score: overallScore.value,
    //   };

      axiosInstance.put(`/mentors/evaluate`, {
        internId: internId.value,
        criteriaList: formState.value.criteriaList,
      }).then((response) => {
        if (response.status === 200) {
          message.success('Evaluation updated successfully');
        }
      }).catch((error) => {
        console.error('Error updating evaluation:', error);
        message.error('Failed to update evaluation');
      });

      message.success('Evaluation updated successfully');
      // editModalVisible.value = false;
      // confirmLoading.value = false;
      // formRef.value.resetFields();
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

:deep(.evaluation-modal .ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.evaluation-modal .ant-modal-header) {
  padding: 16px 24px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
}

:deep(.evaluation-modal .ant-modal-title) {
  font-size: 18px;
  font-weight: 600;
}

.criteria-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
}

.criteria-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.criterion-item {
  background-color: white;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 2px;
}

.criterion-content {
  display: flex;
  flex-direction: column;
}

.score-section {
  max-width: 150px;
}

@media (min-width: 768px) {
  .score-input {
    width: 120px !important;
  }
}

</style>