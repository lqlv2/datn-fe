<template>
  <div class="intern-tests-container">
    <a-page-header
      title="My Learning Assessments"
      sub-title="View, take tests and check your results"
    >
      <template #tags>
        <a-tag color="blue">{{ testStats.total }} Total Tests</a-tag>
        <a-tag color="green">{{ testStats.passed }} Passed</a-tag>
        <a-tag color="red">{{ testStats.failed }} Failed</a-tag>
      </template>
      <template #extra>
        <a-button type="primary" @click="refreshData">
          <reload-outlined />
          Refresh
        </a-button>
      </template>
    </a-page-header>
    
    <a-spin :spinning="loading">
      <a-tabs>
        <a-tab-pane key="upcoming" tab="Upcoming Tests">
          <div class="filters-container">
            <a-input-search
              v-model:value="filters.title"
              placeholder="Search by test title"
              style="width: 250px; margin-right: 16px"
              @search="applyFilters"
            />
            <a-select
              v-model:value="filters.classId"
              placeholder="Filter by class"
              style="width: 200px; margin-right: 16px"
              @change="applyFilters"
              allowClear
            >
              <a-select-option v-for="classItem in internClasses" :key="classItem.id" :value="classItem.id">
                {{ classItem.name }}
              </a-select-option>
            </a-select>
          </div>
          
          <a-empty v-if="filteredUpcomingTests.length === 0" description="No upcoming tests available matching your criteria" />
          
          <a-row v-else :gutter="[16, 16]">
            <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="test in filteredUpcomingTests" :key="test.id">
              <a-card hoverable class="test-card">
                <template #title>
                  <div class="test-title">
                    {{ test.title }}
                    <a-tag color="blue">{{ test.durationMinutes }} min</a-tag>
                  </div>
                </template>
                
                <div class="test-info">
                  <p><strong>Class:</strong> {{ getClassNameById(test.classId) }}</p>
                  <p><strong>Passing Score:</strong> {{ test.passingScore }}%</p>
                  <p v-if="test.scheduledStartTime && test.scheduledEndTime">
                    <strong>Available Period:</strong><br/>
                    {{ formatDate(test.scheduledStartTime) }} - {{ formatDate(test.scheduledEndTime) }}
                    <br/>
                    <a-tag 
                      :color="getTestAvailabilityColor(test)"
                      style="margin-top: 5px"
                    >
                      {{ getTestAvailabilityStatus(test) }}
                    </a-tag>
                  </p>
                  <p v-else>
                    <strong>Available:</strong> Any time
                    <a-tag color="green" style="margin-left: 5px">Available Now</a-tag>
                  </p>
                </div>
                
                <div class="test-actions">
                  <a-button 
                    type="primary" 
                    block 
                    @click="goToTest(test.id)"
                    :disabled="!isTestAvailable(test)"
                  >
                    {{ getTestActionText(test) }}
                  </a-button>
                  <div v-if="!isTestAvailable(test) && isTestScheduledForFuture(test)" class="time-remaining">
                    {{ getTimeUntilTestStarts(test) }}
                  </div>
                </div>
              </a-card>
            </a-col>
          </a-row>
        </a-tab-pane>
        
        <a-tab-pane key="completed" tab="Completed Tests">
          <div class="filters-container">
            <a-input-search
              v-model:value="completedFilters.title"
              placeholder="Search by test title"
              style="width: 250px; margin-right: 16px"
              @search="applyCompletedFilters"
            />
            <a-select
              v-model:value="completedFilters.classId"
              placeholder="Filter by class"
              style="width: 200px; margin-right: 16px"
              @change="applyCompletedFilters"
              allowClear
            >
              <a-select-option v-for="classItem in internClasses" :key="classItem.id" :value="classItem.id">
                {{ classItem.name }}
              </a-select-option>
            </a-select>
            <a-select
              v-model:value="completedFilters.result"
              placeholder="Filter by result"
              style="width: 150px; margin-right: 16px"
              @change="applyCompletedFilters"
              allowClear
            >
              <a-select-option value="passed">Passed</a-select-option>
              <a-select-option value="failed">Failed</a-select-option>
            </a-select>
          </div>
          
          <a-empty v-if="filteredCompletedTests.length === 0" description="You haven't completed any tests matching your criteria" />
          
          <a-row v-else :gutter="[16, 16]">
            <a-col :xs="24" :sm="12" :md="8" :lg="6" v-for="test in filteredCompletedTests" :key="test.id">
              <a-card hoverable class="test-card">
                <template #title>
                  <div class="test-title">
                    {{ test.title }}
                    <a-tag :color="test.passed ? 'green' : 'red'">
                      {{ test.score }}% ({{ test.passed ? 'Pass' : 'Fail' }})
                    </a-tag>
                  </div>
                </template>
                
                <div class="test-info">
                  <p><strong>Class:</strong> {{ getClassNameById(test.classId) }}</p>
                  <p><strong>Passing Score:</strong> {{ test.passingScore }}%</p>
                  <p><strong>Taken On:</strong> {{ formatDate(test.submissionDate) }}</p>
                </div>
                
                <div class="test-actions">
                  <a-button type="primary" block @click="viewTestResults(test.id)">
                    View Results
                  </a-button>
                </div>
              </a-card>
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInternClassStore } from '@/stores/internClassStore';
import { useAuthStore } from '@/stores/authStore';
import { message } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';

const router = useRouter();
const internClassStore = useInternClassStore();
const authStore = useAuthStore();

const loading = ref(false);
const testResults = ref([]);
const filters = ref({
  title: '',
  classId: null
});

const completedFilters = ref({
  title: '',
  classId: null,
  result: null
});

const currentUserId = computed(() => {
  const user = authStore.currentUser;
  return user ? user.id : null;
});

const internTests = computed(() => internClassStore.internTests || []);
const internClasses = computed(() => internClassStore.internClasses || []);

// Get statistics from the store or fallback to computed stats if not available
const testStats = computed(() => {
  const stats = internClassStore.testStatistics;
  
  if (stats) {
    return {
      total: stats.totalTests || 0,
      passed: stats.passedTests || 0,
      failed: stats.failedTests || 0,
      completed: stats.completedTests || 0,
      averageScore: stats.averageScore || 0,
      completionRate: Math.round(stats.completionRate || 0)
    };
  }
  
  // Fallback to local calculation if API data not available
  const total = internTests.value.length;
  const completed = testResults.value.length;
  const passed = testResults.value.filter(result => {
    const test = internTests.value.find(t => t.id === result.testId);
    return test && result.score >= test.passingScore;
  }).length;
  const failed = completed - passed;
  
  return {
    total,
    completed,
    passed,
    failed,
    averageScore: completed > 0 
      ? Math.round(testResults.value.reduce((sum, result) => sum + result.score, 0) / completed) 
      : 0,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
});

// Filter upcoming tests (no result yet)
const upcomingTests = computed(() => {
  return internTests.value.filter(test => {
    return test.isPublished && !testResults.value.some(result => result.testId === test.id);
  });
});

// Filter completed tests (with results)
const completedTests = computed(() => {
  if (!testResults.value.length) {
    console.log('No test results in testResults.value');
    return [];
  }
  
  return testResults.value.map(result => {
    console.log('Processing test result:', result);
    
    // Find the corresponding test information
    const test = internTests.value.find(t => t.id === result.testId);
    
    if (test) {
      console.log('Found matching test for result:', test.title);
      return {
        ...test,
        id: test.id, // Ensure ID is preserved
        title: test.title,
        durationMinutes: test.durationMinutes,
        passingScore: test.passingScore,
        classId: result.classId || test.classId || (test.lesson && test.lesson.classId),
        score: result.score,
        passed: result.score >= test.passingScore,
        submissionDate: result.submissionDate || result.createdAt
      };
    } else {
      console.log('No matching test found for result with testId:', result.testId);
      // If we can't find the test, return a default object with the data we have
      return {
        id: result.testId,
        title: result.testName || 'Unknown Test',
        passingScore: result.passingScore || 70,
        classId: result.classId,
        score: result.score,
        passed: result.score >= (result.passingScore || 70),
        submissionDate: result.submissionDate || result.createdAt
      };
    }
  }).filter(Boolean); // Remove any null/undefined entries
});

// Apply filters
const filteredUpcomingTests = computed(() => {
  let filtered = upcomingTests.value;

  if (filters.value.title) {
    filtered = filtered.filter(test => test.title.toLowerCase().includes(filters.value.title.toLowerCase()));
  }

  if (filters.value.classId) {
    filtered = filtered.filter(test => test.classId === filters.value.classId);
  }

  return filtered;
});

const filteredCompletedTests = computed(() => {
  let filtered = completedTests.value;

  if (completedFilters.value.title) {
    filtered = filtered.filter(test => test.title.toLowerCase().includes(completedFilters.value.title.toLowerCase()));
  }

  if (completedFilters.value.classId) {
    filtered = filtered.filter(test => test.classId === completedFilters.value.classId);
  }

  if (completedFilters.value.result) {
    filtered = filtered.filter(test => test.passed === (completedFilters.value.result === 'passed'));
  }

  return filtered;
});

onMounted(async () => {
  if (currentUserId.value) {
    await fetchTestsData();
  }
});

const fetchTestsData = async () => {
  loading.value = true;
  try {
    console.log('Starting to fetch test data for user:', currentUserId.value);
    
    // Fetch tests for the intern
    await internClassStore.fetchInternTests(currentUserId.value);
    console.log('Intern tests fetched:', internClassStore.internTests);
    
    // Fetch test statistics
    await internClassStore.fetchTestStatistics(currentUserId.value);
    console.log('Test statistics fetched:', internClassStore.testStatistics);
    
    // Get the classes if not already loaded
    if (!internClasses.value.length) {
      await internClassStore.fetchInternClasses(currentUserId.value);
      console.log('Intern classes fetched:', internClassStore.internClasses);
    }
    
    // Fetch test results if any
    const tests = internClassStore.internTests || [];
    testResults.value = [];
    console.log('Fetching results for', tests.length, 'tests');
    
    // Create an array of promises for all result fetches
    const resultPromises = tests.map(test => 
      internClassStore.fetchTestResultByIntern(test.id, currentUserId.value)
        .then(response => {
          if (response && response.data) {
            console.log('Test result found for test ID:', test.id, response.data);
            // Add classId to the result for proper matching
            const resultWithClassId = {
              ...response.data,
              classId: test.classId || (test.lesson && test.lesson.classId),
              testId: test.id
            };
            testResults.value.push(resultWithClassId);
          }
          return response;
        })
        .catch(error => {
          // If no result exists, we'll just continue
          if (!error.response || error.response.status !== 404) {
            console.error(`Error fetching result for test ${test.id}:`, error);
          } else {
            console.log(`No results found for test ${test.id} (expected for not-taken tests)`);
          }
        })
    );
    
    // Wait for all result fetches to complete
    await Promise.allSettled(resultPromises);
    
    console.log('Test results fetched. Found', testResults.value.length, 'completed tests');
    
    // If we have no completed tests but we're in development/testing mode, generate some mock results
    if (testResults.value.length === 0 && import.meta.env.DEV) {
      console.log('No completed tests found, generating mock data for development');
      generateMockTestResults();
    }
    
    // Debug output for completed tests
    if (testResults.value.length) {
      console.log('First completed test result:', testResults.value[0]);
    } else {
      console.log('No completed tests found');
    }
    
    console.log('Completed tests computed property:', completedTests.value);
  } catch (error) {
    console.error('Error fetching test data:', error);
    message.error('Failed to load tests');
  } finally {
    loading.value = false;
  }
};

// Development helper to generate mock test results
const generateMockTestResults = () => {
  if (!internTests.value.length) {
    console.log('No tests available to generate mock results');
    return;
  }
  
  // Create a mock test result for the first few tests
  const testsToMock = Math.min(internTests.value.length, 3);
  for (let i = 0; i < testsToMock; i++) {
    const test = internTests.value[i];
    console.log(`Generating mock result for test: ${test.title}`);
    
    // Create random score between passing score and 100 or below passing score
    const isPassed = Math.random() > 0.3; // 70% chance of passing
    const passingScore = test.passingScore || 70;
    const score = isPassed 
      ? Math.floor(passingScore + (Math.random() * (100 - passingScore))) 
      : Math.floor(Math.random() * (passingScore - 10));
    
    // Generate result with all required fields
    const mockResult = {
      id: `mock-${test.id}`,
      testId: test.id,
      internId: currentUserId.value,
      score: score,
      passingScore: passingScore,
      passed: isPassed,
      submissionDate: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 10 days
      classId: test.classId || (test.lesson && test.lesson.classId),
      answers: {}
    };
    
    testResults.value.push(mockResult);
  }
  
  console.log(`Generated ${testsToMock} mock test results for development`);
};

const applyFilters = () => {
  // The filtering is already handled by computed properties
  // This method exists to handle the search button press
};

const applyCompletedFilters = () => {
  // The filtering is already handled by computed properties
  // This method exists to handle the search button press
};

const refreshData = async () => {
  try {
    await Promise.all([
      fetchTestsData(),
      internClassStore.fetchInternClasses(currentUserId.value)
    ]);
    message.success('Test data refreshed successfully');
  } catch (error) {
    console.error('Error refreshing data:', error);
    message.error('Failed to refresh data');
  }
};

const goToTest = (testId) => {
  router.push(`/intern/tests/${testId}`);
};

const viewTestResults = (testId) => {
  router.push(`/intern/tests/${testId}?view=results`);
};

const formatDuration = (minutes) => {
  return `${minutes} min`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleString();
};

const getClassNameById = (classId) => {
  if (!classId) return 'Unknown';
  const classObj = internClasses.value.find(c => c.id === classId);
  return classObj ? classObj.name : 'Unknown';
};

const isTestAvailable = (test) => {
  if (!test.scheduledStartTime || !test.scheduledEndTime) {
    return true; // Test is available anytime
  }
  
  const now = new Date();
  const start = new Date(test.scheduledStartTime);
  const end = new Date(test.scheduledEndTime);
  
  return now >= start && now <= end;
};

const isTestScheduledForFuture = (test) => {
  if (!test.scheduledStartTime) return false;
  
  const now = new Date();
  const start = new Date(test.scheduledStartTime);
  
  return start > now;
};

const getTimeUntilTestStarts = (test) => {
  if (!test.scheduledStartTime) return '';
  
  const now = new Date();
  const start = new Date(test.scheduledStartTime);
  
  if (now >= start) return '';
  
  const diffMs = start - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `Available in ${diffDays} day${diffDays > 1 ? 's' : ''} and ${diffHrs} hour${diffHrs > 1 ? 's' : ''}`;
  } else if (diffHrs > 0) {
    return `Available in ${diffHrs} hour${diffHrs > 1 ? 's' : ''} and ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  } else {
    return `Available in ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  }
};

const getTestAvailabilityStatus = (test) => {
  if (!test.scheduledStartTime || !test.scheduledEndTime) {
    return 'Available Now';
  }
  
  const now = new Date();
  const start = new Date(test.scheduledStartTime);
  const end = new Date(test.scheduledEndTime);
  
  if (now < start) {
    return 'Coming Soon';
  } else if (now > end) {
    return 'No Longer Available';
  } else {
    return 'Available Now';
  }
};

const getTestAvailabilityColor = (test) => {
  if (!test.scheduledStartTime || !test.scheduledEndTime) {
    return 'green';
  }
  
  const now = new Date();
  const start = new Date(test.scheduledStartTime);
  const end = new Date(test.scheduledEndTime);
  
  if (now < start) {
    return 'orange';
  } else if (now > end) {
    return 'red';
  } else {
    return 'green';
  }
};

const getTestActionText = (test) => {
  if (!test.scheduledStartTime || !test.scheduledEndTime) {
    return 'Take Test';
  }
  
  const now = new Date();
  const start = new Date(test.scheduledStartTime);
  const end = new Date(test.scheduledEndTime);
  
  if (now < start) {
    return 'View Test Details';
  } else if (now > end) {
    return 'Test Unavailable';
  } else {
    return 'Take Test';
  }
};
</script>

<style scoped>
.intern-tests-container {
  padding: 20px;
}

.filters-container {
  display: flex;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.test-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  border-radius: 8px;
  overflow: hidden;
}

.test-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.test-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.test-info {
  flex: 1;
  margin-bottom: 16px;
  line-height: 1.6;
}

.test-info p {
  margin-bottom: 8px;
}

.test-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-remaining {
  font-size: 12px;
  color: #fa8c16;
  text-align: center;
  padding-top: 4px;
}

/* Tab styling */
:deep(.ant-tabs-nav) {
  margin-bottom: 24px;
}

:deep(.ant-tabs-tab) {
  font-size: 16px;
  padding: 12px 20px;
}

:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  font-weight: 600;
}

/* Stats tag styling */
:deep(.ant-tag) {
  font-size: 14px;
  padding: 4px 8px;
  margin-right: 8px;
}
</style> 