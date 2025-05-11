<template>
  <div class="mentor-management">
    <div class="page-header">
      <h2 class="header-title">Mentor Management</h2>
    </div>
    
    <div class="filter-container">
      <a-row gutter="24" align="middle">
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-input
                v-model:value="filters.name"
                placeholder="Search by name"
                allowClear
                class="filter-input"
            >
              <template #prefix>
                <search-outlined />
              </template>
            </a-input>
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-input
                v-model:value="filters.position"
                placeholder="Search by position"
                allowClear
                class="filter-input"
            >
              <template #prefix>
                <team-outlined />
              </template>
            </a-input>
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-button 
              type="primary" 
              class="search-button"
              @click="applyFilters"
            >
              <template #icon><search-outlined /></template>
              Search
            </a-button>
          </div>
        </a-col>
      </a-row>
    </div>
    
    <div class="table-container">
      <a-table
          v-if="columns.length > 0 && mentors.length > 0"
          :columns="columns"
          :data-source="mentors"
          :pagination="pagination"
          @change="handlePaginationChange"
          bordered
          row-key="id"
          :scroll="{ x: 1500, y: 500 }"
          :row-class-name="(_record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')"
          class="custom-table"
      >
        <template #action="{ record }">
          <a-tag v-if="record.internAccountIds && record.internAccountIds.includes(getCurrentUsername())" class="mentor-tag">
            Your mentor
          </a-tag>
        </template>
      </a-table>
      
      <div v-else-if="mentors.length === 0" class="empty-state">
        <a-empty description="No data found" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useMentorStore} from "@/stores/mentorStore";
import {getCurrentUsername} from "@/util/Functions.js";
import { SearchOutlined, TeamOutlined } from '@ant-design/icons-vue';

const mentorStore = useMentorStore();
const columns = [
  {
    title: "Mentor ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Full Name",
    dataIndex: "fullname",
    key: "fullname",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Phone",
    dataIndex: "phone",
    key: "phone",
  },
  {
    title: "Position",
    dataIndex: "position",
    key: "position",
  },
  {
    title: "",
    key: "action",
    align: "center",
    slots: {customRender: 'action'},
  }
]
const {
  list,
} = mentorStore;

const mentors = computed(() => mentorStore.mentors);
const currentPage = computed(() => mentorStore.currentPage);
const totalElements = computed(() => mentorStore.totalElements);


const filters = ref({
  name: null,
  position: null,
});

// Pagination Config
const pagination = reactive({
  current: currentPage,
  pageSize: 10,
  total: totalElements,
});

const handlePaginationChange = (paginationConfig) => {
  pagination.pageSize = paginationConfig.pageSize;
  list(paginationConfig.current, pagination.pageSize);
};
const applyFilters = async () => {
  await list(currentPage.value, pagination.pageSize, filters.value);
};

onMounted(async () => {
  await list();
  // generateColumns(mentorStore.mentors);
});
</script>

<style scoped>
.mentor-management {
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

.mentor-tag {
  background-color: #e6f7ff;
  color: #1890ff;
  border-color: #91caff;
  border-radius: 12px;
  padding: 2px 12px;
  font-weight: 500;
}

.empty-state {
  padding: 48px 0;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .mentor-management {
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
