<template>
  <div class="evaluation-management">
    <div class="page-header">
      <h2 class="header-title">Intern Evaluation Management</h2>
    </div>
    
    <div class="filter-container">
      <a-row :gutter="[24, 16]" align="middle">
        <a-col :xs="24" :sm="24" :md="8" :lg="8">
          <div class="filter-item">
            <a-input 
              v-model:value="filters.name" 
              placeholder="Search by intern name..." 
              class="filter-input"
              allow-clear
            />
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-select 
              placeholder="Overall Rating" 
              class="filter-select"
              v-model:value="filters.overall" 
              allow-clear
            >
              <a-select-option value="Excellent">Excellent</a-select-option>
              <a-select-option value="Good">Good</a-select-option>
              <a-select-option value="Average">Average</a-select-option>
              <a-select-option value="Poor">Poor</a-select-option>
            </a-select>
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-button type="primary" class="search-button" @click="onSearch">
              <template #icon><search-outlined /></template>
              Search
            </a-button>
          </div>
        </a-col>
      </a-row>
    </div>
    
    <div class="table-container">
      <a-table 
        :columns="columns" 
        :data-source="dataSource" 
        :pagination="pagination" 
        :loading="loading" 
        row-key="id"
        :scroll="{ x: 1500, y: 500 }"
        :row-class-name="(_record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')"
        class="custom-table"
        bordered
      >
        <template #averageScore="{ text }">
          <a-tag v-if="String(text) !== '-1'" :color="getScoreColor(text)" class="score-tag">
            {{ text }}
          </a-tag>
          <a-tag v-else color="gray" class="score-tag">N/A</a-tag>
        </template>
        
        <template #overall="{ text }">
          <a-tag v-if="text" :color="getStatusColor(text)" class="status-tag">
            {{ text.toUpperCase() }}
          </a-tag>
          <a-tag v-else color="gray" class="status-tag">N/A</a-tag>
        </template>
        
        <template #action="{ record }">
          <a-button type="primary" size="small" @click="viewEvaluation(record)" class="action-button">
            <eye-outlined />
            View
          </a-button>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue';
import {EyeOutlined, SearchOutlined} from '@ant-design/icons-vue';
import axiosInstance from "@/plugins/axios.js";
import {useRouter} from "vue-router";
import {useAuthStore} from "@/stores/authStore.js";

// Mock Data
const dataSource = ref([
  {
    id: 1,
    name: 'John Doe',
    project: 'Web Development',
    score: 85,
    status: 'Excellent',
  },
  {
    id: 2,
    name: 'Jane Smith',
    project: 'Data Analysis',
    score: 78,
    status: 'Good',
  },
  {
    id: 3,
    name: 'Alice Johnson',
    project: 'Mobile App',
    score: 65,
    status: 'Average',
  },
  {
    id: 4,
    name: 'Bob Brown',
    project: 'AI Research',
    score: 92,
    status: 'Excellent',
  },
  {
    id: 5,
    name: 'Emma Davis',
    project: 'UI/UX Design',
    score: 55,
    status: 'Poor',
  },
]);

const columns = [
  {
    title: 'Intern Name',
    dataIndex: 'internName',
    key: 'name',
    align: "center"
  },
  {
    title: 'Mentor Name',
    dataIndex: 'mentorName',
    key: 'project',
    align: "center"
  },
  {
    title: 'Start date',
    dataIndex: 'startDate',
    key: 'project',
    align: "center"
  },
  {
    title: 'End date',
    dataIndex: 'endDate',
    key: 'project',
    align: "center"
  },

  {
    title: 'Score',
    dataIndex: 'averageScore',
    key: 'averageScore',
    slots: { customRender: 'averageScore' },
    align: "center"
  },
  {
    title: 'Overall',
    dataIndex: 'overall',
    key: 'overall',
    filters: [
      { text: 'Excellent', value: 'Excellent' },
      { text: 'Good', value: 'Good' },
      { text: 'Average', value: 'Average' },
      { text: 'Poor', value: 'Poor' },
    ],
    slots: { customRender: 'status' },
    align: "center"
  },
  {
    title: 'Actions',
    key: 'action',
    slots: { customRender: 'action' },
    align: "center"
  },
];

const loading = ref(false);

const filters = reactive({
  overall: null,
  name: null,
});
const router = useRouter();

const viewEvaluation = (record) => {
  router.push( '/' + useAuthStore().userRole.toLowerCase() + '/evaluation/' + record.internId);
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

const getScoreColor = (score) => {
  const numScore = Number(score);
  if (numScore >= 90) return 'green';
  if (numScore >= 75) return 'blue';
  if (numScore >= 60) return 'orange';
  return 'red';
};

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: dataSource.value.totalElements || 0,
});

const onSearch = () => {
    fetchData(filters)
};

onMounted(() => {
   fetchData()
})

const fetchData = async (params) => {
  axiosInstance.get(('/admin/evaluation?' + Object.entries(params || {}).filter(([key, value]) => value).map(([key, value]) => `${key}=${value}`).join('&')))
      .then((response) => {
        dataSource.value = response.data.data;
        pagination.total = response.data.totalElements;
      })
      .catch((error) => {
        console.error('Error fetching evaluations:', error);
      });
}

</script>

<style scoped>
.evaluation-management {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
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

.filter-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.filter-item {
  margin-bottom: 16px;
}

.filter-input {
  width: 100%;
  border-radius: 6px;
}

.filter-select {
  width: 100%;
  border-radius: 6px;
}

.search-button {
  width: 100%;
  height: 40px;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
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

.custom-table :deep(.ant-table-tbody > tr.table-row-light) {
  background-color: #ffffff;
}

.custom-table :deep(.ant-table-tbody > tr.table-row-dark) {
  background-color: #f7faff;
}

.custom-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #e6f7ff !important;
}

.custom-table :deep(.ant-table-tbody > tr > td) {
  padding: 16px;
}

.score-tag, .status-tag {
  font-weight: medium;
  padding: 2px 8px;
  border-radius: 12px;
}

.action-button {
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .evaluation-management {
    padding: 12px;
  }
  
  .filter-container,
  .table-container {
    padding: 16px;
  }
  
  .header-title {
    font-size: 1.25rem;
  }
}
</style>
