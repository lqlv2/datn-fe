<template>
  <div class="test-detail-container">
    <a-page-header
      :title="test ? test.title : 'Test Details'"
      :sub-title="test ? `Duration: ${test.durationMinutes} minutes` : ''"
      @back="goBack"
    >
      <template #extra>
        <a-space>
          <a-tag :color="test && test.isPublished ? 'green' : 'orange'">
            {{ test && test.isPublished ? 'Published' : 'Unpublished' }}
          </a-tag>
          <a-button type="primary" @click="showCreateQuestionModal">
            <PlusOutlined />
            Add Question
          </a-button>
          <a-button type="primary" @click="showBatchAddModal">
            <BulbOutlined />
            Batch Add Questions
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-card>
      <a-descriptions title="Test Information" bordered>
        <a-descriptions-item label="Title">{{ test?.title }}</a-descriptions-item>
        <a-descriptions-item label="Description">{{ test?.description || 'No description' }}</a-descriptions-item>
        <a-descriptions-item label="Duration">{{ test?.durationMinutes }} minutes</a-descriptions-item>
        <a-descriptions-item label="Passing Score">{{ test?.passingScore }}</a-descriptions-item>
        <a-descriptions-item label="Published">{{ test?.isPublished ? 'Yes' : 'No' }}</a-descriptions-item>
        <a-descriptions-item label="Scheduled Period">
          <template v-if="test?.scheduledStartTime && test?.scheduledEndTime">
            {{ dayjs(test.scheduledStartTime).format('YYYY-MM-DD HH:mm') }} - 
            {{ dayjs(test.scheduledEndTime).format('YYYY-MM-DD HH:mm') }}
          </template>
          <template v-else>Any time</template>
        </a-descriptions-item>
        <a-descriptions-item label="Created At">{{ test?.createdAt ? dayjs(test.createdAt).format('YYYY-MM-DD HH:mm') : '-' }}</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="Test Questions" class="question-list-card">
      <a-spin :spinning="loading">
        <a-empty v-if="testQuestions.length === 0" description="No questions added to this test yet" />
        
        <div v-else class="questions-container">
          <a-collapse v-model:activeKey="activeQuestionKeys">
            <a-collapse-panel 
              v-for="(question, index) in testQuestions" 
              :key="question.id"
              :header="`Question ${index + 1}: ${question.question}`"
            >
              <div class="question-content">
                <div class="question-text">{{ question.question }}</div>
                
                <div class="options-container">
                  <div class="option" :class="{ 'correct-option': question.correctOption === 'A' }">
                    <span class="option-label">A:</span> {{ question.optionA }}
                  </div>
                  <div class="option" :class="{ 'correct-option': question.correctOption === 'B' }">
                    <span class="option-label">B:</span> {{ question.optionB }}
                  </div>
                  <div class="option" :class="{ 'correct-option': question.correctOption === 'C' }">
                    <span class="option-label">C:</span> {{ question.optionC }}
                  </div>
                  <div class="option" :class="{ 'correct-option': question.correctOption === 'D' }">
                    <span class="option-label">D:</span> {{ question.optionD }}
                  </div>
                </div>
                
                <div class="question-footer">
                  <span>Points: {{ question.points }}</span>
                  <div class="question-actions">
                    <a-button type="primary" size="small" @click.stop="editQuestion(question)">
                      <EditOutlined />
                      Edit
                    </a-button>
                    <a-button type="danger" size="small" @click.stop="confirmDeleteQuestion(question)">
                      <DeleteOutlined />
                      Delete
                    </a-button>
                  </div>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </a-spin>
    </a-card>

    <!-- Create/Edit Question Modal -->
    <a-modal
      v-model:visible="questionModalVisible"
      :title="isEditMode ? 'Edit Question' : 'Add New Question'"
      @ok="handleSaveQuestion"
      width="700px"
      :confirm-loading="submitLoading"
    >
      <a-form :model="questionForm" :rules="questionRules" ref="questionFormRef" layout="vertical">
        <a-form-item label="Question" name="question">
          <a-textarea 
            v-model:value="questionForm.question" 
            placeholder="Enter question text" 
            :rows="3" 
          />
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Option A" name="optionA">
              <a-textarea 
                v-model:value="questionForm.optionA" 
                placeholder="Enter option A" 
                :rows="2" 
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Option B" name="optionB">
              <a-textarea 
                v-model:value="questionForm.optionB" 
                placeholder="Enter option B" 
                :rows="2" 
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Option C" name="optionC">
              <a-textarea 
                v-model:value="questionForm.optionC" 
                placeholder="Enter option C" 
                :rows="2" 
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Option D" name="optionD">
              <a-textarea 
                v-model:value="questionForm.optionD" 
                placeholder="Enter option D" 
                :rows="2" 
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Correct Answer" name="correctOption">
              <a-select v-model:value="questionForm.correctOption">
                <a-select-option value="A">Option A</a-select-option>
                <a-select-option value="B">Option B</a-select-option>
                <a-select-option value="C">Option C</a-select-option>
                <a-select-option value="D">Option D</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Points" name="points">
              <a-input-number 
                v-model:value="questionForm.points" 
                :min="1" 
                :max="100" 
                style="width: 100%" 
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- Batch Add Questions Modal -->
    <a-modal
      v-model:visible="batchModalVisible"
      title="Batch Add Questions"
      @ok="handleBatchSave"
      width="800px"
      :confirm-loading="submitLoading"
    >
      <p>Add multiple questions at once. Each question must have 4 options (A, B, C, D) and one correct answer.</p>
      
      <div v-for="(item, index) in batchQuestions" :key="index" class="batch-question-item">
        <a-divider>Question {{ index + 1 }}</a-divider>
        
        <a-button 
          v-if="batchQuestions.length > 1" 
          type="danger" 
          size="small" 
          class="remove-batch-btn"
          @click="removeBatchQuestion(index)"
        >
          <DeleteOutlined />
        </a-button>
        
        <a-form layout="vertical">
          <a-form-item label="Question">
            <a-textarea 
              v-model:value="item.question" 
              placeholder="Enter question text" 
              :rows="2" 
            />
          </a-form-item>
          
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="Option A">
                <a-textarea 
                  v-model:value="item.optionA" 
                  placeholder="Enter option A" 
                  :rows="1" 
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Option B">
                <a-textarea 
                  v-model:value="item.optionB" 
                  placeholder="Enter option B" 
                  :rows="1" 
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="Option C">
                <a-textarea 
                  v-model:value="item.optionC" 
                  placeholder="Enter option C" 
                  :rows="1" 
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Option D">
                <a-textarea 
                  v-model:value="item.optionD" 
                  placeholder="Enter option D" 
                  :rows="1" 
                />
              </a-form-item>
            </a-col>
          </a-row>
          
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="Correct Answer">
                <a-select v-model:value="item.correctOption">
                  <a-select-option value="A">Option A</a-select-option>
                  <a-select-option value="B">Option B</a-select-option>
                  <a-select-option value="C">Option C</a-select-option>
                  <a-select-option value="D">Option D</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Points">
                <a-input-number 
                  v-model:value="item.points" 
                  :min="1" 
                  :max="100" 
                  style="width: 100%" 
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      
      <div class="batch-actions">
        <a-button type="dashed" block @click="addBatchQuestion">
          <PlusOutlined /> Add Another Question
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined,
  BulbOutlined
} from '@ant-design/icons-vue';
import { useTestStore } from '@/stores/testStore';
import { useTestQuestionStore } from '@/stores/testQuestionStore';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const testStore = useTestStore();
const testQuestionStore = useTestQuestionStore();

const testId = computed(() => route.params.id);
const test = ref(null);
const testQuestions = ref([]);
const loading = ref(false);
const submitLoading = ref(false);
const activeQuestionKeys = ref([]);

// Question form modal
const questionModalVisible = ref(false);
const isEditMode = ref(false);
const questionFormRef = ref(null);
const questionForm = reactive({
  id: null,
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'A',
  points: 1,
  testId: null
});

const questionRules = {
  question: [{ required: true, message: 'Please enter the question', trigger: 'blur' }],
  optionA: [{ required: true, message: 'Please enter option A', trigger: 'blur' }],
  optionB: [{ required: true, message: 'Please enter option B', trigger: 'blur' }],
  optionC: [{ required: true, message: 'Please enter option C', trigger: 'blur' }],
  optionD: [{ required: true, message: 'Please enter option D', trigger: 'blur' }],
  correctOption: [{ required: true, message: 'Please select the correct option', trigger: 'change' }],
  points: [{ required: true, message: 'Please enter points', trigger: 'change' }]
};

// Batch questions modal
const batchModalVisible = ref(false);
const batchQuestions = ref([]);

onMounted(async () => {
  if (testId.value) {
    await fetchTestDetails();
    await fetchTestQuestions();
  }
});

const fetchTestDetails = async () => {
  try {
    loading.value = true;
    const response = await testStore.fetchTestById(testId.value);
    test.value = response.data;
  } catch (error) {
    console.error('Error fetching test details:', error);
    message.error('Failed to load test details');
  } finally {
    loading.value = false;
  }
};

const fetchTestQuestions = async () => {
  try {
    loading.value = true;
    const response = await testQuestionStore.fetchTestQuestionsByTestId(testId.value);
    testQuestions.value = response;
  } catch (error) {
    console.error('Error fetching test questions:', error);
    message.error('Failed to load test questions');
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.go(-1);
};

const showCreateQuestionModal = () => {
  isEditMode.value = false;
  resetQuestionForm();
  questionForm.testId = testId.value;
  questionModalVisible.value = true;
};

const editQuestion = (question) => {
  isEditMode.value = true;
  
  questionForm.id = question.id;
  questionForm.question = question.question;
  questionForm.optionA = question.optionA;
  questionForm.optionB = question.optionB;
  questionForm.optionC = question.optionC;
  questionForm.optionD = question.optionD;
  questionForm.correctOption = question.correctOption;
  questionForm.points = question.points;
  questionForm.testId = testId.value;
  
  questionModalVisible.value = true;
};

const resetQuestionForm = () => {
  questionForm.id = null;
  questionForm.question = '';
  questionForm.optionA = '';
  questionForm.optionB = '';
  questionForm.optionC = '';
  questionForm.optionD = '';
  questionForm.correctOption = 'A';
  questionForm.points = 1;
  questionForm.testId = null;
  
  if (questionFormRef.value) {
    questionFormRef.value.resetFields();
  }
};

const handleSaveQuestion = () => {
  questionFormRef.value.validate().then(async () => {
    try {
      submitLoading.value = true;
      
      if (isEditMode.value && questionForm.id) {
        await testQuestionStore.updateTestQuestion(questionForm.id, questionForm);
      } else {
        await testQuestionStore.createTestQuestion(questionForm);
      }
      
      await fetchTestQuestions();
      questionModalVisible.value = false;
      resetQuestionForm();
      
    } catch (error) {
      console.error('Error saving question:', error);
      message.error(`Failed to ${isEditMode.value ? 'update' : 'create'} question`);
    } finally {
      submitLoading.value = false;
    }
  });
};

const confirmDeleteQuestion = (question) => {
  Modal.confirm({
    title: 'Delete Question',
    content: 'Are you sure you want to delete this question? This action cannot be undone.',
    okText: 'Yes, Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk: () => deleteQuestion(question.id)
  });
};

const deleteQuestion = async (questionId) => {
  try {
    loading.value = true;
    await testQuestionStore.deleteTestQuestion(questionId);
    await fetchTestQuestions();
  } catch (error) {
    console.error('Error deleting question:', error);
    message.error('Failed to delete question');
  } finally {
    loading.value = false;
  }
};

// Batch questions handling
const showBatchAddModal = () => {
  batchQuestions.value = [createEmptyBatchQuestion()];
  batchModalVisible.value = true;
};

const createEmptyBatchQuestion = () => {
  return {
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    points: 1,
    testId: testId.value
  };
};

const addBatchQuestion = () => {
  batchQuestions.value.push(createEmptyBatchQuestion());
};

const removeBatchQuestion = (index) => {
  batchQuestions.value.splice(index, 1);
};

const handleBatchSave = async () => {
  // Validate if all questions have required fields
  const isValid = batchQuestions.value.every(q => 
    q.question && q.optionA && q.optionB && q.optionC && q.optionD && q.correctOption && q.points
  );
  
  if (!isValid) {
    message.error('Please fill in all required fields for each question');
    return;
  }
  
  try {
    submitLoading.value = true;
    await testQuestionStore.createTestQuestionsBatch(testId.value, batchQuestions.value);
    await fetchTestQuestions();
    batchModalVisible.value = false;
  } catch (error) {
    console.error('Error saving batch questions:', error);
    message.error('Failed to save questions');
  } finally {
    submitLoading.value = false;
  }
};
</script>

<style scoped>
.test-detail-container {
  padding: 16px;
}

.question-list-card {
  margin-top: 16px;
}

.questions-container {
  margin-top: 16px;
}

.question-content {
  padding: 8px;
}

.question-text {
  font-size: 16px;
  margin-bottom: 12px;
}

.options-container {
  margin-left: 16px;
  margin-bottom: 12px;
}

.option {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.option-label {
  font-weight: bold;
  margin-right: 8px;
}

.correct-option {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.question-actions {
  display: flex;
  gap: 8px;
}

.batch-question-item {
  position: relative;
  margin-bottom: 24px;
  padding: 16px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
}

.remove-batch-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.batch-actions {
  margin-top: 16px;
}
</style> 