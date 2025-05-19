<template>
  <div class="test-detail-container">
    <a-page-header
      :title="test ? test.title : 'Test Details'"
      :sub-title="test ? `Duration: ${test.durationMinutes} minutes` : ''"
      @back="goBack"
    >
      <template #extra>
        <a-space>
          <a-button type="primary" @click="showCreateQuestionModal" :disabled="!canEditTest">
            <PlusOutlined />
            Add Question
          </a-button>
          <a-button type="primary" @click="showBatchAddModal" :disabled="!canEditTest">
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
        <a-descriptions-item label="Duration">{{ dayjs(test?.scheduledEndTime).diff(dayjs(test?.scheduledStartTime), 'minutes') }} minutes</a-descriptions-item>
        <a-descriptions-item label="Passing Score">{{ test?.passingScore }}</a-descriptions-item>
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

    <a-tabs v-model:activeKey="activeTab" class="test-tabs">
      <a-tab-pane key="questions" tab="Questions">
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
      </a-tab-pane>

      <a-tab-pane key="results" tab="Test Results">
        <a-card title="Test Results" class="results-card">
          <a-spin :spinning="loading">
            <a-empty v-if="testResults.length === 0" description="No results available for this test yet" />
            
            <div v-else class="results-container">
              <a-table
                :dataSource="testResults"
                :columns="resultColumns"
                :pagination="{ pageSize: 10 }"
                :row-key="record => record.id"
              >
                <template #score="{ text }">
                  <a-tag :color="text >= test?.passingScore ? 'success' : 'error'">
                    {{ text }}%
                  </a-tag>
                </template>
                <template #status="{ record }">
                  <a-tag :color="record.isPassed ? 'success' : 'error'">
                    {{ record.isPassed ? 'PASSED' : 'FAILED' }}
                  </a-tag>
                </template>
                <template #submittedAt="{ text }">
                  {{ dayjs(text).format('YYYY-MM-DD HH:mm:ss') }}
                </template>
                <template #action="{ record }">
                  <a-button type="primary" size="small" @click="showDetailedResult(record)">
                    <EyeOutlined />
                    View Details
                  </a-button>
                </template>
              </a-table>
            </div>
          </a-spin>
        </a-card>
      </a-tab-pane>
    </a-tabs>

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

    <!-- Detailed Test Result Modal -->
    <a-modal
      v-model:visible="detailedResultModalVisible"
      title="Detailed Test Result"
      width="800px"
      :footer="null"
    >
      <a-spin :spinning="loading">
        <div v-if="selectedResult" class="detailed-result">
          <a-descriptions title="Test Information" bordered>
            <a-descriptions-item label="Intern Name">{{ selectedResult.intern?.fullname }}</a-descriptions-item>
            <a-descriptions-item label="Score">
              <a-tag :color="selectedResult.score >= test?.passingScore ? 'success' : 'error'">
                {{ selectedResult.score }}%
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Status">
              <a-tag :color="selectedResult.isPassed ? 'success' : 'error'">
                {{ selectedResult.isPassed ? 'PASSED' : 'FAILED' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Correct Answers">
              {{ selectedResult.correctAnswers }}/{{ selectedResult.totalQuestions }}
            </a-descriptions-item>
            <a-descriptions-item label="Completion Time">
              {{ selectedResult.completionTime }} minutes
            </a-descriptions-item>
            <a-descriptions-item label="Submitted At">
              {{ dayjs(selectedResult.submittedAt).format('YYYY-MM-DD HH:mm:ss') }}
            </a-descriptions-item>
          </a-descriptions>

          <template v-if="selectedResult.answers && selectedResult.answers.length > 0">
            <a-divider>Question Details</a-divider>

            <div class="question-details">
              <a-collapse v-model:activeKey="activeQuestionDetails">
                <a-collapse-panel 
                  v-for="(answer, index) in selectedResult.answers" 
                  :key="index"
                  :header="`Question ${index + 1}`"
                >
                  <div class="question-detail-content">
                    <div class="question-text">{{ answer.question }}</div>
                    
                    <div class="options-container">
                      <div 
                        class="option" 
                        :class="{
                          'correct-option': answer.correctOption === 'A',
                          'selected-option': answer.selectedOption === 'A',
                          'wrong-option': answer.selectedOption === 'A' && answer.correctOption !== 'A'
                        }"
                      >
                        <span class="option-label">A:</span> {{ answer.optionA }}
                      </div>
                      <div 
                        class="option" 
                        :class="{
                          'correct-option': answer.correctOption === 'B',
                          'selected-option': answer.selectedOption === 'B',
                          'wrong-option': answer.selectedOption === 'B' && answer.correctOption !== 'B'
                        }"
                      >
                        <span class="option-label">B:</span> {{ answer.optionB }}
                      </div>
                      <div 
                        class="option" 
                        :class="{
                          'correct-option': answer.correctOption === 'C',
                          'selected-option': answer.selectedOption === 'C',
                          'wrong-option': answer.selectedOption === 'C' && answer.correctOption !== 'C'
                        }"
                      >
                        <span class="option-label">C:</span> {{ answer.optionC }}
                      </div>
                      <div 
                        class="option" 
                        :class="{
                          'correct-option': answer.correctOption === 'D',
                          'selected-option': answer.selectedOption === 'D',
                          'wrong-option': answer.selectedOption === 'D' && answer.correctOption !== 'D'
                        }"
                      >
                        <span class="option-label">D:</span> {{ answer.optionD }}
                      </div>
                    </div>

                    <div class="answer-status">
                      <a-tag :color="answer.isCorrect ? 'success' : 'error'">
                        {{ answer.isCorrect ? 'Correct' : 'Incorrect' }}
                      </a-tag>
                      <span class="points">Points: {{ answer.points }}</span>
                    </div>
                  </div>
                </a-collapse-panel>
              </a-collapse>
            </div>
          </template>
          <template v-else>
            <a-empty description="No detailed answer information available" />
          </template>
        </div>
      </a-spin>
    </a-modal>

    <!-- Edit Test Modal -->
    <a-modal
      v-model:visible="editTestModalVisible"
      title="Edit Test"
      @ok="handleSaveTest"
      :confirm-loading="submitLoading"
      width="600px"
    >
      <a-form :model="testForm" :rules="testRules" ref="testFormRef" layout="vertical">
        <a-form-item label="Test Title" name="title">
          <a-input v-model:value="testForm.title" placeholder="Enter test title"/>
        </a-form-item>

        <a-form-item label="Description" name="description">
          <a-textarea v-model:value="testForm.description" placeholder="Enter test description" rows="4"/>
        </a-form-item>

        <a-form-item label="Passing Score" name="passingScore">
          <a-input-number v-model:value="testForm.passingScore" :min="1" :max="10" style="width: 100%"/>
        </a-form-item>

        <a-form-item label="Duration (minutes)" name="durationMinutes">
          <a-input-number v-model:value="testForm.durationMinutes" :min="1" style="width: 100%"/>
        </a-form-item>

        <a-form-item label="Published" name="isPublished">
          <a-switch v-model:checked="testForm.isPublished"/>
        </a-form-item>

        <a-form-item label="Has Fixed Period" name="hasFixedPeriod">
          <a-switch v-model:checked="testForm.hasFixedPeriod"/>
        </a-form-item>

        <template v-if="testForm.hasFixedPeriod">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="Start Date & Time" name="scheduledStartTime">
                <a-date-picker
                  v-model:value="testForm.scheduledStartTime"
                  :show-time="{ format: 'HH:mm' }"
                  format="YYYY-MM-DD HH:mm"
                  placeholder="Select start time"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="End Date & Time" name="scheduledEndTime">
                <a-date-picker
                  v-model:value="testForm.scheduledEndTime"
                  :show-time="{ format: 'HH:mm' }"
                  format="YYYY-MM-DD HH:mm"
                  placeholder="Select end time"
                  style="width: 100%"
                  :disabled-date="disableEndDateBeforeStart"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </template>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined,
  BulbOutlined,
  EyeOutlined
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

const activeTab = ref('questions');
const testResults = ref([]);

const resultColumns = [
  {
    title: 'Intern Name',
    dataIndex: ['intern', 'fullname'],
    key: 'internName',
    align: 'center',
  },
  {
    title: 'Score',
    dataIndex: 'score',
    key: 'score',
    align: 'center',
    slots: { customRender: 'score' }
  },
  {
    title: 'Status',
    key: 'status',
    align: 'center',
    slots: { customRender: 'status' }
  },
  {
    title: 'Correct Answers',
    dataIndex: 'correctAnswers',
    key: 'correctAnswers',
    align: 'center',
    customRender: ({ record }) => `${record.correctAnswers}/${record.totalQuestions}`
  },
  {
    title: 'Completion Time',
    dataIndex: 'completionTime',
    key: 'completionTime',
    align: 'center',
    customRender: ({ text }) => `${text} minutes`
  },
  {
    title: 'Submitted At',
    dataIndex: 'submittedAt',
    key: 'submittedAt',
    align: 'center',
    slots: { customRender: 'submittedAt' }
  },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    slots: { customRender: 'action' }
  }
];

// Add these new refs
const detailedResultModalVisible = ref(false);
const selectedResult = ref(null);
const activeQuestionDetails = ref([]);

// Add new refs for test editing
const editTestModalVisible = ref(false);
const testFormRef = ref(null);
const testForm = reactive({
  id: null,
  title: '',
  description: '',
  durationMinutes: 60,
  passingScore: 7,
  isPublished: true,
  hasFixedPeriod: true,
  scheduledStartTime: null,
  scheduledEndTime: null
});

const testRules = {
  title: [{ required: true, message: 'Please enter the test title', trigger: 'blur' }],
  durationMinutes: [{ required: true, message: 'Please enter the duration', trigger: 'blur' }],
  passingScore: [{ required: true, message: 'Please enter the passing score', trigger: 'blur' }],
  scheduledStartTime: [{ 
    required: true, 
    message: 'Please select start date and time',
    trigger: 'change',
    validator: (rule, value) => {
      if (testForm.hasFixedPeriod && !value) {
        return Promise.reject('Start date and time is required when fixed period is enabled');
      }
      return Promise.resolve();
    }
  }],
  scheduledEndTime: [{ 
    required: true, 
    message: 'Please select end date and time',
    trigger: 'change',
    validator: (rule, value) => {
      if (testForm.hasFixedPeriod && !value) {
        return Promise.reject('End date and time is required when fixed period is enabled');
      }
      if (testForm.hasFixedPeriod && value && testForm.scheduledStartTime && value.isBefore(testForm.scheduledStartTime)) {
        return Promise.reject('End time must be after start time');
      }
      return Promise.resolve();
    }
  }]
};

// Add computed property to check if test can be edited
const canEditTest = computed(() => {
  if (!test.value) return false;
  
  // If test has no scheduled start time, it can be edited
  if (!test.value.scheduledStartTime) return true;
  
  // Check if current time is before test start time
  const now = dayjs();
  const startTime = dayjs(test.value.scheduledStartTime);
  return now.isBefore(startTime);
});

// Add a computed property to check if the test has started
const hasTestStarted = computed(() => {
  if (!test.value || !test.value.scheduledStartTime) return false;
  return dayjs().isAfter(dayjs(test.value.scheduledStartTime));
});

onMounted(async () => {
  if (testId.value) {
    await Promise.all([
      fetchTestDetails(),
      fetchTestQuestions(),
      fetchTestResults()
    ]);
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

const fetchTestResults = async () => {
  try {
    loading.value = true;
    const response = await testStore.fetchTestResults(testId.value);
    testResults.value = response.data || [];
  } catch (error) {
    console.error('Error fetching test results:', error);
    message.error('Failed to load test results');
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

const showDetailedResult = async (result) => {
  try {
    loading.value = true;
    const response = await testStore.fetchTestResultByIntern(testId.value, result.intern.id);
    console.log('Detailed result response:', response);
    
    // Handle the response data structure
    if (response && response.data) {
      selectedResult.value = response.data;
      detailedResultModalVisible.value = true;
      
      // Only set activeQuestionDetails if answers array exists
      if (selectedResult.value.answers && Array.isArray(selectedResult.value.answers)) {
        activeQuestionDetails.value = selectedResult.value.answers.map((_, index) => index);
      } else {
        activeQuestionDetails.value = [];
      }
    } else {
      message.error('No detailed result data available');
    }
  } catch (error) {
    console.error('Error fetching detailed result:', error);
    message.error('Failed to load detailed test result');
  } finally {
    loading.value = false;
  }
};

// Add methods for test editing
const showEditTestModal = () => {
  if (!test.value) return;
  
  testForm.id = test.value.id;
  testForm.title = test.value.title;
  testForm.description = test.value.description || '';
  testForm.durationMinutes = test.value.durationMinutes;
  testForm.passingScore = test.value.passingScore;
  testForm.isPublished = test.value.isPublished;
  testForm.hasFixedPeriod = test.value.hasFixedPeriod;
  
  // Properly handle date/time fields
  testForm.scheduledStartTime = test.value.scheduledStartTime ? dayjs(test.value.scheduledStartTime) : null;
  testForm.scheduledEndTime = test.value.scheduledEndTime ? dayjs(test.value.scheduledEndTime) : null;
  
  editTestModalVisible.value = true;
};

const handleSaveTest = () => {
  testFormRef.value.validate().then(async () => {
    try {
      submitLoading.value = true;
      
      const formattedData = {
        title: testForm.title,
        description: testForm.description,
        durationMinutes: testForm.durationMinutes,
        passingScore: testForm.passingScore,
        isPublished: Boolean(testForm.isPublished),
        hasFixedPeriod: Boolean(testForm.hasFixedPeriod),
        scheduledStartTime: testForm.scheduledStartTime ? testForm.scheduledStartTime.toISOString() : null,
        scheduledEndTime: testForm.scheduledEndTime ? testForm.scheduledEndTime.toISOString() : null
      };

      await testStore.updateTest(test.value.lesson.classEntity.id, testForm.id, formattedData);
      await fetchTestDetails();
      editTestModalVisible.value = false;
      message.success('Test updated successfully');
    } catch (error) {
      console.error('Error updating test:', error);
      message.error('Failed to update test');
    } finally {
      submitLoading.value = false;
    }
  }).catch(errors => {
    console.error("Validation errors:", errors);
    message.error('Please fix the form errors before submitting');
  });
};

// Add a watch for hasFixedPeriod to clear date/time fields when disabled
watch(() => testForm.hasFixedPeriod, (newValue) => {
  if (!newValue) {
    testForm.scheduledStartTime = null;
    testForm.scheduledEndTime = null;
  }
});

// Update the disableEndDateBeforeStart function to be more precise
const disableEndDateBeforeStart = (current) => {
  if (!testForm.scheduledStartTime) return false;
  return current && current.isBefore(testForm.scheduledStartTime);
};
</script>

<style scoped>
.test-detail-container {
  padding: 16px;
}

.test-info-card {
  margin-bottom: 24px;
}

.question-list-card {
  margin-top: 24px;
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

.test-tabs {
  margin-top: 16px;
}

.results-card {
  margin-top: 16px;
}

.results-container {
  padding: 16px;
}

.results-container :deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}

.results-container :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f5f5f5;
}

.results-container :deep(.ant-tag) {
  min-width: 80px;
  text-align: center;
}

.detailed-result {
  padding: 16px;
}

.question-detail-content {
  padding: 16px;
}

.answer-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.points {
  font-weight: 500;
  color: #1890ff;
}

.selected-option {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

.wrong-option {
  background-color: #fff1f0;
  border: 1px solid #ffa39e;
}

.correct-option {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.option {
  margin-bottom: 8px;
  padding: 12px;
  border-radius: 4px;
  background-color: #f5f5f5;
  transition: all 0.3s;
}

.option:hover {
  background-color: #f0f0f0;
}
</style> 