<template>
  <div class="class-detail">
    <div class="page-header">
      <a-breadcrumb class="breadcrumb">
        <a-breadcrumb-item>
          <router-link to="/admin/classes">
            <a-typography-link>Classes</a-typography-link>
          </router-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>
          <a-typography-text strong>{{ classDetail.name || 'Class Detail' }}</a-typography-text>
        </a-breadcrumb-item>
      </a-breadcrumb>
      
      <div class="header-actions">
        <a-button @click="handleGoBack">
          <template #icon><arrow-left-outlined /></template>
          Back
        </a-button>
      </div>
    </div>

    <a-spin :spinning="loading">
      <!-- Class Info Card -->
      <a-card class="info-card" title="Class Information">
        <a-descriptions bordered :column="{ xs: 1, sm: 2, md: 3 }">
          <a-descriptions-item label="Class Name">{{ classDetail.name }}</a-descriptions-item>
          <a-descriptions-item label="Status">
            <a-tag :color="getStatusColor(classDetail.status)">{{ classDetail.status }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Duration">{{ formatDateRange(classDetail.startDate, classDetail.endDate) }}</a-descriptions-item>
          <a-descriptions-item label="Mentor">
            <span v-if="classDetail.mentor">{{ classDetail.mentor.fullname }}</span>
            <a-button v-else size="small" @click="showAssignMentorModal" type="primary">
              Assign Mentor
            </a-button>
          </a-descriptions-item>
          <a-descriptions-item label="Schedule">
            <span v-if="classDetail.scheduleDays && classDetail.scheduleDays.length">
              {{ classDetail.scheduleDays.join(', ') }} 
              <span v-if="classDetail.startTime && classDetail.endTime">
                ({{ classDetail.startTime }} - {{ classDetail.endTime }})
              </span>
            </span>
            <span v-else>No schedule defined</span>
          </a-descriptions-item>
          <a-descriptions-item label="Interns">
            {{ classDetail.interns?.length || 0 }} interns enrolled
          </a-descriptions-item>
          <a-descriptions-item label="Description" :span="3">
            {{ classDetail.description || 'No description provided.' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- Detailed Description Card -->
      <a-card v-if="classDetail.detailedDescription" class="info-card" title="Detailed Description" style="margin-top: 16px">
        <div class="detailed-description" v-html="renderedDetailedDescription"></div>
      </a-card>

      <!-- Tab Navigation -->
      <a-tabs v-model:activeKey="activeTabKey" class="detail-tabs">
        <a-tab-pane key="interns" tab="Interns">
          <div class="tab-actions">
            <a-button type="primary" @click="showAddInternsModal">
              <template #icon><user-add-outlined /></template>
              Add Interns
            </a-button>
          </div>
          
          <a-table
            :dataSource="classDetail.interns || []"
            :columns="internColumns"
            :pagination="internPagination"
            row-key="id"
            :scroll="{ x: 1200 }"
            class="custom-table"
            bordered
          >
            <template #action="{ record }">
              <a-button type="danger" size="small" @click="showRemoveInternConfirm(record)">
                <delete-outlined />
                Remove
              </a-button>
            </template>
          </a-table>
        </a-tab-pane>
        
        <a-tab-pane key="documents" tab="Documents">
          <div class="tab-actions">
            <a-button type="primary" @click="showUploadDocumentModal">
              <template #icon><upload-outlined /></template>
              Upload Document
            </a-button>
          </div>
          
          <a-table
            :dataSource="classDocuments"
            :columns="documentColumns"
            :pagination="documentPagination"
            row-key="id"
            :scroll="{ x: 1200 }"
            class="custom-table"
            bordered
          >
            <template #fileName="{ text, record }">
              <a @click="downloadDocument(record)">{{ text }}</a>
            </template>
            
            <template #fileSize="{ text }">
              {{ formatFileSize(text) }}
            </template>
            
            <template #type="{ text }">
              <a-tag color="blue">{{ text }}</a-tag>
            </template>
            
            <template #action="{ record }">
              <div class="action-buttons">
                <a-button type="primary" size="small" @click="downloadDocument(record)">
                  <download-outlined />
                  Download
                </a-button>
                <a-button type="danger" size="small" @click="showDeleteDocumentConfirm(record)">
                  <delete-outlined />
                  Delete
                </a-button>
              </div>
            </template>
          </a-table>
        </a-tab-pane>
        
        <a-tab-pane key="tests" tab="Tests & Assessments">
          <div class="tab-actions">
            <a-button type="primary" @click="showCreateTestModal">
              <template #icon><plus-outlined /></template>
              Create Test
            </a-button>
          </div>
          
          <a-table
            :dataSource="tests"
            :columns="testColumns"
            :pagination="testPagination"
            row-key="id"
            :scroll="{ x: 1200 }"
            class="custom-table"
            bordered
          >
            <template #title="{ record, text }">
              <a @click="handleViewTest(record)">{{ text }}</a>
            </template>
            
            <template #status="{ text }">
              <a-tag :color="getTestStatusColor(text)">{{ text === true ? 'Published' : 'Unpublished' }}</a-tag>
            </template>
            
            <template #action="{ record }">
              <div class="action-buttons">
                <a-button type="primary" size="small" @click="handleViewTest(record)">
                  <eye-outlined />
                  View
                </a-button>
                <a-button size="small" @click="handleEditTest(record)">
                  <edit-outlined />
                  Edit
                </a-button>
                <a-button type="danger" size="small" @click="showDeleteTestConfirm(record)">
                  <delete-outlined />
                  Delete
                </a-button>
              </div>
            </template>
          </a-table>
        </a-tab-pane>
        
        <a-tab-pane key="statistics" tab="Statistics">
          <a-row :gutter="[16, 16]">
            <!-- Average Score Card -->
            <a-col :xs="24" :md="8">
              <a-card class="stat-card">
                <template #title>
                  <div class="stat-title">
                    <trophy-outlined class="stat-icon" />
                    Average Score
                  </div>
                </template>
                <div class="stat-value">{{ statistics.averageScore || '0' }}/10</div>
                <a-progress 
                  :percent="(statistics.averageScore || 0) * 10" 
                  :status="getProgressStatus(statistics.averageScore)" 
                  :stroke-color="getProgressColor(statistics.averageScore)" 
                />
              </a-card>
            </a-col>
            
            <!-- Completion Rate Card -->
            <a-col :xs="24" :md="8">
              <a-card class="stat-card">
                <template #title>
                  <div class="stat-title">
                    <check-circle-outlined class="stat-icon" />
                    Completion Rate
                  </div>
                </template>
                <div class="stat-value">{{ statistics.completionRate || '0' }}%</div>
                <a-progress 
                  :percent="statistics.completionRate || 0" 
                  :status="getProgressStatus(statistics.completionRate / 10)" 
                  :stroke-color="getProgressColor(statistics.completionRate / 10)" 
                />
              </a-card>
            </a-col>
            
            <!-- Attendance Rate Card -->
            <a-col :xs="24" :md="8">
              <a-card class="stat-card">
                <template #title>
                  <div class="stat-title">
                    <calendar-outlined class="stat-icon" />
                    Attendance Rate
                  </div>
                </template>
                <div class="stat-value">{{ statistics.attendanceRate || '0' }}%</div>
                <a-progress 
                  :percent="statistics.attendanceRate || 0" 
                  :status="getProgressStatus(statistics.attendanceRate / 10)" 
                  :stroke-color="getProgressColor(statistics.attendanceRate / 10)" 
                />
              </a-card>
            </a-col>
            
            <!-- Score Distribution Chart -->
            <a-col :span="24">
              <a-card title="Score Distribution" class="chart-card">
                <div class="chart-container" ref="scoreDistributionChart"></div>
              </a-card>
            </a-col>
              <!-- Test Average Scores Chart -->
            <a-col :span="24">
              <a-card title="Test Average Scores" class="chart-card">
                <div class="chart-container" ref="testScoresChart"></div>
              </a-card>
            </a-col>
            
            <!-- Performance Over Time Chart -->
            <a-col :span="24">
              <a-card title="Performance Over Time" class="chart-card">
                <div class="chart-container" ref="performanceChart"></div>
              </a-card>
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>
      
      <!-- Assign Mentor Modal -->
      <a-modal
        v-model:visible="assignMentorModalVisible"
        title="Assign Mentor to Class"
        @ok="handleAssignMentor"
        :confirmLoading="confirmLoading"
        width="500px"
      >
        <a-form :model="assignMentorForm" layout="vertical">
          <a-form-item label="Select Mentor" name="mentorId">
            <a-select 
              v-model:value="assignMentorForm.mentorId" 
              placeholder="Select a mentor"
              show-search
              :filter-option="filterOption"
            >
              <a-select-option v-for="mentor in mentors" :key="mentor.id" :value="mentor.id">
                {{ mentor.fullname }} ({{ mentor.email }})
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-modal>
      
      <!-- Add Interns Modal -->
      <a-modal
        v-model:visible="addInternsModalVisible"
        title="Add Interns to Class"
        @ok="handleAddInterns"
        :confirmLoading="confirmLoading"
        width="600px"
      >
        <a-form :model="addInternsForm" layout="vertical">
          <a-form-item label="Select Interns" name="internIds">
            <a-select 
              v-model:value="addInternsForm.internIds" 
              placeholder="Select interns"
              mode="multiple"
              show-search
              :filter-option="filterOption"
              style="width: 100%"
            >
              <a-select-option 
                v-for="intern in availableInterns" 
                :key="intern.id" 
                :value="intern.id"
              >
                {{ intern.fullname }} ({{ intern.email }})
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-modal>
      
      <!-- Upload Document Modal -->
      <a-modal
        v-model:visible="uploadDocumentModalVisible"
        title="Upload Document"
        @ok="handleUploadDocument"
        :confirmLoading="confirmLoading"
        width="500px"
      >
        <a-form :model="documentForm" layout="vertical" ref="documentFormRef">
          <a-form-item label="Title" name="title" :rules="[{ required: true, message: 'Please enter document title' }]">
            <a-input v-model:value="documentForm.title" placeholder="Enter document title" />
          </a-form-item>
          
          <a-form-item label="Description" name="description">
            <a-textarea v-model:value="documentForm.description" placeholder="Enter document description" rows="3" />
          </a-form-item>
          
          <a-form-item label="Document Type" name="type" :rules="[{ required: true, message: 'Please select document type' }]">
            <a-select v-model:value="documentForm.type" placeholder="Select document type">
              <a-select-option value="SYLLABUS">Syllabus</a-select-option>
              <a-select-option value="ASSIGNMENT">Assignment</a-select-option>
              <a-select-option value="LECTURE">Lecture</a-select-option>
              <a-select-option value="REFERENCE">Reference</a-select-option>
              <a-select-option value="OTHER">Other</a-select-option>
            </a-select>
          </a-form-item>
          
          <a-form-item label="File" name="file" :rules="[{ required: true, message: 'Please select a file to upload' }]">
            <a-upload
              v-model:fileList="documentFileList"
              :beforeUpload="beforeUpload"
              :maxCount="1"
            >
              <a-button>
                <template #icon><upload-outlined /></template>
                Select File
              </a-button>
            </a-upload>
          </a-form-item>
        </a-form>
      </a-modal>
      
      <!-- Create/Edit Test Modal -->
      <a-modal
        v-model:visible="testModalVisible"
        :title="editTestMode ? 'Edit Test' : 'Create New Test'"
        @ok="handleSaveTest"
        :confirmLoading="confirmLoading"
        width="600px"
      >
        <a-form :model="testForm" :rules="testRules" ref="testFormRef" layout="vertical">
          <a-form-item label="Test Title" name="title">
            <a-input v-model:value="testForm.title" placeholder="Enter test title" />
          </a-form-item>
          
          <a-form-item label="Passing Score" name="passingScore">
            <a-input-number v-model:value="testForm.passingScore" :min="1" :max="100" style="width: 100%" />
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
          
          <a-form-item label="Description" name="description">
            <a-textarea v-model:value="testForm.description" placeholder="Enter test description" rows="4" />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-spin>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, nextTick, watchEffect, computed} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClassStore } from '@/stores/classStore';
import { useMentorStore } from '@/stores/mentorStore';
import { useInternStore } from '@/stores/internStore';
import { useTestStore } from '@/stores/testStore';
import { 
  ArrowLeftOutlined, EyeOutlined, EditOutlined, DeleteOutlined, 
  PlusOutlined, UserAddOutlined, TrophyOutlined, CheckCircleOutlined, CalendarOutlined, UploadOutlined, DownloadOutlined
} from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import * as echarts from 'echarts/core';
import { 
  BarChart, LineChart, PieChart 
} from 'echarts/charts';
import {
  TitleComponent, TooltipComponent, LegendComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Register ECharts components
echarts.use([
  TitleComponent, TooltipComponent, LegendComponent,
  GridComponent, BarChart, LineChart, PieChart, CanvasRenderer
]);

// Router and stores
const route = useRoute();
const router = useRouter();
const classStore = useClassStore();
const mentorStore = useMentorStore();
const internStore = useInternStore();
const testStore = useTestStore();

// Data & state
const classDetail = ref({});
const mentors = ref([]);
const availableInterns = ref([]);
const tests = ref([]);
const classDocuments = ref([]);
const statistics = ref({
  averageScore: 0,
  completionRate: 0,
  attendanceRate: 0,
  scoreDistribution: [],
  performanceOverTime: []
});

// UI state
const loading = ref(false);
const confirmLoading = ref(false);
const activeTabKey = ref('interns');
const assignMentorModalVisible = ref(false);
const addInternsModalVisible = ref(false);
const testModalVisible = ref(false);
const editTestMode = ref(false);
const testFormRef = ref(null);
const uploadDocumentModalVisible = ref(false);

// Charts refs
const scoreDistributionChart = ref(null);
const performanceChart = ref(null);
const testScoresChart = ref(null);
let chartInstances = {};

// Form models
const assignMentorForm = reactive({
  mentorId: null
});

const addInternsForm = reactive({
  internIds: []
});

const testForm = reactive({
  id: null,
  title: '',
  description: '',
  durationMinutes: 60,
  passingScore: 70,
  isPublished: true,
  hasFixedPeriod: true,
  scheduledStartTime: null,
  scheduledEndTime: null
});

const documentForm = reactive({
  title: '',
  description: '',
  type: 'SYLLABUS'
});

const documentFileList = ref([]);

// Table configurations
const internColumns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    align: 'center',
  },
  {
    title: 'Full Name',
    dataIndex: 'fullname',
    key: 'fullname',
    align: 'center',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    align: 'center',
    key: 'email',
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    align: 'center',
    key: 'phone',
  },
  {
    title: 'Average Score',
    dataIndex: 'averageScore',
    key: 'averageScore',
    align: 'center',
  },
  {
    title: 'Action',
    key: 'action',
    slots: { customRender: 'action' },
    align: 'center',
  }
];

const testColumns = [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    align: 'center',
    slots: { customRender: 'title' }
  },
  {
    title: 'Passing Score',
    dataIndex: 'passingScore',
    key: 'passingScore',
    align: 'center',
  },
  {
    title: 'Status',
    dataIndex: 'isPublished',
    key: 'isPublished',
    align: 'center',
    slots: { customRender: 'status' }
  },
  {
    title: 'Scheduled Time',
    key: 'scheduledTime',
    align: 'center',
    customRender: ({ record }) => {
      if (record.scheduledStartTime && record.scheduledEndTime) {
        return `${dayjs(record.scheduledStartTime).format('YYYY-MM-DD HH:mm')} - ${dayjs(record.scheduledEndTime).format('HH:mm')}`;
      }
      return 'Any time';
    }
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
    render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '',
  },
  {
    title: 'Avg. Score',
    dataIndex: 'averageScore',
    key: 'averageScore',
    align: 'center',
  },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    slots: { customRender: 'action' }
  }
];

const documentColumns = [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    align: 'center',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    align: 'center',
  },
  {
    title: 'File Name',
    dataIndex: 'fileName',
    key: 'fileName',
    align: 'center',
    slots: { customRender: 'fileName' }
  },
  {
    title: 'File Size',
    dataIndex: 'fileSize',
    key: 'fileSize',
    align: 'center',
    slots: { customRender: 'fileSize' }
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    align: 'center',
    slots: { customRender: 'type' }
  },
  {
    title: 'Uploaded At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
    render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '',
  },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    slots: { customRender: 'action' }
  }
];

const internPagination = reactive({
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
});

const testPagination = reactive({
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
});

const documentPagination = reactive({
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
});

const testRules = {
  title: [{ required: true, message: 'Please enter the test title', trigger: 'blur' }],
  durationMinutes: [{ required: true, message: 'Please enter the duration', trigger: 'blur' }],
  passingScore: [{ required: true, message: 'Please enter the passing score', trigger: 'blur' }],
};

// Computed properties
const renderedDetailedDescription = computed(() => {
  // You can use a Markdown library here if you want to support markdown
  return classDetail.value.detailedDescription || '';
});

// Initialize data
onMounted(async () => {
  loading.value = true;
  try {
    const classId = route.params.id;
    
    // Fetch all data needed
    await Promise.all([
      fetchClassDetails(classId),
      fetchInternsByClass(classId),
      fetchAvailableInterns(classId),
      fetchTests(classId),
      fetchStatistics(classId),
      fetchMentors(),
      fetchClassDocuments(classId)
    ]);
    
    // Setup charts after data is loaded
    await nextTick(() => {
      initCharts();
    });
  } catch (error) {
    console.error('Error initializing class detail data:', error);
    message.error('Failed to load class details');
  } finally {
    loading.value = false;
  }
});

// Methods
const fetchClassDetails = async (id) => {
  loading.value = true;
  try {
    const response = await classStore.fetchClassById(id);
    classDetail.value = response.data;
  } catch (error) {
    console.error('Error fetching class details:', error);
    message.error('Failed to load class details');
  } finally {
    loading.value = false;
  }
};

const fetchMentors = async () => {
  try {
    await mentorStore.list(1, 10000, {});
    mentors.value = mentorStore.mentors || [];
  } catch (error) {
    console.error('Error fetching mentors:', error);
  }
};

const fetchInternsByClass = async (classId) => {
  try {
    const response = await classStore.fetchClassInterns(classId);
    if (classDetail.value) {
      classDetail.value.interns = response || [];
    }
  } catch (error) {
    console.error('Error fetching class interns:', error);
  }
};

const fetchAvailableInterns = async (classId) => {
  try {
    const response = await classStore.fetchInternsNotInClass(classId);
    availableInterns.value = response || [];
  } catch (error) {
    console.error('Error fetching available interns:', error);
  }
};

const fetchTests = async (classId) => {
  try {
    const response = await testStore.fetchTestsByClassId(classId);
    console.log(response);
    tests.value = response || [];
  } catch (error) {
    console.error('Error fetching tests:', error);
  }
};

const fetchStatistics = async (classId) => {
  try {
    const response = await classStore.fetchClassStatistics(classId);
    if (response) {
      statistics.value = response;
    } else {
      // If no statistics available, create empty structure
      statistics.value = {
        averageScore: 0,
        completionRate: 0,
        attendanceRate: 0,
        testAvgScores: [],
        passingRate: 0,
        scoreDistribution: {
          '<60': 0,
          '60-70': 0,
          '71-80': 0,
          '81-90': 0,
          '91-100': 0
        },
        performanceOverTime: []
      };
    }
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
};

const handleGoBack = () => {
  router.push('/admin/classes');
};

const showAssignMentorModal = () => {
  assignMentorForm.mentorId = classDetail.value.mentor?.id || null;
  assignMentorModalVisible.value = true;
};

const handleAssignMentor = async () => {
  if (!assignMentorForm.mentorId) {
    message.error('Please select a mentor');
    return;
  }
  
  confirmLoading.value = true;
  try {
    // Update class with new mentor
    const updateData = {
      mentorId: assignMentorForm.mentorId
    };
    await classStore.updateClass(classDetail.value.id, updateData);
    
    // Refresh class details
    await fetchClassDetails(classDetail.value.id);
    assignMentorModalVisible.value = false;
    message.success('Mentor assigned successfully');
  } catch (error) {
    console.error('Error assigning mentor:', error);
    message.error('Failed to assign mentor');
  } finally {
    confirmLoading.value = false;
  }
};

const showAddInternsModal = async () => {
  addInternsForm.internIds = [];
  // Refresh available interns
  await fetchAvailableInterns(classDetail.value.id);
  addInternsModalVisible.value = true;
};

const handleAddInterns = async () => {
  if (!addInternsForm.internIds.length) {
    message.error('Please select at least one intern');
    return;
  }
  
  confirmLoading.value = true;
  try {
    // Add each intern to the class
    for (const internId of addInternsForm.internIds) {
      await classStore.addInternToClass(classDetail.value.id, internId);
    }
    
    // Refresh class interns and available interns
    await Promise.all([
      fetchClassDetails(classDetail.value.id),
      fetchInternsByClass(classDetail.value.id),
      fetchAvailableInterns(classDetail.value.id)
    ]);
    
    addInternsModalVisible.value = false;
    message.success(`${addInternsForm.internIds.length} interns added to class`);
  } catch (error) {
    console.error('Error adding interns:', error);
    message.error('Failed to add interns');
  } finally {
    confirmLoading.value = false;
  }
};

const showRemoveInternConfirm = (intern) => {
  Modal.confirm({
    title: 'Remove Intern from Class',
    content: `Are you sure you want to remove ${intern.fullname} from this class?`,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    async onOk() {
      try {
        await classStore.removeInternFromClass(classDetail.value.id, intern.id);
        // Refresh class interns and available interns
        await Promise.all([
          fetchInternsByClass(classDetail.value.id),
          fetchAvailableInterns(classDetail.value.id)
        ]);
        message.success('Intern removed successfully');
      } catch (error) {
        console.error('Error removing intern:', error);
        message.error('Failed to remove intern');
      }
    },
  });
};

const showCreateTestModal = () => {
  editTestMode.value = false;
  resetTestForm();
  testModalVisible.value = true;
};

const handleEditTest = (record) => {
  editTestMode.value = true;
  
  testForm.id = record.id;
  testForm.title = record.title;
  testForm.description = record.description || '';
  testForm.durationMinutes = record.durationMinutes;
  testForm.passingScore = record.passingScore;
  testForm.isPublished = record.isPublished;
  testForm.hasFixedPeriod = record.hasFixedPeriod;
  testForm.scheduledStartTime = record.scheduledStartTime;
  testForm.scheduledEndTime = record.scheduledEndTime;
  
  testModalVisible.value = true;
};

const handleSaveTest = () => {
  testFormRef.value.validate().then(async () => {
    try {
      confirmLoading.value = true;
      
      const formattedData = {
        title: testForm.title,
        description: testForm.description,
        durationMinutes: testForm.durationMinutes,
        passingScore: testForm.passingScore,
        isPublished: Boolean(testForm.isPublished),
        hasFixedPeriod: Boolean(testForm.hasFixedPeriod),
        scheduledStartTime: testForm.scheduledStartTime,
        scheduledEndTime: testForm.scheduledEndTime
      };
      
      if (editTestMode.value && testForm.id) {
        await testStore.updateTest(classDetail.value.id, testForm.id, formattedData);
      } else {
        await testStore.createTest(classDetail.value.id, formattedData);
      }
      
      await fetchTests(classDetail.value.id);
      testModalVisible.value = false;
      message.success(`Test ${editTestMode.value ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving test:', error);
      message.error(`Failed to ${editTestMode.value ? 'update' : 'create'} test`);
    } finally {
      confirmLoading.value = false;
    }
  }).catch(errors => {
    console.error("Validation errors:", errors);
    message.error('Please fix the form errors before submitting');
  });
};

const resetTestForm = () => {
  testForm.id = null;
  testForm.title = '';
  testForm.description = '';
  testForm.durationMinutes = 60;
  testForm.passingScore = 70;
  testForm.isPublished = true;
  testForm.hasFixedPeriod = true;
  testForm.scheduledStartTime = null;
  testForm.scheduledEndTime = null;
};

const handleViewTest = (record) => {
  console.log(record);
  router.push(`/admin/tests/${record.id}`);
};

const showDeleteTestConfirm = (test) => {
  Modal.confirm({
    title: 'Delete Test',
    content: `Are you sure you want to delete "${test.title}"? This action cannot be undone.`,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    async onOk() {
      try {
        await testStore.deleteTest(classDetail.value.id, test.id);
        await fetchTests(classDetail.value.id);
        message.success('Test deleted successfully');
      } catch (error) {
        console.error('Error deleting test:', error);
        message.error('Failed to delete test');
      }
    },
  });
};

const initCharts = () => {  // Score distribution chart
  if (scoreDistributionChart.value) {
    if (chartInstances.scoreDistribution) {
      chartInstances.scoreDistribution.dispose();
    }
    
    const scoreData = statistics.value.scoreDistribution || {};
    const chart = echarts.init(scoreDistributionChart.value);
    
    // Convert the score distribution object to an array for the chart
    const scoreDistributionData = Object.entries(scoreData).map(([range, count]) => ({
      name: `${range} points`,
      value: count
    }));
    
    chart.setOption({
      title: {
        text: 'Score Distribution',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: 'Score Distribution',
          type: 'pie',
          radius: '60%',
          data: scoreDistributionData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    });
    
    chartInstances.scoreDistribution = chart;
    
    // Handle resize
    window.addEventListener('resize', () => {
      chart.resize();
    });
  }
  
  // Performance over time chart
  if (performanceChart.value) {
    if (chartInstances.performance) {
      chartInstances.performance.dispose();
    }
    
    const performanceData = statistics.value.performanceOverTime || [];
    const dates = performanceData.map(item => item.date);
    const scores = performanceData.map(item => item.averageScore);
    const completionRates = performanceData.map(item => item.completionRate);
    
    const chart = echarts.init(performanceChart.value);
    chart.setOption({
      title: {
        text: 'Performance Over Time',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Average Score', 'Completion Rate'],
        bottom: '0'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates
      },
      yAxis: [
        {
          type: 'value',
          name: 'Average Score',
          min: 0,
          max: 10,
          position: 'left',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: 'Completion Rate',
          min: 0,
          max: 100,
          position: 'right',
          axisLabel: {
            formatter: '{value}%'
          }
        }
      ],
      series: [
        {
          name: 'Average Score',
          type: 'line',
          data: scores,
          yAxisIndex: 0,
          itemStyle: {
            color: '#1890ff'
          }
        },
        {
          name: 'Completion Rate',
          type: 'bar',
          data: completionRates,
          yAxisIndex: 1,
          itemStyle: {
            color: '#52c41a'
          }
        }
      ]
    });
      chartInstances.performance = chart;
    
    // Handle resize
    window.addEventListener('resize', () => {
      chart.resize();
    });
  }
  
  // Test scores chart
  if (testScoresChart.value) {
    if (chartInstances.testScores) {
      chartInstances.testScores.dispose();
    }
    
    const testScoreData = statistics.value.testAvgScores || [];
    const chart = echarts.init(testScoresChart.value);
    
    chart.setOption({
      title: {
        text: 'Test Average Scores',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: testScoreData.map(item => item.testName),
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: 'Score',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: [
        {
          name: 'Average Score',
          type: 'bar',
          data: testScoreData.map(item => item.avgScore),
          itemStyle: {
            color: function(params) {
              const score = params.value;
              if (score >= 80) return '#52c41a'; // Green for high scores
              if (score >= 70) return '#1890ff'; // Blue for good scores
              if (score >= 60) return '#faad14'; // Orange for average scores
              return '#f5222d'; // Red for low scores
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%'
          }
        }
      ]
    });
    
    chartInstances.testScores = chart;
    
    // Handle resize
    window.addEventListener('resize', () => {
      chart.resize();
    });
  }
};

// Helpers
const filterOption = (input, option) => {
  return (option.children[0] || '').toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const isInternInClass = (internId) => {
  return (classDetail.value.interns || []).some(intern => intern.id === internId);
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return 'Not specified';
  if (startDate && !endDate) return `From ${startDate}`;
  if (!startDate && endDate) return `Until ${endDate}`;
  return `${startDate} to ${endDate}`;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'green';
    case 'PLANNED':
      return 'blue';
    case 'COMPLETED':
      return 'gray';
    default:
      return 'default';
  }
};

const getTestStatusColor = (status) => {
  if (typeof status === 'boolean') {
    return status ? 'green' : 'orange';
  }
  
  switch (status) {
    case true:
      return 'green';
    case false:
      return 'orange';
    default:
      return 'default';
  }
};

const getProgressStatus = (score) => {
  if (score >= 8) return 'success';
  if (score >= 6) return 'normal';
  if (score >= 4) return 'active';
  return 'exception';
};

const getProgressColor = (score) => {
  if (score >= 8) return '#52c41a'; // Green
  if (score >= 6) return '#1890ff'; // Blue
  if (score >= 4) return '#faad14'; // Orange
  return '#f5222d'; // Red
};

// Document management functions
const showUploadDocumentModal = () => {
  documentForm.title = '';
  documentForm.description = '';
  documentForm.type = 'SYLLABUS';
  documentFileList.value = [];
  uploadDocumentModalVisible.value = true;
};

const beforeUpload = (file) => {
  documentFileList.value = [file];
  return false; // Prevent auto upload
};

const handleUploadDocument = async () => {
  if (!documentFileList.value.length) {
    message.error('Please select a file to upload');
    return;
  }
  
  confirmLoading.value = true;
  try {
    const documentData = {
      title: documentForm.title,
      description: documentForm.description,
      type: documentForm.type,
      file: documentFileList.value[0]
    };
    
    await classStore.uploadClassDocument(classDetail.value.id, documentData);
    await fetchClassDocuments(classDetail.value.id);
    uploadDocumentModalVisible.value = false;
    message.success('Document uploaded successfully');
  } catch (error) {
    console.error('Error uploading document:', error);
    message.error('Failed to upload document');
  } finally {
    confirmLoading.value = false;
  }
};

const downloadDocument = async (document) => {
  try {
    loading.value = true;
    const response = await classStore.downloadClassDocument(classDetail.value.id, document.id);
    
    // Create a URL for the blob and trigger a download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', document.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('Document download started');
  } catch (error) {
    console.error('Error downloading document:', error);
    message.error('Failed to download document');
  } finally {
    loading.value = false;
  }
};

const showDeleteDocumentConfirm = (document) => {
  Modal.confirm({
    title: 'Delete Document',
    content: `Are you sure you want to delete "${document.title}"? This action cannot be undone.`,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    async onOk() {
      try {
        await classStore.deleteClassDocument(classDetail.value.id, document.id);
        await fetchClassDocuments(classDetail.value.id);
        message.success('Document deleted successfully');
      } catch (error) {
        console.error('Error deleting document:', error);
        message.error('Failed to delete document');
      }
    },
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const fetchClassDocuments = async (classId) => {
  try {
    const response = await classStore.fetchClassDocuments(classId);
    if (response && response.data) {
      classDocuments.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching class documents:', error);
  }
};

const disableEndDateBeforeStart = (current) => {
  return current && testForm.scheduledStartTime && current < testForm.scheduledStartTime;
};
</script>

<style scoped>
.class-detail {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.breadcrumb {
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.info-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 24px;
}

.info-card :deep(.ant-card-head) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
  padding: 16px 20px;
}

.info-card :deep(.ant-card-head-title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.info-card :deep(.ant-card-body) {
  padding: 20px;
}

.info-card :deep(.ant-descriptions-item-label) {
  background-color: #f0f5ff;
  font-weight: 500;
  color: #344054;
  padding: 12px 16px;
}

.info-card :deep(.ant-descriptions-item-content) {
  padding: 12px 16px;
}

.detail-tabs {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.detail-tabs :deep(.ant-tabs-tab) {
  font-size: 16px;
  padding: 12px 16px;
}

.tab-actions {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.custom-table {
  background: white;
  border-radius: 8px;
}

.custom-table :deep(.ant-table) {
  border-radius: 8px;
}

.custom-table :deep(.ant-table-thead > tr > th) {
  background-color: #f0f5ff;
  font-weight: 600;
  padding: 16px;
  color: #1f2937;
}

.custom-table :deep(.ant-table-tbody > tr > td) {
  padding: 16px;
}

.custom-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #e6f7ff !important;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.detailed-description {
  padding: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.stat-card {
  height: 100%;
}

.stat-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 20px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 16px;
}

.chart-card {
  margin-top: 16px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .class-detail {
    padding: 12px;
  }
  
  .info-card :deep(.ant-card-body),
  .detail-tabs {
    padding: 16px 12px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .chart-container {
    height: 300px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
