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

const route = useRoute();
const router = useRouter();
const classStore = useClassStore();
const testStore = useTestStore();

const classId = computed(() => route.params.id);
const classDetail = ref(null);
const classDocuments = ref([]);
const classTests = ref([]);
const loading = ref(false);

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
    title: 'Action',
    key: 'action',
  },
];

onMounted(async () => {
  if (classId.value) {
    await fetchData();
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