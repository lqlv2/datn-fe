<template>
  <div class="evaluation-container">
    <a-card title="Intern Evaluation Details" class="evaluation-card">

      <!-- Evaluation Summary -->
      <a-descriptions title="Evaluation Summary" bordered :column="2" class="evaluation-summary mb-6">
        <a-descriptions-item label="Intern Name">
          {{ formData.internName }}
        </a-descriptions-item>
        <a-descriptions-item label="Mentor">
          {{ formData.mentorName }}
        </a-descriptions-item>
        <a-descriptions-item label="Overall Score">
          <span v-if="String(formData.averageScore) !== '-1'" class="score-value">
            {{ formData.averageScore }}/10
          </span>
          <a-tag v-else color="gray">N/A</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Evaluator">
          {{ formData.mentorName }}
        </a-descriptions-item>
        <a-descriptions-item label="Overall">
          <a-tag v-if="formData.overall" :color="getStatusColor(formData.overall)" class="status-tag">
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
      <a-card title="Evaluation Criteria" class="criteria-card">
        <a-table
            :columns="criteriaColumns"
            :data-source="Object.values(criteriaList)"
            :pagination="false"
            row-key="criterion"
            class="criteria-table"
        >
          <template #criteria="{ text }">
            <a-form-item :label="text" required class="criteria-label"/>
          </template>
          <template #score="{ record }">
            <div class="score-input-container">
              <a-input-number v-model:value="criteriaList[record.id].score"
                            :disabled="getCurrentUserRole() !== ROLES.MENTOR"
                            class="score-input"></a-input-number>
              <span class="score-max">/10</span>
            </div>
          </template>
          <template #comments="{record }">
            <a-textarea v-model:value="criteriaList[record.id].comment"
                        :disabled="getCurrentUserRole() !== ROLES.MENTOR"
                        class="comment-textarea"></a-textarea>
          </template>
        </a-table>
        <a-divider class="criteria-divider"/>
        <a-form-item label="Overall Assessment" class="overall-assessment" required>
          <a-select
              v-model:value="formData.overall"
              placeholder="Select status"
              class="overall-select"
              :disabled="getCurrentUserRole() !== ROLES.MENTOR"
          >
            <a-select-option value="Excellent">
            <span class="assessment-option">
              <trophy-outlined class="assessment-icon excellent-icon"/>
              Excellent
            </span>
            </a-select-option>
            <a-select-option value="Good">
            <span class="assessment-option">
              <like-outlined class="assessment-icon good-icon"/>
              Good
            </span>
            </a-select-option>
            <a-select-option value="Average">
            <span class="assessment-option">
              <dashboard-outlined class="assessment-icon average-icon"/>
              Average
            </span>
            </a-select-option>
            <a-select-option value="Poor">
            <span class="assessment-option">
              <warning-outlined class="assessment-icon poor-icon"/>
              Poor
            </span>
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-divider class="criteria-divider"/>
        <a-row justify="end">
          <a-col v-if="getCurrentUserRole() === ROLES.MENTOR">
            <a-button type="primary" @click="handleEditEvaluation" class="edit-button">
              Edit Evaluation
            </a-button>
          </a-col>
        </a-row>
      </a-card>
    </a-card>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import {useRoute} from 'vue-router';
import {message} from 'ant-design-vue';
import {DashboardOutlined, LikeOutlined, TrophyOutlined, WarningOutlined} from '@ant-design/icons-vue';
import axiosInstance from "@/plugins/axios.js";
import {getCurrentUserRole, ROLES} from "@/util/Functions.js";

const confirmLoading = ref(false);

// Router
const route = useRoute();
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
  fetchEvaluationDetails(route.params.id);
})

const fetchEvaluationDetails = async (internId) => {
  axiosInstance.get(`/admin/evaluation?internId=${internId}`)
      .then((response) => {
        formData.value = response.data.data[0];
        response.data.data[0].evaluationCriteriaList && response.data.data[0].evaluationCriteriaList.forEach((item) => {
          criteriaList.value[criteriaMap[item.criteriaName]].score = item.score;
          criteriaList.value[criteriaMap[item.criteriaName]].comment = item.comment;
        });
      }).catch((error) => {
    console.error('Error fetching evaluation:', error);
    message.error('Failed to fetch evaluation');
  });
};

const criteriaMap = {
  "Technical Skills": "technicalSkills",
  "Communication": "communication",
  "Teamwork": "teamwork",
  "Problem-Solving": "problemSolving",
  "Initiative": "initiative",
}

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
  } catch (error) {
    message.error('Please fill in all required fields');
    confirmLoading.value = false;
  } finally {
    setTimeout(() => fetchEvaluationDetails(route.params.id), 2000);
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

/* Enhanced styling */
.evaluation-container {
  @apply max-w-7xl mx-auto p-4;
  background-color: #f9fafb;
  min-height: calc(100vh - 64px);
}

.evaluation-card {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.evaluation-summary :deep(.ant-descriptions-header) {
  margin-bottom: 16px;
}

.evaluation-summary :deep(.ant-descriptions-title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.evaluation-summary :deep(.ant-descriptions-item-label) {
  font-weight: 500;
  background-color: #f3f4f6;
}

.score-value {
  font-weight: 600;
  color: #1f2937;
}

.status-tag {
  font-weight: 500;
  padding: 2px 8px;
}

.criteria-card {
  margin-top: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}

.criteria-card :deep(.ant-card-head) {
  background-color: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
}

.criteria-card :deep(.ant-card-head-title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.criteria-table :deep(.ant-table-thead > tr > th) {
  background-color: #f3f4f6;
  font-weight: 600;
  color: #374151;
}

.criteria-table :deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
}

.criteria-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f9fafb;
}

.criteria-label :deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #374151;
}

.score-input-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-input {
  width: 80px;
}

.score-max {
  color: #6b7280;
  font-weight: 500;
}

.comment-textarea {
  min-height: 80px;
  border-radius: 4px;
}

.comment-textarea:hover {
  border-color: #60a5fa;
}

.criteria-divider {
  margin: 16px 0;
}

.overall-assessment {
  margin-top: 12px;
  margin-bottom: 16px;
}

.overall-assessment :deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #374151;
}

.overall-select {
  width: 100%;
  font-size: 14px;
  border-radius: 4px;
}

.assessment-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assessment-icon {
  font-size: 16px;
}

.excellent-icon {
  color: #f59e0b;
}

.good-icon {
  color: #10b981;
}

.average-icon {
  color: #6b7280;
}

.poor-icon {
  color: #ef4444;
}

.edit-button {
  font-weight: 500;
  height: 36px;
  padding: 0 16px;
  border-radius: 4px;
}
</style>