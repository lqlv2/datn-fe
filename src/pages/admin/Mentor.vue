<template>
  <div>
    <a-button v-if="authStore.userRole === 'ADMIN'"
              style="
        float: right;
        margin-right: 16px;
        background-color: saddlebrown;
        color: aliceblue;
      "
              @click="showModal">Add Mentor
    </a-button>

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
                style="width: 90%"
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
                style="width: 100%"
                label="Email"
                name="email"
                :rules="[{ required: true, message: 'Please input email' }]"
            >
              <a-input v-model:value="form.email" placeholder="Enter email"/>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Phone and Date of Birth -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
                style="width: 90%"
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
            <a-form-item style="width: 90%" label="position" name="position">
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
                style="width: 90%"
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
                style="width: 100%"
                label="Email"
                name="email"
                :rules="[{ required: true, message: 'Please input email' }]"
            >
              <a-input v-model:value="updateForm.email" placeholder="Enter email"/>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Phone and Date of Birth -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item
                style="width: 90%"
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
            <a-form-item style="width: 90%" label="Position" name="position">
              <a-input
                  v-model:value="updateForm.position"
                  placeholder="Enter position"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <h2 class="header-title">Mentor Management</h2>
    <a-row gutter="16" style="margin-bottom: 16px">
      <a-col span="6">
        <a-input
            v-model:value="filters.name"
            placeholder="Name"
            allowClear
            style="width: 100%"
        />
      </a-col>

      <a-col span="4">
        <a-input
            v-model:value="filters.position"
            placeholder="Position"
            style="width: 100%"
        >
        </a-input>
      </a-col>

      <a-button type="primary" style="margin-left: 8px" @click="applyFilters">Search</a-button>

    </a-row>
    <p></p>
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
    </a-table>
  </div>
  <DeleteModal :on-cancel="cancelDelete" :on-delete="confirmDelete" :is-delete-modal-visible="isDeleteModalVisible"
               message="Are you sure you want to delete this mentor?"/>
</template>

<script setup>
import {computed, h, onMounted, reactive, ref} from "vue";
import {useMentorStore} from "@/stores/mentorStore.js";
import {useAuthStore} from "@/stores/authStore.js";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons-vue";
import {updateMentor} from "@/services/mentorService.js";
import {message} from "ant-design-vue";
import DeleteModal from "@/components/DeleteModal.vue";

const authStore = useAuthStore();
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
const unassignedInterns = computed(() => mentorStore.unassignedInterns);
const currentPage = computed(() => mentorStore.currentPage);
const totalElements = computed(() => mentorStore.totalElements);
const selectedMentor = computed(() => mentorStore.selectedMentor);
const openMentors = computed(() => mentorStore.openMentors);
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

const updateSelectedInterns = (keys) => {
  selectedInterns.value = keys;
};

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

function onPaginationChange(paginationData) {
  innerPagination.value.current = paginationData.current;
}

const switchRecommned = () => {
  selectedInterns.value = [];
  fetchUnassignedInterns(selectedMentor.value.id, recommended.value);
};

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

const handleAssignIntern = () => {
  assign(selectedMentor.value.id, selectedInterns.value);
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

const closeModalAssign = () => {
  selectedInterns.value = [];
  innerPagination.value.current = 1;
  recommended.value = false;
  openAssign.value = false;
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
