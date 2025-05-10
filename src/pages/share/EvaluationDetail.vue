<template>
  <div class="evaluation-detail">
    <div class="page-header">
      <h2 class="header-title">Intern Evaluation Details</h2>
    </div>
    
    <div class="content-container">
      <!-- Evaluation Summary -->
      <a-card class="summary-card" title="Evaluation Summary">
        <a-descriptions bordered :column="{ xs: 1, sm: 2 }" class="evaluation-summary">
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
      </a-card>

      <!-- Evaluation Criteria -->
      <a-card class="criteria-card" title="Evaluation Criteria">
        <a-table
            :columns="criteriaColumns"
            :data-source="Object.values(criteriaList)"
            :pagination="false"
            row-key="criterion"
            class="criteria-table"
            :bordered="true"
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
            <a-button type="primary" @click="handleEditEvaluation" class="action-button">
              Edit Evaluation
            </a-button>
          </a-col>
        </a-row>
      </a-card>
    </div>
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
  if (getCurrentUserRole() === 'INTERN')
    internId = -1
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
.evaluation-detail {
  padding: 16px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eaeaea;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-card,
.criteria-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.summary-card :deep(.ant-card-head),
.criteria-card :deep(.ant-card-head) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
  padding: 16px 20px;
}

.summary-card :deep(.ant-card-head-title),
.criteria-card :deep(.ant-card-head-title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.summary-card :deep(.ant-card-body),
.criteria-card :deep(.ant-card-body) {
  padding: 20px;
}

.evaluation-summary :deep(.ant-descriptions-header) {
  margin-bottom: 16px;
}

.evaluation-summary :deep(.ant-descriptions-item-label) {
  background-color: #f0f5ff;
  font-weight: 500;
  color: #344054;
  padding: 12px 16px;
}

.evaluation-summary :deep(.ant-descriptions-item-content) {
  padding: 12px 16px;
}

.score-value {
  font-weight: 600;
  color: #1f2937;
}

.status-tag {
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}

.criteria-table {
  border-radius: 8px;
  overflow: hidden;
}

.criteria-table :deep(.ant-table) {
  border-radius: 8px;
}

.criteria-table :deep(.ant-table-thead > tr > th) {
  background-color: #f0f5ff;
  font-weight: 600;
  padding: 16px;
  color: #1f2937;
}

.criteria-table :deep(.ant-table-tbody > tr > td) {
  padding: 16px;
  border-bottom: 1px solid #f1f3f5;
}

.criteria-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f9fafb;
}

.criteria-label :deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #344054;
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
  border-radius: 6px;
  border: 1px solid #d0d5dd;
}

.comment-textarea:hover {
  border-color: #1890ff;
}

.comment-textarea:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
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
  color: #344054;
}

.overall-select {
  width: 100%;
  font-size: 14px;
  border-radius: 6px;
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

.action-button {
  border-radius: 6px;
  font-weight: 500;
  padding: 0 16px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .evaluation-detail {
    padding: 12px;
  }
  
  .summary-card :deep(.ant-card-body),
  .criteria-card :deep(.ant-card-body) {
    padding: 16px;
  }
  
  .header-title {
    font-size: 1.25rem;
  }
  
  .evaluation-summary :deep(.ant-descriptions-item-label),
  .evaluation-summary :deep(.ant-descriptions-item-content),
  .criteria-table :deep(.ant-table-thead > tr > th),
  .criteria-table :deep(.ant-table-tbody > tr > td) {
    padding: 12px;
  }
}
</style>