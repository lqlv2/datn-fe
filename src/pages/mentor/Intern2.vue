<template>
  <div>
    <h2 class="header-title">Intern Management</h2>

    <a-row gutter="16" style="margin-bottom: 16px">

      <a-col span="4">
        <a-select
            v-model:value="filters.status"
            placeholder="Status"
            allowClear
            style="width: 100%"
            :dropdownStyle="{ maxHeight: '130px', overflowY: 'auto' }"
        >
          <a-select-option value="ONBOARD">Onboard</a-select-option>
          <a-select-option value="FINISH_ONBOARD">Onboard Finished</a-select-option>
          <a-select-option value="OJT">OJT</a-select-option>
          <a-select-option value="FINISH_OJT">OJT Finished</a-select-option>
          <a-select-option value="TERMINATED">Terminated</a-select-option>
          <a-select-option value="COMPLETED">Completed</a-select-option>
        </a-select>
      </a-col>
      <a-col span="4">
        <a-input v-model:value="filters.name" placeholder="Name" style="width: 100%"/>
      </a-col>
      <!-- Start Date Filter -->
      <a-col span="4">
        <a-date-picker
            v-model:value="filters.startDate"
            placeholder="Start Date"
            format="YYYY-MM-DD"
            style="width: 100%"
        />
      </a-col>

      <!-- End Date Filter -->
      <a-col span="4">
        <a-date-picker
            v-model:value="filters.endDate"
            placeholder="End Date"
            style="width: 100%"
        />
      </a-col>

      <!-- Apply Filters Button -->
      <a-button type="primary" style="margin-left: 8px" @click="applyFilters"
      >Search
      </a-button
      >
      <a-button style="margin-left: 8px" @click="resetFilters">Reset</a-button>
    </a-row>

    <a-tooltip
        title="Application will export by selecting filters, not the current list"
    >
      <a-button
          style="float: right; background-color: green; color: aliceblue; margin-bottom: 16px"
          @click="exportFile"
      >
        Export
      </a-button>
    </a-tooltip>

    <p></p>
    <a-table
        v-if="columns.length > 0 && interns.length > 0"
        :columns="columns"
        :data-source="interns"
        :pagination="pagination"
        @change="handlePaginationChange"
        bordered
        row-key="id"
        :expand-column-width="55"
        :scroll="{ x: 1500, y: 500 }"
    >

    </a-table>
  </div>
</template>

<script setup>
import {computed, h, onMounted, reactive, ref, watch} from "vue";
import {useInternStore} from "@/stores/internStore";

const internStore = useInternStore();

const columns = [
  {
    title: 'Id',
    dataIndex: 'accountId',
    key: 'accountId',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Fullname',
    dataIndex: 'fullname',
    key: 'fullname',
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Date of Birth',
    dataIndex: 'dob',
    key: 'dob',
  },
  {
    title: 'Start Date',
    dataIndex: 'startDate',
    key: 'startDate',
  },
  {
    title: 'End Date',
    dataIndex: 'endDate',
    key: 'endDate',
  },
  {
    title: 'Position',
    dataIndex: 'position',
    key: 'position',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status'
  }
];

const {add, uploadImage, filterStoreInterns, exportInternsToExcel} = internStore;

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

// Generate Columns Dynamically from Response Data

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
.header-title {
  margin-left: 5px;
}
</style>
