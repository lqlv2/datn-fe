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
      <a-card class="info-card" title="Class Information">
        <a-descriptions bordered :column="{ xs: 1, sm: 2, md: 3 }">
          <a-descriptions-item label="Class Name">{{ classDetail?.name }}</a-descriptions-item>
          <a-descriptions-item label="Duration">{{
              formatDateRange(classDetail?.startDate, classDetail?.endDate)
            }}
          </a-descriptions-item>
          <a-descriptions-item label="Mentor">
            <span v-if="classDetail?.mentor">{{ classDetail.mentor.fullname }}</span>
            <span v-else>Not assigned</span>
          </a-descriptions-item>
          <a-descriptions-item label="Schedule">
            <span v-if="classDetail?.scheduleDays && classDetail.scheduleDays.length">
              {{ classDetail.scheduleDays.join(', ') }} 
              <span v-if="classDetail.startTime && classDetail.endTime">
                ({{ classDetail.startTime }} - {{ classDetail.endTime }})
              </span>
            </span>
            <span v-else>No schedule defined</span>
          </a-descriptions-item>
          <a-descriptions-item label="Interns">
            {{ classDetail?.interns?.length || 0 }} interns enrolled
          </a-descriptions-item>
          <a-descriptions-item label="Description" :span="3">
            {{ classDetail?.description || 'No description provided.' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- Detailed Description Card -->
      <a-card v-if="classDetail?.detailedDescription" class="info-card" title="Detailed Description"
              style="margin-top: 16px">
        <div class="detailed-description" v-html="renderedDetailedDescription"></div>
      </a-card>

      <a-tabs class="content-tabs">
        <a-tab-pane key="documents" tab="Documents">
          <a-empty v-if="!classDocuments || classDocuments.length === 0" description="No documents available for this class" />
          
          <div v-else class="test-list">
            <a-table
              :dataSource="classDocuments"
              :columns="documentColumns"
              :pagination="{ pageSize: 10 }"
              :row-key="record => record.key"
              bordered
              class="custom-table"
            >
              <template #titles="{ record, text }">
                <a @click="downloadDocument(record)">{{ text }}</a>
              </template>
              <template #action="{ record }">
                <a-space>
                  <a-button type="primary" size="small" @click="downloadDocument(record)">
                    <download-outlined />
                    Download
                  </a-button>
                </a-space>
              </template>
            </a-table>
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
              bordered
              class="custom-table"
            >
              <template #action="{ record }">
                <a-button 
                  type="primary" 
                  size="small" 
                  @click="goToTest(record)"
                  :disabled=" !isTestAvailable(record)"
                >
                  <form-outlined />
                  Take Test
                </a-button>
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
    align: 'center',
    slots: { customRender: 'titles' }
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    align: 'center',
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

const testColumns = [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    align: 'center',
    slots: { customRender: 'title' }
  },
  {
    title: 'Duration',
    dataIndex: 'durationMinutes',
    key: 'duration',
    align: 'center',
    render: (text) => `${text} minutes`,
  },
  {
    title: 'Passing Score',
    dataIndex: 'passingScore',
    key: 'passingScore',
    align: 'center',
  },
  {
    title: 'Scheduled Period',
    key: 'scheduledPeriod',
    align: 'center',
    customRender: ({ record }) => {
      if (record.scheduledStartTime && record.scheduledEndTime) {
        return `${dayjs(record.scheduledStartTime).format('YYYY-MM-DD HH:mm')} - ${dayjs(record.scheduledEndTime).format('YYYY-MM-DD HH:mm')}`;
      }
      return 'Any time';
    }
  },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    slots: { customRender: 'action' }
  }
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
        fetchData(),
      fetchClassDetails(),
      fetchInterns(),
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
    console.log('Fetched tests:', testsResponse);
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

const goToTest = (record) => {
  const testId = record.id;
  const test = classTests.value.find(t => t.id === testId);
  if (test && !isTestAvailable(test)) {
    if (test.scheduledStartTime && dayjs().isBefore(dayjs(test.scheduledStartTime))) {
      message.warning(`This test is not available yet. It starts at ${dayjs(test.scheduledStartTime).format('YYYY-MM-DD HH:mm')}`);
    } else if (test.scheduledEndTime && dayjs().isAfter(dayjs(test.scheduledEndTime))) {
      message.warning(`This test is no longer available. It ended at ${dayjs(test.scheduledEndTime).format('YYYY-MM-DD HH:mm')}`);
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

const downloadDocument = async (doc) => {
  try {
    loading.value = true;
    console.log("Downloading document:", doc);

    // Use the document key for download
    const response = await classStore.downloadClassDocument(classId.value, doc.key);
    console.log("Download response:", response);

    // Get the filename from the response headers or use the document's filename
    const contentDisposition = response.headers['content-disposition'];
    let filename = doc.title;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Create a URL for the blob and trigger a download
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', filename);
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    message.success('Document download started');
  } catch (error) {
    console.error('Error downloading document:', error);
    message.error('Failed to download document: ' + (error.message || ''));
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
  
  const now = dayjs();
  const start = dayjs(test.scheduledStartTime);
  const end = dayjs(test.scheduledEndTime);
  
  return now.isAfter(start) && now.isBefore(end);
};

const fetchS3Documents = async () => {
  try {
    console.log('======class id', classId.value)
    if (classId.value) {
      const response = await classStore.fetchClassDocuments(classId.value);
      if (response && response.data) {
        console.log('======class documents', response.data)
        classDocuments.value = response.data;
      }
    }
  } catch (error) {
    console.error('Error fetching S3 documents:', error);
  }
};

const fetchClassDetails = async () => {
  try {
    const response = await classStore.fetchClassById(classId.value);
    classDetail.value = response.data;
  } catch (error) {
    console.error('Error fetching class details:', error);
    message.error('Failed to load class details');
  }
};

const fetchInterns = async () => {
  try {
    const response = await classStore.fetchClassInterns(classId.value);
    if (classDetail.value) {
      classDetail.value.interns = response || [];
    }
  } catch (error) {
    console.error('Error fetching class interns:', error);
  }
};

const fetchMentor = async () => {
  try {
    // if (classDetail.value && classDetail.value.mentorId) {
    //   const response = await classStore.fetch(classId.value);
    //   if (classDetail.value) {
    //     classDetail.value.mentor = response.data;
    //   }
    // }
  } catch (error) {
    console.error('Error fetching class mentor:', error);
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

const fetchTests = async () => {
  try {
    const response = await testStore.fetchTestsByClassId(classId.value);
    console.log('Fetched tests:', response);
    classTests.value = response || [];
  } catch (error) {
    console.error('Error fetching tests:', error);
    message.error('Failed to load tests');
  }
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return 'Not specified';
  if (startDate && !endDate) return `From ${dayjs(startDate).format('YYYY-MM-DD')}`;
  if (!startDate && endDate) return `Until ${dayjs(endDate).format('YYYY-MM-DD')}`;
  return `${dayjs(startDate).format('YYYY-MM-DD')} to ${dayjs(endDate).format('YYYY-MM-DD')}`;
};

const renderedDetailedDescription = computed(() => {
  return classDetail.value?.detailedDescription || '';
});
</script>

<style scoped>
.class-detail-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
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

.detailed-description {
  padding: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.content-tabs {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.document-list,
.test-list,
.interns-list {
  margin-top: 16px;
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

</style> 