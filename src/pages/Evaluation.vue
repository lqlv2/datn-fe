<template>
  <div class="evaluation-container">
    <a-card title="Intern Evaluation Management" class="evaluation-card">
      <div class="filter-section">
        <a-row :gutter="[16, 16]" align="middle">
          <a-col :xs="24" :sm="24" :md="8" :lg="8">
            <a-input 
              v-model:value="filters.name" 
              placeholder="Search by intern name..." 
              class="filter-input"
              allow-clear
            />
          </a-col>

          <a-col :xs="24" :sm="16" :md="8" :lg="8">
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
          </a-col>

          <a-col :xs="24" :sm="8" :md="8" :lg="8">
            <a-button type="primary" class="search-button" @click="onSearch">
              Search
            </a-button>
          </a-col>
        </a-row>
      </div>
      
      <a-table 
        class="evaluation-table" 
        :columns="columns" 
        :data-source="dataSource" 
        :pagination="pagination" 
        :loading="loading" 
        row-key="id"
        :scroll="{ x: 'max-content' }"
      >
        <template #averageScore="{ text }">
          <a-tag v-if="String(text) !== '-1'" :color="getScoreColor(text)" class="score-tag">
            {{ text }}
          </a-tag>
          <a-tag v-else color="gray" class="score-tag">N/A</a-tag>
        </template>
        
        <template #status="{ text }">
          <a-tag v-if="text" :color="getStatusColor(text)" class="status-tag">
            {{ text.toUpperCase() }}
          </a-tag>
          <a-tag v-else color="gray" class="status-tag">N/A</a-tag>
        </template>
        
        <template #action="{ record }">
          <a-space>
            <a-button type="primary" ghost class="action-button" @click="viewEvaluation(record)">
              <eye-outlined /> View
            </a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue';
import {EyeOutlined,} from '@ant-design/icons-vue';
import axiosInstance from "@/plugins/axios.js";
import {useRouter} from "vue-router";

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
  },
  {
    title: 'Mentor Name',
    dataIndex: 'mentorName',
    key: 'project',
  },
  {
    title: 'Start date',
    dataIndex: 'startDate',
    key: 'project',
  },
  {
    title: 'End date',
    dataIndex: 'endDate',
    key: 'project',
  },

  {
    title: 'Score',
    dataIndex: 'averageScore',
    key: 'averageScore',
    slots: { customRender: 'averageScore' },
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
  },
  {
    title: 'Actions',
    key: 'action',
    slots: { customRender: 'action' },
  },
];

const loading = ref(false);

const filters = reactive({
  overall: null,
  name: null,
});
const router = useRouter();

const viewEvaluation = (record) => {
  router.push('/evaluation/' + record.internId);
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
.evaluation-container {
  @apply max-w-7xl mx-auto p-4 sm:p-6;
}

.evaluation-card {
  @apply shadow-md rounded-lg overflow-hidden border border-gray-200;
}

.evaluation-card :deep(.ant-card-head) {
  @apply bg-gray-50 border-b border-gray-200 py-4;
}

.evaluation-card :deep(.ant-card-head-title) {
  @apply text-xl font-bold text-gray-800;
}

.filter-section {
  @apply mb-6 p-2 bg-gray-50 rounded-md;
}

.filter-input, .filter-select {
  @apply w-full;
}

.search-button {
  @apply w-full md:w-auto;
}

.evaluation-table {
  @apply mt-4;
}

.evaluation-table :deep(.ant-table-thead > tr > th) {
  @apply bg-gray-100 font-semibold text-gray-700;
}

.evaluation-table :deep(.ant-table-tbody > tr:hover > td) {
  @apply bg-blue-50;
}

.score-tag, .status-tag {
  @apply font-medium px-3 py-1 text-xs rounded-full;
}

.action-button {
  @apply flex items-center;
}

.action-button :deep(.anticon) {
  @apply mr-1;
}
</style>
