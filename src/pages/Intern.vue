<template>
  <div>
    <h2 class="header-title">Intern Management</h2>

    <a-row :gutter="16" style="margin-bottom: 16px">
      <!-- Position Filter -->
      <a-col span="6">
        <a-select v-model:value="filters.position" placeholder="Position" allowClear style="width: 100%">
          <a-select-option value="BACKEND_DEVELOPER">Backend Developer</a-select-option>
          <a-select-option value="FRONTEND_DEVELOPER">ReactJS Developer</a-select-option>
          <a-select-option value="DEVOPS_ENGINEER">DevOps</a-select-option>
          <a-select-option value="BUSINESS_ANALYST">Business Analyst</a-select-option>
        </a-select>
      </a-col>

      <!-- Status Filter -->
      <a-col span="6">
        <a-select v-model:value="filters.status" placeholder="Status" allowClear style="width: 100%"
                  :dropdownStyle="{ maxHeight: '130px', overflowY: 'auto' }">
          <a-select-option value="ONBOARD">Onboard</a-select-option>
          <a-select-option value="FINISH_ONBOARD">Onboard Finished</a-select-option>
          <a-select-option value="OJT">OJT</a-select-option>
          <a-select-option value="FINISH_OJT">OJT Finished</a-select-option>
          <a-select-option value="TERMINATED">Terminated</a-select-option>
          <a-select-option value="COMPLETED">Completed</a-select-option>
        </a-select>
      </a-col>

      <!-- Start Date Filter -->
      <a-col span="6">
        <a-date-picker v-model:value="filters.startDate" placeholder="Start Date" style="width: 100%"/>
      </a-col>

      <!-- End Date Filter -->
      <a-col span="6">
        <a-date-picker v-model:value="filters.endDate" placeholder="End Date" style="width: 100%"/>
      </a-col>
    </a-row>

    <!-- Apply Filters Button -->
    <a-button type="primary" style="margin-left: 8px" @click="applyFilters">Search
    </a-button>
    <a-button style="margin-left: 8px" @click="resetFilters">Reset</a-button>
    <a-button style="
        float: right;
        margin-right: 8px;
        background-color: saddlebrown;
        color: aliceblue;
      " @click="showModal">Add Intern
    </a-button>

    <a-modal v-model:open="open" title="Add New Intern" @ok="handleSubmit" @cancel="closeModal">
      <template #footer>
        <a-button key="back" @click="closeModal">Cancel</a-button>
        <a-button key="submit" type="primary" @click="handleSubmit">Submit</a-button>
      </template>
      <a-form layout="vertical" ref="addInternForm" :model="form">
        <!-- Full Name and Email -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item style="width: 90%" label="Full Name" name="fullname"
                         :rules="[{ required: true, message: 'Please input name' }]">
              <a-input v-model:value="form.fullname" placeholder="Enter full name"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item style="width: 90%" label="Email" name="email"
                         :rules="[{ required: true, message: 'Please input email' }]">
              <a-input v-model:value="form.email" placeholder="Enter email"/>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Phone and Date of Birth -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item style="width: 90%" label="Phone" name="phone"
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
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item style="width: 90%" label="Start Date" name="startDate">
              <a-date-picker v-model:value="form.startDate" style="width: 100%" placeholder="Select start date"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="End Date" name="endDate">
              <a-date-picker v-model:value="form.endDate" style="width: 100%" placeholder="Select end date"/>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item style="width: 90%" label="Position" name="position">
              <a-select v-model:value="form.position" placeholder="Select position">
                <a-select-option v-for="[key, value] in Object.entries(positions)" :key="key" :value="key">
                  {{ value }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
            <a-col :span="12">
            <a-form-item style="width: 90%" label="Mentor" name="mentor">
              <a-select v-model:value="form.position" placeholder="Select position">
                <a-select-option v-for="pos in positions" :key="pos" :value="pos">
                  {{ pos }}
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
          <a-col :span="24">
            <a-form-item style="width: 90%" label="Full Name" name="fullname"
                         :rules="[{ required: true, message: 'Please input name' }]">
              <a-input v-model:value="updateform.fullname" placeholder="Enter full name"/>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Phone and Date of Birth -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item style="width: 90%" label="Email" name="email"
                         :rules="[{ required: true, message: 'Please input email' }]">
              <a-input v-model:value="updateform.email" placeholder="Enter email"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item style="width: 90%" label="Phone" name="phone"
                         :rules="[{ required: true, message: 'Please input phone' }]">
              <a-input v-model:value="updateform.phone" placeholder="Enter phone number"/>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Start Date and End Date -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item style="width: 90%" label="Start Date" name="startDate">
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
            <a-form-item style="width: 90%" label="Position" name="position">
              <a-select v-model:value="updateform.position" placeholder="Select position">
                <a-select-option v-for="[key, value] in Object.entries(positions)" :key="key" :value="key">
                  {{ value }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item style="width: 90%" label="Mentor" name="mentor">
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

    <a-tooltip title="Application will export by selecting filters, not the current list">
      <a-button style="float: right; background-color: green; color: aliceblue" @click="exportFile">
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
        :row-key="record => record.id"
        :expand-column-width="55"
        :scroll="{ x: 1500, y: 500 }"
        :loading="tableLoading"
        :row-class-name="(_record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')"
        class="custom-table"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ formatStatus(record.status) }}
          </a-tag>
        </template>
      </template>
    </a-table>
    <DeleteModal :on-cancel="cancelDelete" :on-delete="confirmDelete" :is-delete-modal-visible="isDeleteModalVisible" message="Are you sure you want to delete this intern?"/>
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted, h} from "vue";
import {useInternStore} from "@/stores/internStore";
import {PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined} from "@ant-design/icons-vue";
import {useMentorStore} from "@/stores/mentorStore.js";
import DeleteModal from "@/components/DeleteModal.vue";
import {message} from "ant-design-vue";

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 80,
    fixed: "left",
    align: "center",
  },
  {
    title: "Full Name",
    dataIndex: "fullname",
    key: "fullname",
    ellipsis: true,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    ellipsis: true,
  },
  {
    title: "Phone",
    dataIndex: "phone",
    key: "phone",
    align: "center",
  },
  {
    title: "Start Date",
    dataIndex: "startDate",
    key: "startDate",
    align: "center",
  },
  {
    title: "Action",
    key: "action",
    width: 100,
    align: "center",
    fixed: "right",
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
// const columns = ref([]);
const addInternForm = ref(null);
const updateInternForm = ref(null);
const selectedFile = ref(null);

const {add, uploadImage, filterStoreInterns, exportInternsToExcel} = internStore;

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
  position: null,
  status: null,
  startDate: null,
  endDate: null,
});

// Pagination Config
const pagination = reactive({
  current: currentPage,
  pageSize: 10,
  total: totalElements,
  pageSizeOptions: ["10", "20", "30"],
  showSizeChanger: true,
  showQuickJumper: true,
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

const handlePreview = (file) => {
  if (file.originFileObj) {
    // Generate and open a preview URL for the local file
    const objectUrl = URL.createObjectURL(file.originFileObj);
    window.open(objectUrl);
    // Clean up the generated URL after use
    URL.revokeObjectURL(objectUrl);
  } else {
    console.error("Preview not available. Ensure the file is a local upload.");
  }
};

const handleUpload = ({file, onSuccess}) => {
  // Simulate success after file is selected (no upload)
  setTimeout(() => {
    selectedFile.value = file;
    console.log("File ready for preview:", file);
    onSuccess("ok");
  }, 800);
};

const handleSubmit = async () => {
  addInternForm.value
      .validate()
      .then(async () => {
        console.log(form.image);
        await add(form);
        if (selectedFile.value != null) {
          await uploadImage(form.phone, selectedFile.value);
        }
        open.value = false;
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
      })
      .catch((error) => {
        console.log("Form invalid:", error);
      });
};

onMounted(async () => {
  tableLoading.value = true;
  try {
    await filterStoreInterns();
    await mentorStore.list(1, 10000);
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

const getStatusColor = (status) => {
  const statusColors = {
    'ONBOARD': 'blue',
    'FINISH_ONBOARD': 'cyan',
    'OJT': 'green',
    'FINISH_OJT': 'lime',
    'TERMINATED': 'red',
    'COMPLETED': 'purple'
  };
  return statusColors[status] || 'default';
};

const formatStatus = (status) => {
  return status?.replace(/_/g, ' ').split(' ')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
};
</script>

<style scoped>
.header-title {
  margin-left: 5px;
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.custom-table :deep(.ant-table) {
  border-radius: 8px;
}

.custom-table :deep(.ant-table-thead > tr > th) {
  background-color: #f0f5ff;
  font-weight: 600;
  padding: 12px 16px;
}

.table-row-light {
  background-color: #ffffff;
}

.table-row-dark {
  background-color: #fafafa;
}

.custom-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #e6f7ff !important;
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
</style>

