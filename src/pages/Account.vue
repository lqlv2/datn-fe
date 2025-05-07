<template>
  <div class="account-container">
    <div class="header-section">
      <h2 class="header-title">Account Management</h2>
      <a-button class="add-button" @click="showAddAccountModal">
        <template #icon>
          <PlusOutlined/>
        </template>
        Add Account
      </a-button>
    </div>

    <a-card class="filter-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input
              v-model:value="filter.name"
              placeholder="Search by name"
              class="search-input"
              allow-clear
          >
            <template #prefix>
              <SearchOutlined/>
            </template>
          </a-input>
        </a-col>
        <a-col :xs="24" :sm="12" :md="4">
          <a-button type="primary" class="search-button" @click="applyFilters">
            Search
          </a-button>
        </a-col>
      </a-row>
    </a-card>

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
        <a-form-item
            label="Full Name"
            name="fullname"
            :rules="[{ required: true, message: 'Please input full name' }]"
        >
          <a-input
              v-model:value="UpdateForm.name"
              placeholder="Enter full name"
          />
        </a-form-item>

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

        <a-form-item label="Date of Birth" name="dob">
          <a-date-picker
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              v-model:value="UpdateForm.dob"
              placeholder="Select date of birth"
              style="width: 100%"
          />
        </a-form-item>

        <a-form-item
            label="Role"
            name="role"
        >
          <a-select v-model:value="UpdateForm.role" placeholder="Select role" :default-value="UpdateForm.role" disabled>
            <a-select-option value="2">Intern</a-select-option>
            <a-select-option value="3">Mentor</a-select-option>
            <a-select-option value="1">Admin</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Account Table ===============================-->

    <a-table
        :data-source="accounts"
        :pagination="pagination"
        @change="handlePaginationChange"
        bordered
        row-key="id"
        :scroll="{ x: 1500, y: 500 }"
        class="accounts-table"
    >
      <a-table-column
          title="#"
          data-index="id"
          :width="50"
          fixed="left"
          align="center"
      />

      <!-- Name Column -->
      <a-table-column
          title="Name"
          data-index="fullname"
          :width="130"
          align="center"
          :sorter="(a, b) => a.fullname.localeCompare(b.fullname)"
      />

      <!-- Email Column -->
      <a-table-column
          title="Email"
          data-index="email"
          :width="150"
          align="center"
          :sorter="(a, b) => a.email.localeCompare(b.email)"
      />

      <!-- Phone Column -->
      <a-table-column
          title="Phone"
          data-index="phone"
          :width="100"
          align="center"
      />

      <!-- Role Column -->
      <a-table-column
          title="Role"
          data-index="role"
          :width="70"
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
      <a-table-column title="Actions" align="center" :width="100" fixed="right">
        <template #default="{ record }">
          <a-tooltip title="Edit">
            <a-button
                class="action-button"
                @click="showUpdateAccountModal(record)"
                type="text"
            >
              <EditOutlined/>
            </a-button>
          </a-tooltip>
          <a-tooltip title="Delete">
            <a-button
                class="action-button"
                @click="showDeleteAccountModal(record)"
                type="text"
            >
              <DeleteOutlined/>
            </a-button>
          </a-tooltip>
        </template>
      </a-table-column>
    </a-table>

    <a-modal
        v-model:visible="isDeleteModalVisible"
        title="Delete Account"
        @ok="handleDelete"
        @cancel="handleCancel"
        :ok-button-props="{ type: 'danger' }"
        class="delete-modal"
    >
      <div class="delete-confirmation">
        <ExclamationCircleOutlined class="warning-icon"/>
        <p>
          Are you sure you want to permanently delete this account? This action cannot be undone.
        </p>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted} from "vue";
import {useAccountStore} from "@/stores/accountStore";
import {message, Modal} from "ant-design-vue";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue';

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
  pageSizeOptions: ["10", "20", "30"],
  showSizeChanger: true,
  showQuickJumper: true,
});

const AccountForm = reactive({
  id: null,
  name: null,
  email: null,
  phone: null,
  role: null,
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
  console.log(account.value);
  Object.assign(UpdateForm, account.value);
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
  setSelectedAccount(account.value);
  isDeleteModalVisible.value = true;
};

const handleDelete = () => {
  deleteAcc(selectedAccount.value.id);
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
.account-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 8px;
}

.header-title {
  margin: 0;
  color: #101828;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.add-button {
  background: linear-gradient(90deg, #2e7d32 0%, #4caf50 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.add-button:hover {
  background: linear-gradient(90deg, #388e3c, #66bb6a);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.add-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.filter-card {
  margin-bottom: 24px;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e8ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-input {
  border-radius: 8px;
  border: 1px solid #d0d5dd;
  transition: all 0.2s ease;
}

.search-input:hover {
  border-color: #4caf50;
}

.search-input:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.search-button {
  background: #1976d2;
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.search-button:hover {
  background: #1565c0;
}

.search-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
}

.accounts-table {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8ecef;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

:deep(.ant-table) {
  border-radius: 12px;
  font-size: 14px;
}

:deep(.ant-table-thead > tr > th) {
  background: #f8fafc;
  color: #344054;
  font-weight: 600;
  padding: 12px 16px;
  border-bottom: 1px solid #e8ecef;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f5;
  color: #1f2a44;
  transition: background-color 0.2s ease;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: #f9fafb;
}

.action-button {
  padding: 4px;
  min-width: 32px;
  height: 32px;
  margin: 0 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: #f5f7fa;
  color: #1976d2;
}

.account-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
}

.account-modal :deep(.ant-modal-header) {
  border-radius: 12px 12px 0 0;
  background: #f8fafc;
  padding: 20px 24px;
  border-bottom: 1px solid #e8ecef;
}

.account-modal :deep(.ant-modal-title) {
  font-size: 20px;
  font-weight: 600;
  color: #101828;
}

.account-modal :deep(.ant-modal-body) {
  padding: 24px;
  background: #ffffff;
}

.account-modal :deep(.ant-modal-footer) {
  border-radius: 0 0 12px 12px;
  padding: 16px 24px;
  border-top: 1px solid #e8ecef;
  background: #ffffff;
}

.delete-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
}

.delete-confirmation {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
}

.warning-icon {
  font-size: 28px;
  color: #d32f2f;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #344054;
}

:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-picker) {
  border-radius: 8px;
  border: 1px solid #d0d5dd;
  transition: all 0.2s ease;
}

:deep(.ant-input:hover),
:deep(.ant-select-selector:hover),
:deep(.ant-picker:hover) {
  border-color: #4caf50;
}

:deep(.ant-input:focus),
:deep(.ant-select-selector:focus),
:deep(.ant-picker:focus) {
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

:deep(.ant-pagination) {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

:deep(.ant-pagination-item) {
  border-radius: 6px;
  border: 1px solid #d0d5dd;
  margin: 0 4px;
  transition: all 0.2s ease;
}

:deep(.ant-pagination-item:hover) {
  border-color: #4caf50;
  background: #f9fafb;
}

:deep(.ant-pagination-item-active) {
  border-color: #4caf50;
  background: #4caf50;
}

:deep(.ant-pagination-item-active a) {
  color: #ffffff;
}

:deep(.ant-pagination-prev),
:deep(.ant-pagination-next) {
  border-radius: 6px;
  border: 1px solid #d0d5dd;
}

:deep(.ant-pagination-prev:hover),
:deep(.ant-pagination-next:hover) {
  border-color: #4caf50;
  background: #f9fafb;
}

:deep(.ant-btn) {
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
}

:deep(.ant-btn-primary) {
  background: #1976d2;
  border: none;
}

:deep(.ant-btn-primary:hover) {
  background: #1565c0;
}

:deep(.ant-btn-danger) {
  background: #d32f2f;
  border: none;
}

:deep(.ant-btn-danger:hover) {
  background: #b71c1c;
}

@media (max-width: 768px) {
  .account-container {
    padding: 16px;
  }

  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-title {
    font-size: 24px;
  }

  .add-button {
    align-self: flex-end;
    width: 100%;
    max-width: 200px;
  }

  .filter-card {
    padding: 12px;
  }

  .search-button {
    width: 100%;
  }

  :deep(.ant-table) {
    font-size: 13px;
  }

  :deep(.ant-table-thead > tr > th),
  :deep(.ant-table-tbody > tr > td) {
    padding: 10px 12px;
  }

  .account-modal :deep(.ant-modal-body) {
    padding: 16px;
  }
}

@media (max-width: 576px) {
  .header-title {
    font-size: 20px;
  }

  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }

  .delete-confirmation {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .warning-icon {
    margin-bottom: 8px;
  }
}
</style>