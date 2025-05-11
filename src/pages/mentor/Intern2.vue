<template>
  <div class="intern-management">
    <div class="page-header">
      <h2 class="header-title">Intern List</h2>
    </div>

    <div class="filter-container">
      <a-row :gutter="[24, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-input 
              v-model:value="filters.name" 
              placeholder="Search by name..." 
              class="filter-input"
              allow-clear
            ></a-input>
          </div>
        </a-col>

        <!-- Start Date Filter -->
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-date-picker
                v-model:value="filters.startDate"
                placeholder="Start Date"
                class="filter-input"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
            />
          </div>
        </a-col>

        <!-- End Date Filter -->
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-date-picker
                v-model:value="filters.endDate"
                placeholder="End Date"
                class="filter-input"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
            />
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item filter-buttons">
            <a-button type="primary" class="search-button" @click="applyFilters">
              Search
            </a-button>
            <a-button class="reset-button" @click="resetFilters">
              Reset
            </a-button>
            <a-tooltip title="Application will export by selecting filters, not the current list">
              <a-button type="primary" class="export-button" @click="exportFile">
                Export
              </a-button>
            </a-tooltip>
          </div>
        </a-col>
      </a-row>
    </div>

    <div class="table-container">
      <a-table
          :columns="columns"
          :data-source="interns"
          :pagination="pagination"
          @change="handlePaginationChange"
          bordered
          row-key="id"
          :expand-column-width="55"
          :scroll="{ x: 1500, y: 500 }"
          :row-class-name="(_record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')"
          class="custom-table"
      >
      </a-table>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, reactive} from "vue";
import {useInternStore} from "@/stores/internStore";

const internStore = useInternStore();

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    align: 'center',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    align: 'center',
  },
  {
    title: 'Full name',
    dataIndex: 'fullname',
    key: 'fullname',
    align: 'center',
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
    align: 'center',
  },
  {
    title: 'Date of Birth',
    dataIndex: 'dob',
    key: 'dob',
    align: 'center',
  },
  {
    title: 'Start Date',
    dataIndex: 'startDate',
    key: 'startDate',
    align: 'center',
  },
  {
    title: 'End Date',
    dataIndex: 'endDate',
    key: 'endDate',
    align: 'center',
  },
  {
    title: 'Position',
    dataIndex: 'position',
    key: 'position',
    align: 'center',
  }
];

const {filterStoreInterns, exportInternsToExcel} = internStore;

const interns = computed(() => internStore.interns);
const currentPage = computed(() => internStore.currentPage);
const totalElements = computed(() => internStore.totalElements);


const filters = reactive({
  name: null,
  status: null,
  startDate: null,
  endDate: null,
});
const pagination = reactive({
  current: currentPage,
  pageSize: 10,
  total: totalElements,
});


const applyFilters = () => {
  internStore.filters = {
    ...filters,
    startDate: filters.startDate ? filters.startDate.format("YYYY-MM-DD") : null,
    endDate: filters.endDate ? filters.endDate.format("YYYY-MM-DD") : null
  };
  filterStoreInterns(1, pagination.pageSize, internStore.filters, true);
};

const exportFile = () => {
  internStore.filters = {...filters};
  exportInternsToExcel(internStore.filters);
};

const resetFilters = () => {
  Object.keys(filters).forEach((key) => {
    filters[key] = null;
  });
  internStore.filters = filters;
  filterStoreInterns(1, pagination.pageSize, internStore.filters, true);
};

const handlePaginationChange = (paginationConfig) => {
  pagination.pageSize = paginationConfig.pageSize;
  filterStoreInterns(
      paginationConfig.current,
      pagination.pageSize,
      internStore.filters,
      true
  );
};

onMounted(async () => {
  await filterStoreInterns(
      pagination.current,
      pagination.pageSize,
      internStore.filters,
      true);
});
</script>

<style scoped>
.intern-management {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.filter-select,
.filter-input {
  width: 100%;
  border-radius: 6px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.search-button,
.reset-button,
.export-button {
  border-radius: 6px;
  height: 40px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}
.export-button {
  background-color: #52c41a;
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

/* Status tag styles */
.custom-table :deep(.ant-tag) {
  border-radius: 12px;
  padding: 0 10px;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .intern-management {
    padding: 12px;
  }
  
  .filter-container,
  .table-container {
    padding: 16px;
  }
  
  .header-title {
    font-size: 1.25rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .filter-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .search-button,
  .reset-button,
  .export-button {
    width: 100%;
  }
}
</style>
