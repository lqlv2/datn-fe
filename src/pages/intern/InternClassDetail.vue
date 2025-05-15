<template>
  <div class="class-detail-container">
    <a-page-header
      :title="classDetail?.name || 'Class Details'"
      @back="goBack"
    >
      <template #tags>
        <a-tag v-if="classDetail?.status" :color="getStatusColor(classDetail.status)">
          {{ classDetail.status }}
        </a-tag>
      </template>
      
      <template #extra>
        <a-button @click="refreshData">
          <reload-outlined />
          Refresh
        </a-button>
      </template>
    </a-page-header>
    
    <a-spin :spinning="loading">
      <a-card title="Class Information" class="info-card">
        <a-descriptions bordered :column="{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }">
          <a-descriptions-item label="Code">{{ classDetail?.code }}</a-descriptions-item>
          <a-descriptions-item label="Mentor">{{ classDetail?.mentor?.fullname || 'Not assigned' }}</a-descriptions-item>
          <a-descriptions-item label="Schedule">{{ formatSchedule(classDetail) }}</a-descriptions-item>
          <a-descriptions-item label="Description">{{ classDetail?.description || 'No description' }}</a-descriptions-item>
        </a-descriptions>
        
        <div v-if="classDetail?.detailedDescription" class="detailed-description">
          <a-divider>Detailed Description</a-divider>
          <div v-html="classDetail.detailedDescription"></div>
        </div>
      </a-card>
      
      <a-tabs class="content-tabs">
        <a-tab-pane key="documents" tab="Documents">
          <a-empty v-if="!classDocuments || classDocuments.length === 0" description="No documents available for this class" />
          
          <div v-else class="document-list">
            <a-tabs>
              <a-tab-pane key="db-documents" tab="Class Documents">
                <a-table
                  :dataSource="classDocuments"
                  :columns="documentColumns"
                  :pagination="{ pageSize: 10 }"
                  :row-key="record => record.id"
                >
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'fileName'">
                      <a @click="downloadDocument(record)">{{ record.fileName }}</a>
                    </template>
                    <template v-if="column.key === 'fileSize'">
                      {{ formatFileSize(record.fileSize) }}
                    </template>
                    <template v-if="column.key === 'type'">
                      <a-tag color="blue">{{ record.type }}</a-tag>
                    </template>
                    <template v-if="column.key === 'action'">
                      <a-button type="primary" size="small" @click="downloadDocument(record)">
                        <download-outlined />
                        Download
                      </a-button>
                    </template>
                  </template>
                </a-table>
              </a-tab-pane>
              
              <a-tab-pane key="s3-documents" tab="Additional Resources">
                <a-input-search
                  placeholder="Filter by prefix"
                  style="width: 300px; margin-bottom: 16px"
                  v-model:value="s3Prefix"
                  @search="fetchS3Documents"
                  enter-button
                />
                
                <a-table
                  :dataSource="s3Documents"
                  :columns="s3DocumentColumns"
                  :pagination="{ pageSize: 10 }"
                  :row-key="record => record.s3Key"
                >
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'fileName'">
                      <a @click="downloadS3Document(record)">{{ record.fileName }}</a>
                    </template>
                    <template v-if="column.key === 'fileSize'">
                      {{ formatFileSize(record.fileSize) }}
                    </template>
                    <template v-if="column.key === 'action'">
                      <a-button type="primary" size="small" @click="downloadS3Document(record)">
                        <download-outlined />
                        Download
                      </a-button>
                    </template>
                  </template>
                </a-table>
              </a-tab-pane>
            </a-tabs>
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="tests" tab="Tests">
          <a-empty v-if="!classTests || classTests.length === 0" description="No tests available for this class" />
          
          <div v-else class="test-list">
            <a-table
              :dataSource="classTests"
              :columns="testColumns"
              :pagination="{ pageSize: 10 }"
              :row-key="record => record.id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'title'">
                  <router-link :to="`/intern/tests/${record.id}`">{{ record.title }}</router-link>
                </template>
                <template v-if="column.key === 'status'">
                  <a-tag :color="record.isPublished ? 'green' : 'orange'">
                    {{ record.isPublished ? 'Published' : 'Unpublished' }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                  <a-button 
                    type="primary" 
                    size="small" 
                    @click="goToTest(record.id)"
                    :disabled="!record.isPublished"
                  >
                    <form-outlined />
                    Take Test
                  </a-button>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="interns" tab="Classmates">
          <a-empty v-if="!classDetail?.interns || classDetail.interns.length === 0" description="No interns in this class" />
          
          <div v-else class="interns-list">
            <a-list
              :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 5 }"
              :data-source="classDetail.interns"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-card>
                    <template #title>{{ item.fullname }}</template>
                    <template #extra>
                      <a-avatar>{{ getInitials(item.fullname) }}</a-avatar>
                    </template>
                    <p><strong>Email:</strong> {{ item.email }}</p>
                    <p v-if="item.phone"><strong>Phone:</strong> {{ item.phone }}</p>
                  </a-card>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClassStore } from '@/stores/classStore';
import { useTestStore } from '@/stores/testStore';
import { message } from 'ant-design-vue';
import { 
  ReloadOutlined, 
  DownloadOutlined,
  FormOutlined
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import {fetchClassDocuments} from "@/services/classService.js";

const route = useRoute();
const router = useRouter();
const classStore = useClassStore();
const testStore = useTestStore();

const classId = computed(() => route.params.id);
const classDetail = ref(null);
const classDocuments = ref([]);
const classTests = ref([]);
const loading = ref(false);
const s3Documents = ref([]);
const s3Prefix = ref('');

// Table columns
const documentColumns = [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'File Name',
    dataIndex: 'fileName',
    key: 'fileName',
  },
  {
    title: 'File Size',
    dataIndex: 'fileSize',
    key: 'fileSize',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: 'Uploaded At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (text) => text ? new Date(text).toLocaleString() : '',
  },
  {
    title: 'Action',
    key: 'action',
  },
];

const testColumns = [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'Duration',
    dataIndex: 'durationMinutes',
    key: 'duration',
    render: (text) => `${text} minutes`,
  },
  {
    title: 'Passing Score',
    dataIndex: 'passingScore',
    key: 'passingScore',
  },
  {
    title: 'Status',
    dataIndex: 'isPublished',
    key: 'status',
  },
  {
    title: 'Scheduled Period',
    key: 'scheduledPeriod',
    customRender: ({ record }) => {
      if (record.scheduledStartTime && record.scheduledEndTime) {
        return `${formatDate(record.scheduledStartTime)} - ${formatDate(record.scheduledEndTime)}`;
      }
      return 'Any time';
    }
  },
  {
    title: 'Action',
    key: 'action',
  },
];

const s3DocumentColumns = [
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
    title: 'Last Modified',
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

onMounted(async () => {
  loading.value = true;
  
  try {
    // Fetch all the necessary data
    await Promise.all([
      fetchClassDetails(),
      fetchInterns(),
      fetchClassDocuments(),
      fetchS3Documents(),
      fetchMentor()
    ]);
  } catch (error) {
    console.error('Error loading class data:', error);
    message.error('Failed to load class data');
  } finally {
    loading.value = false;
  }
});

const fetchData = async () => {
  loading.value = true;
  try {
    const classResponse = await classStore.fetchClassById(classId.value);
    classDetail.value = classResponse.data;
    
    const documentsResponse = await classStore.fetchClassDocuments(classId.value);
    classDocuments.value = documentsResponse.data || [];
    
    const testsResponse = await testStore.fetchTestsByClassId(classId.value);
    classTests.value = testsResponse || [];
  } catch (error) {
    console.error('Error fetching class data:', error);
    message.error('Failed to load class data');
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  fetchData();
  message.success('Data refreshed');
};

const goBack = () => {
  router.push('/intern/classes');
};

const goToTest = (testId) => {
  const test = classTests.value.find(t => t.id === testId);
  if (test && !isTestAvailable(test)) {
    if (test.scheduledStartTime && new Date() < new Date(test.scheduledStartTime)) {
      message.warning(`This test is not available yet. It starts at ${formatDate(test.scheduledStartTime)}`);
    } else if (test.scheduledEndTime && new Date() > new Date(test.scheduledEndTime)) {
      message.warning(`This test is no longer available. It ended at ${formatDate(test.scheduledEndTime)}`);
    }
    return;
  }
  router.push(`/intern/tests/${testId}`);
};

const formatSchedule = (classItem) => {
  if (!classItem) return 'N/A';
  
  const days = classItem.scheduleDays ? classItem.scheduleDays.join(', ') : 'N/A';
  const times = classItem.startTime && classItem.endTime 
    ? `${classItem.startTime} - ${classItem.endTime}` 
    : '';
  
  return times ? `${days} (${times})` : days;
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

const downloadDocument = async (document) => {
  try {
    loading.value = true;
    const response = await classStore.downloadClassDocument(classId.value, document.id);
    
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

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleString();
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

const fetchS3Documents = async () => {
  try {
    const response = await classStore.fetchS3ClassDocuments(classId.value, s3Prefix.value);
    if (response && response.data) {
      s3Documents.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching S3 documents:', error);
  }
};

const downloadS3Document = async (document) => {
  try {
    loading.value = true;
    
    // Check if it has a download URL or if we need to get one
    let downloadUrl = document.downloadUrl;
    
    if (!downloadUrl && document.id && document.id > 0) {
      // This is a database document with an S3 key, get a presigned URL
      const response = await classStore.getDocumentPresignedUrl(classId.value, document.id);
      downloadUrl = response;
    } else if (!downloadUrl) {
      // This is a direct S3 object without a database entry
      message.error('Direct download not available for this file');
      loading.value = false;
      return;
    }
    
    // Download using the URL
    const response = await classStore.directDownloadDocument(downloadUrl);
    
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
    console.error('Error downloading S3 document:', error);
    message.error('Failed to download document');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.class-detail-container {
  padding: 20px;
}

.info-card {
  margin-bottom: 20px;
}

.detailed-description {
  margin-top: 20px;
}

.content-tabs {
  background-color: white;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.document-list,
.test-list,
.interns-list {
  margin-top: 16px;
}
</style> 