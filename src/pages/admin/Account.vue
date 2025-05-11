<template>
  <div class="account-management">
    <div class="page-header">
      <h2 class="header-title">Account Management</h2>
      <a-button
          type="primary"
          class="add-account-button"
          @click="showAddAccountModal"
      >
        <template #icon>
          <PlusOutlined/>
        </template>
        Add Account
      </a-button>
    </div>

    <div class="filter-container">
      <a-row :gutter="[24, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8" :lg="8">
          <div class="filter-item">
            <a-input
                v-model:value="filter.name"
                placeholder="Search by name"
                class="filter-input"
                allow-clear
            >
              <template #prefix>
                <SearchOutlined/>
              </template>
            </a-input>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" :md="4" :lg="6">
          <div class="filter-item">
            <a-button type="primary" class="search-button" @click="applyFilters">
              <template #icon>
                <search-outlined/>
              </template>
              Search
            </a-button>
          </div>
        </a-col>
      </a-row>
    </div>

    <div class="table-container">
      <a-table
          :data-source="accounts"
          :pagination="pagination"
          @change="handlePaginationChange"
          bordered
          row-key="id"
          :scroll="{ x: 1500, y: 500 }"
          :row-class-name="(_record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')"
          class="custom-table"
      >
        <a-table-column
            title="ID"
            data-index="id"
            align="center"
        />

        <!-- Name Column -->
        <a-table-column
            title="Name"
            data-index="fullname"
            align="center"
            :sorter="(a, b) => a.fullname.localeCompare(b.fullname)"
        />

        <!-- Email Column -->
        <a-table-column
            title="Email"
            data-index="email"
            align="center"
            :sorter="(a, b) => a.email.localeCompare(b.email)"
        />

        <!-- Phone Column -->
        <a-table-column
            title="Phone"
            data-index="phone"
            align="center"
        />

        <!-- Role Column -->
        <a-table-column
            title="Role"
            data-index="role"
            align="center"
            :sorter="(a, b) => a.role - b.role"
        >
          <template #default="{ text }">
            <a-tag :color="getRoleColor(text)">
              {{ ROLES[text] || text }}
            </a-tag>
          </template>
        </a-table-column>

        <!-- Actions Column -->
        <a-table-column title="Actions" align="center">
          <template #default="{ record }">
            <div class="action-buttons" >
              <EditOutlined class="edit-icon" @click="showUpdateAccountModal(record)"/>
              <DeleteOutlined class="delete-icon" @click="showDeleteAccountModal(record)"/>
            </div>
          </template>
        </a-table-column>
      </a-table>
    </div>

    <a-modal
        v-model:open="addAccountModalOpen"
        title="Add New Account"
        @ok="submitAccount"
        @cancel="closeAddAccountModal"
        class="account-modal"
        width="600px"
    >
      <template #footer>
        <a-button key="back" @click="closeAddAccountModal">Cancel</a-button>
        <a-button key="submit" type="primary" @click="submitAccount">
          Submit
        </a-button>
      </template>

      <a-form layout="vertical" ref="addAccountForm" :model="AccountForm">
        <a-form-item
            label="Full Name"
            name="fullname"
            :rules="[{ required: true, message: 'Please input full name' }]"
        >
          <a-input
              v-model:value="AccountForm.fullname"
              placeholder="Enter full name"
          />
        </a-form-item>
        <a-row :gutter="[16, 16]">
          <a-col :span="12">
            <a-form-item
                label="Phone"
                name="phone"
                :rules="[{ required: true, message: 'Please input phone number' }]"
            >
              <a-input
                  v-model:value="AccountForm.phone"
                  placeholder="Enter phone number"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
                label="Email"
                name="email"
                :rules="[
            { required: true, message: 'Please input email' },
            { type: 'email', message: 'The input is not valid E-mail' },
          ]"
            >
              <a-input
                  v-model:value="AccountForm.email"
                  placeholder="Enter email"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="[16, 16]">
          <a-col :span="12">

            <a-form-item label="Date of Birth" name="dob">
              <a-date-picker
                  v-model:value="AccountForm.dob"
                  placeholder="Select date of birth"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
                label="Role"
                name="role"
                :rules="[{ required: true, message: 'Please select a role' }]"
            >
              <a-select
                  v-model:value="AccountForm.role"
                  placeholder="Select role"
                  disabled
              >
                <a-select-option value="2">Intern</a-select-option>
                <a-select-option value="3">Mentor</a-select-option>
                <a-select-option value="1">Admin</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

      </a-form>
    </a-modal>

    <a-modal
        v-model:open="updateAccountModalOpen"
        title="Update Account"
        @ok="updateAccount"
        @cancel="closeUpdateAccountModal"
        class="account-modal"
        width="600px"
    >
      <template #footer>
        <a-button key="back" @click="closeUpdateAccountModal">Cancel</a-button>
        <a-button key="submit" type="primary" @click="updateAccount">
          Update
        </a-button>
      </template>

      <a-form layout="vertical" ref="updateAccountForm" :model="UpdateForm">
        <a-row :gutter="[16, 16]">
          <a-col :span="24">
            <a-form-item
                label="Full Name"
                name="fullname"
                :rules="[{ required: true, message: 'Please input full name' }]"
            >
              <a-input
                  v-model:value="UpdateForm.fullname"
                  placeholder="Enter full name"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="[16, 16]">
          <a-col :span="12">
            <a-form-item
                label="Email"
                name="email"
                :rules="[
                { required: true, message: 'Please input email' },
                { type: 'email', message: 'The input is not valid E-mail' },
              ]"
            >
              <a-input v-model:value="UpdateForm.email" placeholder="Enter email"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
                label="Phone"
                name="phone"
                :rules="[{ required: true, message: 'Please input phone number' }]"
            >
              <a-input
                  v-model:value="UpdateForm.phone"
                  placeholder="Enter phone number"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="[16, 16]">
          <a-col :span="12">
            <a-form-item label="Date of Birth" name="dob">
              <a-date-picker
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  v-model:value="UpdateForm.dob"
                  placeholder="Select date of birth"
                  style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
                label="Role"
                name="role"
            >
              <a-select v-model:value="UpdateForm.role" placeholder="Select role" :default-value="UpdateForm.role"
                        disabled>
                <a-select-option value="2">Intern</a-select-option>
                <a-select-option value="3">Mentor</a-select-option>
                <a-select-option value="1">Admin</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <DeleteModal :on-cancel="handleCancel" :on-delete="handleDelete" :is-delete-modal-visible="isDeleteModalVisible"
                 message="Are you sure you want to permanently delete this account?"/>
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted} from "vue";
import {useAccountStore} from "@/stores/accountStore.js";
import {message, Modal} from "ant-design-vue";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';
import DeleteModal from "@/components/DeleteModal.vue";

const accountStore = useAccountStore();

const {list, add, update, deleteAcc, setSelectedAccount} = accountStore;

const accounts = computed(() => accountStore.accounts);
const currentPage = computed(() => accountStore.currentPage);
const totalElements = computed(() => accountStore.totalElements);
const selectedAccount = computed(() => accountStore.selectedAccount);
const addAccountForm = ref(null);
const addAccountModalOpen = ref(false);
const updateAccountForm = ref(null);
const updateAccountModalOpen = ref(false);
const isDeleteModalVisible = ref(false); // Controls modal visibility

const ROLES = {
  '1': 'Admin',
  '2': 'Intern',
  '3': 'Mentor'
};

const filter = reactive({
  name: ''
});

const applyFilters = () => {
  accountStore.filters = {...filter};
  list(1, pagination.pageSize, accountStore.filters);
};

const pagination = reactive({
  current: currentPage,
  pageSize: 10,
  total: totalElements,
});

const AccountForm = reactive({
  id: null,
  name: null,
  email: null,
  phone: null,
  role: "1",
  dob: null,
});

const UpdateForm = reactive({
  id: null,
  name: null,
  email: null,
  phone: null,
  role: null,
  dob: null,
});

const handlePaginationChange = (paginationConfig) => {
  pagination.pageSize = paginationConfig.pageSize;
  list(paginationConfig.current, pagination.pageSize, accountStore.filters);
};

const showAddAccountModal = () => {
  addAccountModalOpen.value = true;
};

const closeAddAccountModal = () => {
  addAccountForm.value?.resetFields();
  addAccountModalOpen.value = false;
};

const showUpdateAccountModal = (account) => {
  Object.assign(UpdateForm, account);
  updateAccountModalOpen.value = true;
};

const closeUpdateAccountModal = () => {
  updateAccountForm.value?.resetFields();
  updateAccountModalOpen.value = false;
};

const submitAccount = async () => {
  const isValid = await addAccountForm.value?.validate();
  if (!isValid) {
    return;
  }
  try {
    await add(AccountForm);
    addAccountForm.value?.resetFields();
    addAccountModalOpen.value = false;
    message.success("Account added successfully!");
  } catch (error) {
    const errorMessage = error.message || "An unexpected error occurred!";
    showErrorModal(errorMessage);
  }
};

const updateAccount = async () => {
  const isValid = await updateAccountForm.value?.validate();
  if (!isValid) {
    return;
  }
  try {
    await update(UpdateForm.id, UpdateForm);
    message.success("Account updated successfully!");
    updateAccountForm.value?.resetFields();
    updateAccountModalOpen.value = false;
  } catch (error) {
    const errorMessage = error.message || "An unexpected error occurred!";
    showErrorModal(errorMessage);
  }
};

const showErrorModal = (errorMessage) => {
  Modal.error({
    title: "Error",
    content: errorMessage,
  });
};

const showDeleteAccountModal = (account) => {
  setSelectedAccount(account);
  isDeleteModalVisible.value = true;
};

const handleDelete = () => {
  console.log(selectedAccount)
  deleteAcc(selectedAccount.value.id);
  message.success("Account deleted successfully!");
  console.log("Account deleted.");
  isDeleteModalVisible.value = false;
};

const handleCancel = () => {
  isDeleteModalVisible.value = false;
};

const getRoleColor = (role) => {
  switch (role) {
    case '1':
      return 'blue'; // Admin
    case '2':
      return 'green'; // Intern
    case '3':
      return 'purple'; // Mentor
    default:
      return 'gray';
  }
};

onMounted(async () => {
  await list();
});
</script>

<style scoped>
.account-management {
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

.add-account-button {
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

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.edit-icon {
  color: #1890ff;
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-icon:hover {
  background-color: rgba(24, 144, 255, 0.1);
}

.delete-icon {
  color: #ff4d4f;
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-icon:hover {
  background-color: rgba(255, 77, 79, 0.1);
}

.account-modal :deep(.ant-modal-content) {
  border-radius: 8px;
}

.account-modal :deep(.ant-modal-header) {
  border-radius: 8px 8px 0 0;
  background-color: #f8fafc;
  padding: 16px 24px;
  border-bottom: 1px solid #eaeaea;
}

.account-modal :deep(.ant-modal-body) {
  padding: 20px;
}

.account-modal :deep(.ant-modal-footer) {
  border-top: 1px solid #eaeaea;
  padding: 16px 24px;
}

.delete-modal :deep(.ant-modal-content) {
  border-radius: 8px;
}

.delete-confirmation {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.warning-icon {
  font-size: 24px;
  color: #ff4d4f;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .account-management {
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

  .add-account-button {
    width: 100%;
  }
}
</style>

