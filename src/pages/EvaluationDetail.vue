<template>
  <div class="container mx-auto p-4">
    <a-card title="Intern Evaluation Details" class="mb-4">

      <!-- Evaluation Summary -->
      <a-descriptions title="Evaluation Summary" bordered :column="2" class="mb-6">
        <a-descriptions-item label="Intern Name">
          {{ formData.internName }}
        </a-descriptions-item>
        <a-descriptions-item label="Mentor">
          {{ formData.mentorName }}
        </a-descriptions-item>
        <a-descriptions-item label="Overall Score">
          <span v-if="String(formData.averageScore) !== '-1'">
            {{ formData.averageScore }}/10
          </span>
          <a-tag v-else color="gray">N/A</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Evaluator">
          {{ formData.mentorName }}
        </a-descriptions-item>
        <a-descriptions-item label="Overall">
          <a-tag v-if="formData.overall" :color="getStatusColor(formData.overall)">
            {{ formData.overall.toUpperCase() }}
          </a-tag>
          <a-tag v-else color="gray">N/A</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Date">
          <span v-if="formData.evaluationDate"> {{ formData.evaluationDate }}</span>
          <a-tag v-else color="gray">N/A</a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <!-- Evaluation Criteria -->
      <a-card title="Evaluation Criteria" class="mb-4">
        <a-table
            :columns="criteriaColumns"
            :data-source="Object.values(criteriaList)"
            :pagination="false"
            row-key="criterion"
        >
          <template #criteria="{ text }">
            <a-form-item :label="text" required/>
          </template>
          <template #score="{ record, text }">
            <a-input-number v-model:value="criteriaList[record.id].score"></a-input-number>
            /10
          </template>
          <template #comments="{ text, record }">
            <a-textarea v-model:value="criteriaList[record.id].comment"></a-textarea>
          </template>
        </a-table>
        <a-divider/>
        <a-form-item label="Overall Assessment" style="margin-top: 12px; margin-bottom: 0;" required>
          <a-select
              v-model:value="formData.overall"
              placeholder="Select status"
              style="width: 100%; font-size: 14px; border: 1px solid #d1d5db; border-radius: 4px; transition: border-color 0.2s, box-shadow 0.2s;"
          >
            <a-select-option value="Excellent">
            <span style="display: flex; align-items: center; gap: 4px;">
              <trophy-outlined style="font-size: 14px; color: #f59e0b;"/>
              Excellent
            </span>
            </a-select-option>
            <a-select-option value="Good">
            <span style="display: flex; align-items: center; gap: 4px;">
              <like-outlined style="font-size: 14px; color: #10b981;"/>
              Good
            </span>
            </a-select-option>
            <a-select-option value="Average">
            <span style="display: flex; align-items: center; gap: 4px;">
              <dashboard-outlined style="font-size: 14px; color: #6b7280;"/>
              Average
            </span>
            </a-select-option>
            <a-select-option value="Poor">
            <span style="display: flex; align-items: center; gap: 4px;">
              <warning-outlined style="font-size: 14px; color: #ef4444;"/>
              Poor
            </span>
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-divider/>
        <a-row justify="end">
          <a-col>
            <a-button type="primary" @click="handleEditEvaluation">
              Edit Evaluation
            </a-button>
          </a-col>
        </a-row>
      </a-card>
    </a-card>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {message} from 'ant-design-vue';
import {
  TrophyOutlined,
  LikeOutlined,
  DashboardOutlined,
  WarningOutlined
} from '@ant-design/icons-vue';
import axiosInstance from "@/plugins/axios.js";

const editModalVisible = ref(false);
const confirmLoading = ref(false);

// Router
const router = useRouter();
const route = useRoute();


const internId = ref(route.params.id);

const evaluation = ref({
  id: 1,
  name: 'John Doe',
  project: 'Web Development',
  score: 85,
  status: 'Excellent',
  evaluator: 'Sarah Connor',
  date: '2025-04-15',
  criteriaList: [
    {criteria: 'Technical Skills', score: 18, comment: 'Strong coding skills, quick to learn frameworks.'},
    {criteria: 'Communication', score: 16, comment: 'Clear in meetings, needs slight improvement in written reports.'},
    {criteria: 'Teamwork', score: 17, comment: 'Collaborates well with peers.'},
    {criteria: 'Problem-Solving', score: 19, comment: 'Innovative solutions to complex issues.'},
    {criteria: 'Initiative', score: 15, comment: ''},
  ],
});
const criteriaList = ref({
  'technicalSkills': {
    id: 'technicalSkills',
    'criteria': 'Technical Skills',
    'score': null,
    'comment': ''
  },
  'communication': {
    id: 'communication',
    'criteria': 'Communication',
    'score': null,
    'comment': ''
  },
  'teamwork': {
    id: 'teamwork',
    'criteria': 'Teamwork',
    'score': null,
    'comment': ''
  },
  problemSolving: {
    id: 'problemSolving',
    'criteria': 'Problem-Solving',
    'score': null,
    'comment': ''
  },
})

// Table Columns for Criteria
const criteriaColumns = [
  {
    title: 'Criterion',
    dataIndex: 'criteria',
    slots: {customRender: 'criteria'},
  },
  {
    title: 'Score',
    dataIndex: 'score',
    key: 'score',
    slots: {customRender: 'score'},
  },
  {
    title: 'Comments',
    dataIndex: 'comments',
    key: 'comments',
    slots: {customRender: 'comments'},
  },
];
const formData = ref({
  "internId": 1,
  "internName": "Lê Quí Long",
  "mentorId": 3,
  "mentorName": "Mentor 1",
  "startDate": "2025-04-14",
  "endDate": "2025-04-18",
  "averageScore": -1.0,
  "overall": null,
  "evaluationDate": ""
})

onMounted(() => {
  axiosInstance.get(`/admin/evaluation?internId=${route.params.id}`)
      .then((response) => {
        formData.value = response.data.data[0];
      })
      .catch((error) => {
        console.error('Error fetching evaluation:', error);
        message.error('Failed to fetch evaluation');
      });
})

// Form State for Editing
const formState = ref({...evaluation.value});

const overallScore = computed(() => {
  return formState.value.criteria.reduce((sum, crit) => sum + crit.score, 0);
});

// Methods
const goBack = () => {
  router.push('/evaluations'); // Adjust route as needed
};

const showEditModal = () => {
  console.log(criteriaList.value);
};

const handleEditEvaluation = async () => {
  try {
    axiosInstance.put(`/mentors/evaluate`, {
      internId: formData.value.internId,
      criteriaList: Object.values(criteriaList.value),
      overall: formData.value.overall,
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