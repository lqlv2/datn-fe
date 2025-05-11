<template>
  <div class="mentor-management">
    <div class="page-header">
      <h2 class="header-title">Mentor Management</h2>
      
      <a-button 
        v-if="authStore.userRole === 'ADMIN'"
        type="primary"
        class="add-mentor-button"
        @click="showModal"
      >
        <template #icon>
          <PlusOutlined />
        </template>
        Add Mentor
      </a-button>
    </div>

    <div class="filter-container">
      <a-row :gutter="[24, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8" :lg="8">
          <div class="filter-item">
            <a-input
              v-model:value="filters.name"
              placeholder="Search by name..."
              class="filter-input"
              allowClear
            />
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-input
              v-model:value="filters.position"
              placeholder="Position"
              class="filter-input"
              allowClear
            />
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-button type="primary" class="search-button" @click="applyFilters">
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
        :data-source="mentors"
        :pagination="pagination"
        @change="handlePaginationChange"
        bordered
        row-key="id"
        :scroll="{ x: 1500, y: 500 }"
        :row-class-name="(_record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')"
        class="custom-table"
      >
      </a-table>
    </div>

    <!-- Modals -->
    <a-modal
      v-model:open="open"
      title="Add New Mentor"
      @ok="handleSubmit"
      @cancel="closeModal"
    >
      <template #footer>
        <a-button key="back" @click="closeModal">Cancel</a-button>
        <a-button key="submit" type="primary" @click="handleSubmit">Submit</a-button>
      </template>
      <a-form layout="vertical" ref="addMentorForm" :model="form">
        <!-- Full Name and Email -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
                label="Full Name"
                name="fullname"
                :rules="[{ required: true, message: 'Please input name' }]"
            >
              <a-input
                  v-model:value="form.fullname"
                  placeholder="Enter full name"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
                label="Email"
                name="email"
                :rules="[{ required: true, message: 'Please input email' }]"
            >
              <a-input v-model:value="form.email" placeholder="Enter email"/>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Phone and Position -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
                label="Phone"
                name="phone"
                :rules="[{ required: true, message: 'Please input phone' }]"
            >
              <a-input
                  v-model:value="form.phone"
                  placeholder="Enter phone number"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Position" name="position">
              <a-input
                  v-model:value="form.position"
                  placeholder="Enter position"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="updateOpen"
      title="Update Mentor"
      @ok="handleUpdate"
      @cancel="updateOpen.value = false"
    >
      <template #footer>
        <a-button key="back" @click="updateOpen.value = false">Cancel</a-button>
        <a-button key="submit" type="primary" @click="handleUpdate">Submit</a-button>
      </template>
      <a-form layout="vertical" ref="addMentorForm">
        <!-- Full Name and Email -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
                label="Full Name"
                name="fullname"
            >
              <a-input
                  v-model:value="updateForm.fullname"
                  placeholder="Enter full name"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
                label="Email"
                name="email"
                :rules="[{ required: true, message: 'Please input email' }]"
            >
              <a-input v-model:value="updateForm.email" placeholder="Enter email"/>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Phone and Position -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
                label="Phone"
                name="phone"
                :rules="[{ required: true, message: 'Please input phone' }]"
            >
              <a-input
                  v-model:value="updateForm.phone"
                  placeholder="Enter phone number"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Position" name="position">
              <a-input
                  v-model:value="updateForm.position"
                  placeholder="Enter position"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
    
    <DeleteModal 
      :on-cancel="cancelDelete" 
      :on-delete="confirmDelete" 
      :is-delete-modal-visible="isDeleteModalVisible"
      message="Are you sure you want to delete this mentor?"
    />
  </div>
</template>

<script setup>
import {computed, h, onMounted, reactive, ref} from "vue";
import {useMentorStore} from "@/stores/mentorStore.js";
import {useAuthStore} from "@/stores/authStore.js";
import {DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons-vue";
import {updateMentor} from "@/services/mentorService.js";
import {message} from "ant-design-vue";
import DeleteModal from "@/components/DeleteModal.vue";

const authStore = useAuthStore();
const mentorStore = useMentorStore();
const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    align: 'center'
  },
  {
    title: "Full Name",
    dataIndex: "fullname",
    key: "fullname",
    align: 'center'
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    align: 'center'
  },
  {
    title: "Phone",
    dataIndex: "phone",
    key: "phone",
    align: 'center'
  },
  {
    title: "Position",
    dataIndex: "position",
    key: "position",
    align: 'center'
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

const recordToDelete = ref(null);

const cancelDelete = () => {
  isDeleteModalVisible.value = false;
  recordToDelete.value = null;
};

const confirmDelete = async () => {
  try {
    await mentorStore.delete(recordToDelete.value.id);
    isDeleteModalVisible.value = false;
    recordToDelete.value = null;
  } catch (error) {
    console.error("Error deleting intern:", error);
  }
};


const {
  add,
  list,
  assign,
  fetchUnassignedInterns,
} = mentorStore;

const mentors = computed(() => mentorStore.mentors);
const currentPage = computed(() => mentorStore.currentPage);
const totalElements = computed(() => mentorStore.totalElements);
const selectedMentor = computed(() => mentorStore.selectedMentor);
const addMentorForm = ref(null);
const recommended = ref(false);
const isDeleteModalVisible = ref(false);

const updateOpen = ref(false);

const filters = ref({
  name: null,
  position: null,
});

const open = ref(false);
const openAssign = ref(false);

const selectedInterns = ref([]);

const handleEdit = (record) => {
  Object.assign(updateForm, record);
  updateOpen.value = true;
};

const form = reactive({
  email: null,
  fullname: null,
  phone: null,
  dob: null,
  position: null,
});

const updateForm = reactive({
  id: null,
  email: null,
  fullname: null,
  phone: null,
  dob: null,
  position: null,
});

// Pagination Config
const pagination = reactive({
  current: currentPage,
  pageSize: 10,
  total: totalElements,
});


const innerPagination = ref({
  current: 1,
  pageSize: 5,
});

const handlePaginationChange = (paginationConfig) => {
  pagination.pageSize = paginationConfig.pageSize;
  list(paginationConfig.current, pagination.pageSize);
};

const handleUpdate = () => {
  updateMentor(updateForm.id, updateForm)
      .then(() => {
        updateOpen.value = false;
        list(currentPage.value, pagination.pageSize, filters.value);
        message.success("Update mentor successfully");
      })
      .catch((error) => {
        console.log("Error updating mentor:", error);
      });
};

const handleDelete = (record) => {
  recordToDelete.value = record;
  isDeleteModalVisible.value = true;
};

const applyFilters = async () => {
  await list(currentPage.value, pagination.pageSize, filters.value);
};


const showModal = () => {
  open.value = true;
};

const closeModal = () => {
  addMentorForm.value?.resetFields();
  open.value = false;
};

const handleSubmit = async () => {
  addMentorForm.value
      .validate()
      .then(async () => {
        await add(form);
        open.value = false;
      })
      .catch((error) => {
        console.log("Form invalid:", error);
      });
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

.add-mentor-button {
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

.filter-input {
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
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .add-mentor-button {
    width: 100%;
  }
}
</style>
