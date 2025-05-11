<template>
  <div class="intern-management">
    <div class="page-header">
      <h2 class="header-title">Intern Management</h2>
      
      <a-button 
        type="primary"
        class="add-intern-button"
        @click="showModal"
      >
        <template #icon>
          <PlusOutlined />
        </template>
        Add Intern
      </a-button>
    </div>

    <div class="filter-container">
      <a-row :gutter="[24, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-input v-model:value="filters.name" placeholder="Search by name..." ></a-input>
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
          v-if="columns.length > 0 && interns.length > 0"
          :columns="columns"
          :data-source="interns"
          :pagination="pagination"
          @change="handlePaginationChange"
          :row-key="record => record.id"
          :expand-column-width="55"
          :scroll="{ x: 1500, y: 500 }"
          :loading="tableLoading"
          :row-class-name="(_record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')"
          class="custom-table"
          bordered
      >
      </a-table>
    </div>

    <a-modal v-model:open="open" title="Add New Intern" @ok="handleSubmit" @cancel="closeModal">
      <template #footer>
        <a-button key="back" @click="closeModal">Cancel</a-button>
        <a-button key="submit" type="primary" @click="handleSubmit">Submit</a-button>
      </template>
      <a-form layout="vertical" ref="addInternForm" :model="form">
        <!-- Full Name and Email -->
        <a-row :gutter="[16, 16]">
          <a-col :span="12">
            <a-form-item label="Full Name" name="fullname"
                         :rules="[{ required: true, message: 'Please input name' }]">
              <a-input v-model:value="form.fullname" placeholder="Enter full name"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Email" name="email"
                         :rules="[{ required: true, message: 'Please input email' }]">
              <a-input v-model:value="form.email" placeholder="Enter email"/>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Phone and Date of Birth -->
        <a-row :gutter="[16, 16]">
          <a-col :span="12">
            <a-form-item label="Phone" name="phone"
                         :rules="[{ required: true, message: 'Please input phone' }]">
              <a-input v-model:value="form.phone" placeholder="Enter phone number"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Date of Birth" name="dob">
              <a-date-picker v-model:value="form.dob" style="width: 100%" placeholder="Select date of birth"/>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Start Date and End Date -->
        <a-row :gutter="[16, 16]">
          <a-col :span="12">
            <a-form-item label="Start Date" name="startDate">
              <a-date-picker v-model:value="form.startDate" style="width: 100%" placeholder="Select start date"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="End Date" name="endDate">
              <a-date-picker v-model:value="form.endDate" style="width: 100%" placeholder="Select end date"/>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[16, 16]">
          <a-col :span="12">
            <a-form-item label="Position" name="position">
              <a-select v-model:value="form.position" placeholder="Select position">
                <a-select-option v-for="[key, value] in Object.entries(positions)" :key="key" :value="key">
                  {{ value }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Mentor" name="mentor">
              <a-select v-model:value="form.mentorId" placeholder="Select position">
                <a-select-option v-for="pos in mentors" :key="pos.id" :value="pos.id">
                  {{ pos.fullname }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal title="Update Intern" v-model:open="isOpenUpdate" @cancel="isOpenUpdate = false">
      <template #footer>
        <a-button key="back" @click="isOpenUpdate = false">Cancel</a-button>
        <a-button key="submit" type="primary" @click="handleUpdateSubmit">Update</a-button>
      </template>
      <a-form layout="vertical" ref="updateInternForm" :model="updateform">
        <!-- Full Name and Email -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Full Name" name="fullname"
                         :rules="[{ required: true, message: 'Please input name' }]">
              <a-input v-model:value="updateform.fullname" placeholder="Enter full name"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Email" name="email"
                         :rules="[{ required: true, message: 'Please input email' }]">
              <a-input v-model:value="updateform.email" placeholder="Enter email"/>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Phone and Date of Birth -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Phone" name="phone"
                         :rules="[{ required: true, message: 'Please input phone' }]">
              <a-input v-model:value="updateform.phone" placeholder="Enter phone number"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Date of Birth" name="dob">
              <a-date-picker v-model:value="updateform.dob" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
                             style="width: 100%" placeholder="Select date of birth"/>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Start Date and End Date -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Start Date" name="startDate">
              <a-date-picker v-model:value="updateform.startDate" style="width: 100%" placeholder="Select start date"
                             format="YYYY-MM-DD"
                             value-format="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="End Date" name="endDate">
              <a-date-picker v-model:value="updateform.endDate" style="width: 100%" placeholder="Select end date"
                             format="YYYY-MM-DD"
                             value-format="YYYY-MM-DD"/>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Position and Image -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Position" name="position">
              <a-select v-model:value="updateform.position" placeholder="Select position">
                <a-select-option v-for="[key, value] in Object.entries(positions)" :key="key" :value="key">
                  {{ value }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Mentor" name="mentor">
              <a-select v-model:value="updateform.mentorId" placeholder="Select mentor">
                <a-select-option v-for="mentor in mentors" :key="mentor.id" :value="mentor.id">
                  {{ mentor.fullname }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

    </a-modal>

    <DeleteModal :on-cancel="cancelDelete" :on-delete="confirmDelete" :is-delete-modal-visible="isDeleteModalVisible"
                 message="Are you sure you want to delete this intern?"/>
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted, h} from "vue";
import {useInternStore} from "@/stores/internStore.js";
import {EditOutlined, DeleteOutlined, PlusOutlined} from "@ant-design/icons-vue";
import {useMentorStore} from "@/stores/mentorStore.js";
import DeleteModal from "@/components/DeleteModal.vue";
import {message, Tag} from "ant-design-vue";

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    align: "center",
  },
  {
    title: "Full Name",
    dataIndex: "fullname",
    key: "fullname",
    ellipsis: true,
    align: "center",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    ellipsis: true,
    align: "center",
  },
  {
    title: "Start Date",
    dataIndex: "startDate",
    key: "startDate",
    align: "center",
  },
  {
    title: "End Date",
    dataIndex: "endDate",
    key: "endDate",
    align: "center",
  },
  {
    title: 'Mentor',
    dataIndex: 'mentorId',
    key: 'mentorId',
    align: "center",
    customRender: ({text}) => {
      if (!text || mentors.value.filter(mentor => mentor.id === text).length === 0) {
        return h(Tag, { color: 'gray' }, 'Unassigned');
      }
      return h(Tag, { color: 'blue' }, mentors.value.find(mentor => mentor.id === text)?.fullname || 'Unassigned');
    }
  },
  {
    title: "Action",
    key: "action",
    align: "center",
    customRender: ({record}) => {
      return h(
          "span",
          {class: "action-buttons"},
          [
            h(EditOutlined, {
              class: "edit-icon",
              onClick: () => handleEdit(record)
            }),
            h(DeleteOutlined, {
              class: "delete-icon",
              onClick: () => handleDelete(record)
            })
          ]
      );
    }
  }
]
const internStore = useInternStore();
const mentorStore = useMentorStore();
const addInternForm = ref(null);
const updateInternForm = ref(null);

const {add, filterStoreInterns, exportInternsToExcel} = internStore;

const interns = computed(() => internStore.interns);
const mentors = computed(() => mentorStore.mentors);
const currentPage = computed(() => internStore.currentPage);
const totalElements = computed(() => internStore.totalElements);
const positions = {
  BACKEND_DEVELOPER: "Backend Developer",
  FRONTEND_DEVELOPER: "ReactJS Developer",
  DEVOPS_ENGINEER: "DevOps",
  BUSINESS_ANALYST: "Business Analyst",
}

const open = ref(false);

const form = reactive({
  email: null,
  fullname: null,
  phone: null,
  dob: null,
  startDate: null,
  endDate: null,
  position: null,
  image: "",
  mentorId: null,
});

const updateform = reactive({
  id: null,
  email: null,
  fullname: null,
  phone: null,
  dob: null,
  startDate: null,
  endDate: null,
  position: null,
  image: "",
  mentorId: null,
});

const isOpenUpdate = ref(false);

const filters = reactive({
  name: null,
  startDate: null,
  endDate: null,
});

// Pagination Config
const pagination = reactive({
  current: currentPage,
  pageSize: 10,
  total: totalElements,
});


const applyFilters = () => {
  internStore.filters = {...filters};
  filterStoreInterns(1, pagination.pageSize, internStore.filters);
};

const exportFile = () => {
  internStore.filters = {...filters};
  exportInternsToExcel(internStore.filters);
};

const resetFilters = () => {
  filters.position = null;
  filters.status = null;
  filters.startDate = null;
  filters.endDate = null;
  filters.name = null;
  internStore.filters = {...filters};
  filterStoreInterns(1, pagination.pageSize, internStore.filters);
};

const handlePaginationChange = (paginationConfig) => {
  pagination.pageSize = paginationConfig.pageSize;
  filterStoreInterns(
      paginationConfig.current,
      pagination.pageSize,
      internStore.filters
  );
};

const showModal = () => {
  open.value = true;
};

const closeModal = () => {
  addInternForm.value?.resetFields();
  form.image = null;
  open.value = false;
};

const handleSubmit = async () => {
  addInternForm.value
      .validate()
      .then(async () => {
        await add(form);
        open.value = false;
        message.success("Added new intern successfully");
      })
      .catch((error) => {
        console.log("Form invalid:", error);
      });
};

const handleUpdateSubmit = async () => {
  updateInternForm.value
      .validate()
      .then(async () => {
        await internStore.update(updateform.id, updateform);
        isOpenUpdate.value = false;
        message.success("Updated intern successfully");
      })
      .catch((error) => {
        console.log("Form invalid:", error);
      });
};

onMounted(async () => {
  tableLoading.value = true;
  try {
    await mentorStore.list(1, 10000);
    await filterStoreInterns();
  } finally {
    tableLoading.value = false;
  }
});
const handleEdit = (record) => {
  // Implement your edit logic here
  Object.assign(updateform, record);
  isOpenUpdate.value = true;
  console.log("Edit intern:", record);
};


const isDeleteModalVisible = ref(false);
const recordToDelete = ref(null);
const handleDelete = (record) => {
  recordToDelete.value = record;
  isDeleteModalVisible.value = true;
};

const confirmDelete = async () => {
  try {
    await internStore.delete(recordToDelete.value.id);
    isDeleteModalVisible.value = false;
    recordToDelete.value = null;
    message.success("Deleted intern successfully");
  } catch (error) {
    console.error("Error deleting intern:", error);
  }
};

const cancelDelete = () => {
  isDeleteModalVisible.value = false;
  recordToDelete.value = null;
};

const tableLoading = ref(false);

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

.add-intern-button {
  background-color: #1890ff;
  color: white;
  border-radius: 6px;
  font-weight: 500;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Action icon styles with :deep() */
.custom-table :deep(.edit-icon) {
  color: #1890ff;
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.custom-table :deep(.edit-icon:hover) {
  background-color: rgba(24, 144, 255, 0.1);
}

.custom-table :deep(.delete-icon) {
  color: #ff4d4f;
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.custom-table :deep(.delete-icon:hover) {
  background-color: rgba(255, 77, 79, 0.1);
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
  
  .add-intern-button {
    width: 100%;
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

