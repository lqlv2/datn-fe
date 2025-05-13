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
                    <a-tag color="blue">{{ formatDuration(test.durationMinutes) }}</a-tag>
                  </div>
                </template>
                
                <div class="test-info">
                  <p><strong>Class:</strong> {{ getClassNameById(test.classId) }}</p>
                  <p><strong>Passing Score:</strong> {{ test.passingScore }}%</p>
                  <p v-if="test.description"><strong>Description:</strong> {{ test.description }}</p>
                </div>
                
                <div class="test-actions">
                  <a-button type="primary" block @click="goToTest(test.id)">
                    Take Test
                  </a-button>
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
  return testResults.value.map(result => {
    const test = internTests.value.find(t => t.id === result.testId);
    if (test) {
      return {
        ...test,
        score: result.score,
        passed: result.score >= test.passingScore,
        submissionDate: result.submissionDate
      };
    }
    return null;
  }).filter(Boolean);
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
    await fetchData();
  }
});

const fetchData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      internClassStore.fetchInternClasses(currentUserId.value),
      internClassStore.fetchInternTests(currentUserId.value),
      internClassStore.fetchTestStatistics(currentUserId.value)
    ]);
    
    // Fetch test results for each test
    const results = [];
    for (const test of internTests.value) {
      try {
        const response = await internClassStore.fetchTestResultByIntern(test.id, currentUserId.value);
        if (response && response.data) {
          results.push(response.data);
        }
      } catch (error) {
        // If no result is found, continue to the next test
        console.log(`No results for test ${test.id}`);
      }
    }
    
    testResults.value = results;
  } catch (error) {
    console.error('Error fetching data:', error);
    message.error('Failed to load your tests');
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  fetchData();
  message.success('Data refreshed');
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

const getClassNameById = (classId) => {
  if (!classId) return 'Unknown';
  const classObj = internClasses.value.find(c => c.id === classId);
  return classObj ? classObj.name : 'Unknown';
};

const applyFilters = () => {
  // Implement filter application logic
};

const applyCompletedFilters = () => {
  // Implement filter application logic
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