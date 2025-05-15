<template>
  <div class="test-detail-container">
    <a-page-header
      :title="test ? test.title : 'Test'"
      @back="goBack"
    >
      <template #tags>
        <a-tag v-if="isViewingResults" color="blue">Result</a-tag>
        <a-tag v-else-if="test" color="green">{{ test.durationMinutes }} minutes</a-tag>
      </template>
      
      <template #extra>
        <a-space>
          <a-button v-if="isViewingResults" type="primary" @click="switchToTestView">
            View Test
          </a-button>
          <a-button v-else-if="testResult" type="primary" @click="switchToResultView">
            View Result
          </a-button>
          <a-tag v-if="hasScheduledPeriod && isTestAvailable && !isTestStarted && !isViewingResults" color="green">
            Available Now
          </a-tag>
        </a-space>
      </template>
    </a-page-header>
    
    <a-spin :spinning="loading">
      <!-- Taking the test view -->
      <div v-if="!isViewingResults" class="test-view">
        <!-- Test instructions and details -->
        <a-card v-if="!isTestStarted" title="Test Instructions" class="instructions-card">
          <a-descriptions bordered :column="{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }">
            <a-descriptions-item label="Duration">{{ test?.durationMinutes || 0 }} minutes</a-descriptions-item>
            <a-descriptions-item label="Passing Score">{{ test?.passingScore || 0 }}%</a-descriptions-item>
            <a-descriptions-item label="Total Questions">{{ testQuestions.length }}</a-descriptions-item>
            <a-descriptions-item label="Test Type">Multiple Choice</a-descriptions-item>
            <a-descriptions-item v-if="hasScheduledPeriod" label="Available Period" :span="2">
              {{ formatDateTime(test.scheduledStartTime) }} - {{ formatDateTime(test.scheduledEndTime) }}
            </a-descriptions-item>
          </a-descriptions>
          
          <div v-if="hasScheduledPeriod" class="scheduled-alert">
            <a-alert 
              :type="isTestAvailable ? 'success' : (timeUntilTestStarts ? 'warning' : 'error')" 
              :message="scheduledTimeMessage" 
              banner 
              show-icon
            />
          </div>
          
          <div class="test-description" v-if="test?.description">
            <h3>Description</h3>
            <p>{{ test.description }}</p>
          </div>
          
          <div class="instructions-text">
            <h3>Instructions</h3>
            <ul>
              <li>This test contains {{ testQuestions.length }} multiple-choice questions.</li>
              <li>Each question has 4 possible answers, with only one correct answer.</li>
              <li>You have {{ test?.durationMinutes || 0 }} minutes to complete the test.</li>
              <li>Once you start the test, the timer will begin and cannot be paused.</li>
              <li>You must achieve {{ test?.passingScore || 0 }}% or higher to pass.</li>
              <li v-if="hasScheduledPeriod">This test is only available from {{ formatDateTime(test.scheduledStartTime) }} to {{ formatDateTime(test.scheduledEndTime) }}.</li>
              <li>Click "Start Test" when you are ready to begin.</li>
            </ul>
          </div>
          
          <div class="test-actions">
            <a-button 
              type="primary" 
              size="large" 
              @click="startTest" 
              :disabled="testQuestions.length === 0 || (hasScheduledPeriod && !isTestAvailable)"
              :style="isTestAvailable ? { backgroundColor: '#52c41a', borderColor: '#52c41a' } : {}"
            >
              <template #icon><play-circle-outlined v-if="isTestAvailable" /></template>
              {{ isTestAvailable ? 'Start Test Now' : 'Start Test' }}
            </a-button>
            
            <div v-if="hasScheduledPeriod && timeUntilTestStarts && !isTestAvailable" class="test-countdown">
              <p>Test will be available in:</p>
              <div class="countdown-timer">
                <div class="time-unit">
                  <span class="time-value">{{ timeUntilTestStarts.hours }}</span>
                  <span class="time-label">hours</span>
                </div>
                <div class="time-unit">
                  <span class="time-value">{{ timeUntilTestStarts.minutes }}</span>
                  <span class="time-label">minutes</span>
                </div>
              </div>
            </div>
          </div>
        </a-card>
        
        <!-- Test in progress -->
        <div v-else class="test-in-progress">
          <a-card>
            <div class="test-header">
              <div class="timer-wrapper">
                <a-statistic
                  title="Time Remaining"
                  :value="formatRemainingTime()"
                  :value-style="{ color: timeRemaining < 300 ? '#ff4d4f' : '#52c41a' }"
                />
              </div>
              
              <div class="progress-wrapper">
                <a-progress
                  :percent="(currentQuestionIndex / testQuestions.length) * 100"
                  :format="() => `${currentQuestionIndex}/${testQuestions.length}`"
                  size="small"
                />
              </div>
            </div>
            
            <a-divider />
            
            <!-- Current question -->
            <div v-if="currentQuestion" class="question-container">
              <h2 class="question-text">{{ currentQuestionIndex + 1 }}. {{ currentQuestion.question }}</h2>
              
              <a-radio-group
                v-model:value="answers[currentQuestion.id]"
                class="answer-options"
              >
                <a-radio
                  v-for="(option, key) in {
                    'A': currentQuestion.optionA,
                    'B': currentQuestion.optionB,
                    'C': currentQuestion.optionC,
                    'D': currentQuestion.optionD
                  }"
                  :key="key"
                  :value="key"
                  class="answer-option"
                >
                  <div class="option-content">
                    <span class="option-letter">{{ key }}.</span>
                    <span class="option-text">{{ option }}</span>
                  </div>
                </a-radio>
              </a-radio-group>
            </div>
            
            <a-divider />
            
            <div class="navigation-buttons">
              <a-button 
                @click="prevQuestion" 
                :disabled="currentQuestionIndex === 0"
              >
                Previous
              </a-button>
              
              <a-button
                v-if="currentQuestionIndex < testQuestions.length - 1"
                type="primary"
                @click="nextQuestion"
              >
                Next
              </a-button>
              
              <a-button
                v-else
                type="primary"
                danger
                @click="confirmSubmitTest"
              >
                Submit Test
              </a-button>
            </div>
            
            <div class="question-navigation">
              <a-button
                v-for="(_, index) in testQuestions"
                :key="index"
                :type="index === currentQuestionIndex ? 'primary' : 
                       (answers[testQuestions[index].id] ? 'default' : 'dashed')"
                shape="circle"
                @click="goToQuestion(index)"
              >
                {{ index + 1 }}
              </a-button>
            </div>
          </a-card>
        </div>
      </div>
      
      <!-- Test results view -->
      <div v-else class="results-view">
        <a-card>
          <a-result
            :status="testResult?.score >= test?.passingScore ? 'success' : 'error'"
            :title="`Your Score: ${testResult?.score || 0}%`"
            :sub-title="testResult?.score >= test?.passingScore ? 'Congratulations! You passed the test.' : 'Sorry, you did not pass the test.'"
          >
            <template #extra>
              <a-button type="primary" @click="goToAllTests">
                Back to Tests
              </a-button>
            </template>
            
            <div class="result-details">
              <a-descriptions bordered>
                <a-descriptions-item label="Test Title">{{ test?.title }}</a-descriptions-item>
                <a-descriptions-item label="Passing Score">{{ test?.passingScore }}%</a-descriptions-item>
                <a-descriptions-item label="Your Score">{{ testResult?.score }}%</a-descriptions-item>
                <a-descriptions-item label="Correct Answers">{{ testResult?.correctAnswers || 0 }} / {{ testQuestions.length }}</a-descriptions-item>
                <a-descriptions-item label="Submission Date">{{ formatDate(testResult?.submissionDate) }}</a-descriptions-item>
                <a-descriptions-item label="Status">
                  <a-tag :color="testResult?.score >= test?.passingScore ? 'success' : 'error'">
                    {{ testResult?.score >= test?.passingScore ? 'PASSED' : 'FAILED' }}
                  </a-tag>
                </a-descriptions-item>
              </a-descriptions>
            </div>
            
            <a-divider orientation="left">Question Review</a-divider>
            
            <div class="question-review">
              <a-collapse accordion>
                <a-collapse-panel
                  v-for="(question, index) in testQuestions"
                  :key="question.id"
                  :header="`Question ${index + 1}: ${question.question}`"
                >
                  <div class="review-options">
                    <p v-for="(option, key) in {
                      'A': question.optionA,
                      'B': question.optionB,
                      'C': question.optionC,
                      'D': question.optionD
                    }" :key="key" class="review-option">
                      <span :class="[
                        'option-marker',
                        testResult?.answers?.[question.id] === key ? 'your-answer' : '',
                        question.correctOption === key ? 'correct-answer' : ''
                      ]">{{ key }}</span>
                      <span>{{ option }}</span>
                    </p>
                  </div>
                  
                  <div class="answer-explanation">
                    <p>
                      <strong>Correct Answer:</strong> {{ question.correctOption }}
                    </p>
                    <p v-if="question.explanation">
                      <strong>Explanation:</strong> {{ question.explanation }}
                    </p>
                  </div>
                </a-collapse-panel>
              </a-collapse>
            </div>
          </a-result>
        </a-card>
      </div>
    </a-spin>
    
    <!-- Confirmation Modal for Test Submission -->
    <a-modal
      v-model:visible="submitModalVisible"
      title="Submit Test"
      @ok="submitTest"
      :okText="'Submit'"
      :okButtonProps="{ danger: true, type: 'primary' }"
    >
      <p>Are you sure you want to submit your test?</p>
      <p v-if="unansweredCount > 0">
        <a-alert
          type="warning"
          :message="`You have ${unansweredCount} unanswered ${unansweredCount === 1 ? 'question' : 'questions'}.`"
          show-icon
        />
      </p>
      <p>Once submitted, you cannot change your answers.</p>
    </a-modal>
    
    <!-- Test Completion Modal -->
    <a-modal
      v-model:visible="completionModalVisible"
      title="Test Submitted"
      :footer="null"
    >
      <a-result
        status="success"
        title="Test Successfully Submitted!"
        sub-title="Your test has been submitted and graded."
      >
        <template #extra>
          <a-button type="primary" @click="viewTestResults">
            View Results
          </a-button>
        </template>
      </a-result>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInternClassStore } from '@/stores/internClassStore';
import { useTestQuestionStore } from '@/stores/testQuestionStore';
import { useAuthStore } from '@/stores/authStore';
import { message, Modal } from 'ant-design-vue';
import { PlayCircleOutlined } from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();
const internClassStore = useInternClassStore();
const testQuestionStore = useTestQuestionStore();
const authStore = useAuthStore();

const loading = ref(false);
const test = ref(null);
const testQuestions = ref([]);
const testResult = ref(null);
const isTestStarted = ref(false);
const currentQuestionIndex = ref(0);
const answers = reactive({});
const timeRemaining = ref(0);
const timerInterval = ref(null);
const submitModalVisible = ref(false);
const completionModalVisible = ref(false);

const testId = computed(() => route.params.id);
const isViewingResults = computed(() => route.query.view === 'results');

const currentQuestion = computed(() => {
  if (testQuestions.value.length === 0 || currentQuestionIndex.value < 0) {
    return null;
  }
  return testQuestions.value[currentQuestionIndex.value];
});

const currentUserId = computed(() => {
  const user = authStore.currentUser;
  return user ? user.id : null;
});

const unansweredCount = computed(() => {
  return testQuestions.value.filter(q => !answers[q.id]).length;
});

const hasScheduledPeriod = computed(() => {
  return test.value && test.value.scheduledStartTime && test.value.scheduledEndTime;
});

const isTestAvailable = computed(() => {
  if (!hasScheduledPeriod.value) {
    return true; // If no scheduled time, test is always available
  }
  
  const now = new Date();
  const scheduledStartTime = new Date(test.value.scheduledStartTime);
  const scheduledEndTime = new Date(test.value.scheduledEndTime);
  
  return now >= scheduledStartTime && now <= scheduledEndTime;
});

const timeUntilTestStarts = computed(() => {
  if (!hasScheduledPeriod.value) return null;
  
  const now = new Date();
  const startTime = new Date(test.value.scheduledStartTime);
  
  if (now >= startTime) return null;
  
  const diffMs = startTime - now;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    hours: diffHrs,
    minutes: diffMins,
    total: diffMs
  };
});

const scheduledTimeMessage = computed(() => {
  if (!hasScheduledPeriod.value) return '';
  
  const now = new Date();
  const startTime = new Date(test.value.scheduledStartTime);
  const endTime = new Date(test.value.scheduledEndTime);
  
  if (now < startTime) {
    // Test hasn't started yet
    const time = timeUntilTestStarts.value;
    return `This test will be available in ${time.hours} hours and ${time.minutes} minutes (${formatDateTime(startTime)})`;
  } else if (now > endTime) {
    // Test period has ended
    return `This test is no longer available. The test period ended on ${formatDateTime(endTime)}`;
  } else {
    // Currently in test period
    return `This test is available now until ${formatDateTime(endTime)}`;
  }
});

onMounted(async () => {
  if (testId.value && currentUserId.value) {
    await fetchData();
  }
});

onBeforeUnmount(() => {
  stopTimer();
});

const fetchData = async () => {
  loading.value = true;
  try {
    console.log('Fetching test data for test ID:', testId.value, 'and user ID:', currentUserId.value);
    
    // Fetch test details
    const testResponse = await internClassStore.fetchTestById(testId.value);
    test.value = testResponse.data;
    console.log('Test data loaded:', test.value);
    
    // Fetch test questions
    const questionsResponse = await testQuestionStore.fetchTestQuestionsByTestId(testId.value);
    
    // Handle both possible response structures
    if (Array.isArray(questionsResponse)) {
      testQuestions.value = questionsResponse;
    } else if (questionsResponse && questionsResponse.data && Array.isArray(questionsResponse.data)) {
      testQuestions.value = questionsResponse.data;
    } else if (questionsResponse && Array.isArray(questionsResponse.questions)) {
      testQuestions.value = questionsResponse.questions;
    } else if (test.value && Array.isArray(test.value.questions)) {
      testQuestions.value = test.value.questions;
    } else {
      console.warn('Questions data not in expected format:', questionsResponse);
      testQuestions.value = [];
    }
    
    console.log('Test questions loaded:', testQuestions.value.length);
    
    // Try to fetch test result (may not exist if test not taken yet)
    try {
      console.log('Checking for existing test result...');
      const resultResponse = await internClassStore.fetchTestResultByIntern(testId.value, currentUserId.value);
      if (resultResponse && resultResponse.data) {
        testResult.value = resultResponse.data;
        console.log('Existing test result found:', testResult.value);
      }
    } catch (error) {
      // No result found is expected for new tests, not an error condition
      console.log('No previous test result found - test not taken yet');
      testResult.value = null;
    }
  } catch (error) {
    console.error('Error fetching test data:', error);
    message.error('Failed to load test data. Please try again.');
  } finally {
    loading.value = false;
  }
};

const startTest = () => {
  if (testResult.value) {
    Modal.confirm({
      title: 'You have already taken this test',
      content: 'Do you want to view your results instead?',
      okText: 'View Results',
      cancelText: 'Cancel',
      onOk: () => switchToResultView()
    });
    return;
  }
  
  isTestStarted.value = true;
  resetAnswers();
  startTimer();
};

const resetAnswers = () => {
  testQuestions.value.forEach(question => {
    answers[question.id] = null;
  });
};

const startTimer = () => {
  if (test.value && test.value.durationMinutes) {
    timeRemaining.value = test.value.durationMinutes * 60; // Convert to seconds
    timerInterval.value = setInterval(() => {
      timeRemaining.value--;
      if (timeRemaining.value <= 0) {
        stopTimer();
        submitTest(true);
      }
    }, 1000);
  }
};

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

const formatRemainingTime = () => {
  const minutes = Math.floor(timeRemaining.value / 60);
  const seconds = timeRemaining.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < testQuestions.value.length - 1) {
    currentQuestionIndex.value++;
  }
};

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

const goToQuestion = (index) => {
  if (index >= 0 && index < testQuestions.value.length) {
    currentQuestionIndex.value = index;
  }
};

const confirmSubmitTest = () => {
  submitModalVisible.value = true;
};

const submitTest = async (timeExpired = false) => {
  submitModalVisible.value = false;
  loading.value = true;
  
  try {
    stopTimer();
    
    if (timeExpired) {
      message.warning('Time expired! Submitting your test automatically.');
    }
    
    // Prepare answers for submission
    const answersPayload = {};
    for (const questionId in answers) {
      if (answers[questionId]) {
        answersPayload[questionId] = answers[questionId];
      }
    }
    
    console.log('Submitting test with answers:', answersPayload);
    
    if (Object.keys(answersPayload).length === 0) {
      // Add warning for empty answers, but still allow submission
      message.warning('You are submitting without answering any questions.');
    }
    
    // Submit the test
    const response = await internClassStore.submitTest(testId.value, currentUserId.value, answersPayload);
    
    if (response && response.data) {
      testResult.value = response.data;
      console.log('Test submitted successfully, result:', testResult.value);
      completionModalVisible.value = true;
      message.success('Test submitted successfully!');
    } else {
      message.warning('Test submitted but no result was returned. Please check the results page.');
      // Still show completion modal, even though there might be an issue
      completionModalVisible.value = true;
    }
  } catch (error) {
    console.error('Error submitting test:', error);
    
    // Show a detailed error message based on the error type
    if (error.response && error.response.status === 404) {
      message.error('Test not found or no longer available.');
    } else if (error.response && error.response.status === 400) {
      message.error('Invalid test submission. Please check your answers.');
    } else {
      message.error('Failed to submit test. Please try again or contact support.');
    }
    
    // Keep the test open so user can try submitting again
    startTimer(); // Resume the timer
  } finally {
    loading.value = false;
  }
};

const viewTestResults = () => {
  completionModalVisible.value = false;
  switchToResultView();
};

const switchToResultView = () => {
  router.push({ path: `/intern/tests/${testId.value}`, query: { view: 'results' } });
};

const switchToTestView = () => {
  router.push({ path: `/intern/tests/${testId.value}` });
};

const goBack = () => {
  if (isTestStarted.value && !testResult.value) {
    // User is in the middle of a test, confirm before leaving
    Modal.confirm({
      title: 'Leave Test?',
      content: 'If you leave now, your progress will be lost. Are you sure you want to leave?',
      okText: 'Leave',
      cancelText: 'Stay',
      okType: 'danger',
      onOk: () => {
        stopTimer();
        router.push('/intern/tests');
      }
    });
  } else {
    router.push('/intern/tests');
  }
};

const goToAllTests = () => {
  router.push('/intern/tests');
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};
</script>

<style scoped>
.test-detail-container {
  padding: 20px;
}

.instructions-card {
  margin-bottom: 20px;
}

.test-description {
  margin: 20px 0;
}

.instructions-text {
  margin: 20px 0;
}

.test-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.test-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.question-container {
  margin: 20px 0;
}

.question-text {
  font-size: 18px;
  margin-bottom: 20px;
}

.answer-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.answer-option {
  width: 100%;
  padding: 10px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  transition: all 0.3s;
}

.answer-option:hover {
  background-color: #f6f6f6;
}

.option-content {
  display: flex;
  gap: 10px;
}

.option-letter {
  font-weight: bold;
  min-width: 20px;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.question-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
}

.result-details {
  margin: 20px 0;
}

.question-review {
  margin-top: 20px;
}

.review-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-marker {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #000;
  font-weight: bold;
}

.your-answer {
  background-color: #1890ff;
  color: #fff;
}

.correct-answer {
  background-color: #52c41a;
  color: #fff;
}

.your-answer.correct-answer {
  background-color: #52c41a;
  color: #fff;
}

.answer-explanation {
  margin-top: 16px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.scheduled-alert {
  margin-top: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  overflow: hidden;
}

.scheduled-alert :deep(.ant-alert) {
  border-radius: 4px;
  padding: 12px 16px;
}

.scheduled-alert :deep(.ant-alert-message) {
  font-size: 15px;
}

.test-countdown {
  margin-top: 12px;
  text-align: center;
}

.test-countdown p {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.countdown-timer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-value {
  font-size: 24px;
  font-weight: bold;
  color: #fa8c16;
  background-color: #fff8e6;
  border-radius: 4px;
  min-width: 48px;
  display: inline-block;
  text-align: center;
  padding: 4px 8px;
  border: 1px solid #ffe7ba;
}

.time-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style> 