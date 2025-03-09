<template>
  <div>
    <h2 class="header-title">Account Management</h2>

    <a-button
      style="
        float: right;
        margin-right: 16px;
        background-color: seagreen;
        color: white;
      "
      @click="showAddAccountModal"
      >Add Account</a-button
    >

    <a-row gutter="16" style="margin-bottom: 16px">
      <a-col span="3">
        <a-select
          v-model:value="proFilter.role"
          placeholder="Role"
          allowClear
          style="width: 100%"
          :dropdownStyle="{ maxHeight: '130px', overflowY: 'auto' }"
        >
          <a-select-option value="ADMIN">ADMIN</a-select-option>
          <a-select-option value="COO">COO</a-select-option>
          <a-select-option value="DL">DL</a-select-option>
          <a-select-option value="EDU">EDU</a-select-option>
          <a-select-option value="MENTOR">Mentor</a-select-option>
          <a-select-option value="INTERN">Intern</a-select-option>
        </a-select>
      </a-col>
      <!-- Position Filter -->

      <a-col span="4">
        <a-select
          v-model:value="proFilter.status"
          placeholder="Status"
          allowClear
          style="width: 100%"
        >
          <a-select-option value="ACTIVE">Active</a-select-option>
          <a-select-option value="INACTIVE">Inactive</a-select-option>
        </a-select>
      </a-col>

      <a-col span="4">
        <a-select
          v-model:value="proFilter.department"
          placeholder="Department"
          allowClear
          style="width: 100%"
          :dropdownStyle="{ maxHeight: '130px', overflowY: 'auto' }"
        >
          <a-select-option value="DU12">DU12</a-select-option>
          <a-select-option value="DU10">DU10</a-select-option>
          <a-select-option value="DU32">DU32</a-select-option>
          <a-select-option value="Edu">EDU</a-select-option>
          <a-select-option value="Rec">REC</a-select-option>
          <a-select-option value="C-Level">C-Level</a-select-option>
          <a-select-option value="IT Support">IT Support</a-select-option>
        </a-select>
      </a-col>

      <a-button type="primary" style="margin-left: 8px" @click="applyFilters"
        >Search</a-button
      >

      <a-button style="margin-left: 8px" @click="resetFilters">Reset</a-button>
    </a-row>

    <a-modal
      v-model:open="addAccountModalOpen"
      title="Add New Account"
      @ok="submitAccount"
      @cancel="closeAddAccountModal"
    >
      <template #footer>
        <a-button key="back" @click="closeAddAccountModal">Cancel</a-button>
        <a-button key="submit" type="primary" @click="submitAccount"
          >Submit</a-button
        >
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

        <a-form-item label="Date of Birth" name="dob">
          <a-date-picker
            v-model:value="AccountForm.dob"
            placeholder="Select date of birth"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="Department" name="department">
          <a-select
            v-model:value="AccountForm.department"
            placeholder="Select department"
          >
            <a-select-option value="DU12">DU12</a-select-option>
            <a-select-option value="DU10">DU10</a-select-option>
            <a-select-option value="DU32">DU32</a-select-option>
            <a-select-option value="Edu">EDU</a-select-option>
            <a-select-option value="Rec">REC</a-select-option>
            <a-select-option value="C-Level">C-Level</a-select-option>
            <a-select-option value="IT Support">IT Support</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          label="Role"
          name="roleId"
          :rules="[{ required: true, message: 'Please select a role' }]"
        >
          <a-select
            v-model:value="AccountForm.roleId"
            placeholder="Select role"
          >
            <a-select-option value="1">EDU</a-select-option>
            <a-select-option value="2">COO</a-select-option>
            <a-select-option value="3">REC</a-select-option>
            <a-select-option value="4">INTERN</a-select-option>
            <a-select-option value="5">MENTOR</a-select-option>
            <a-select-option value="6">DL</a-select-option>
            <a-select-option value="7">ADMIN</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="updateAccountModalOpen"
      title="Update Account"
      @ok="updateAccount"
      @cancel="closeUpdateAccountModal"
    >
      <template #footer>
        <a-button key="back" @click="closeUpdateAccountModal">Cancel</a-button>
        <a-button key="submit" type="primary" @click="updateAccount"
          >Update</a-button
        >
      </template>

      <a-form layout="vertical" ref="updateAccountForm" :model="UpdateForm">
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

        <a-form-item
          label="Email"
          name="email"
          :rules="[
            { required: true, message: 'Please input email' },
            { type: 'email', message: 'The input is not valid E-mail' },
          ]"
        >
          <a-input v-model:value="UpdateForm.email" placeholder="Enter email" />
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
            v-model:value="UpdateForm.dob"
            placeholder="Select date of birth"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="Department" name="department">
          <a-select
            v-model:value="UpdateForm.department"
            placeholder="Select department"
          >
            <a-select-option value="DU12">DU12</a-select-option>
            <a-select-option value="DU10">DU10</a-select-option>
            <a-select-option value="DU32">DU32</a-select-option>
            <a-select-option value="Edu">EDU</a-select-option>
            <a-select-option value="Rec">REC</a-select-option>
            <a-select-option value="C-Level">C-Level</a-select-option>
            <a-select-option value="IT Support">IT Support</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          label="Role"
          name="roleId"
          :rules="[{ required: true, message: 'Please select a role' }]"
        >
          <a-select v-model:value="UpdateForm.roleId" placeholder="Select role">
            <a-select-option :value="1">EDU</a-select-option>
            <a-select-option :value="2">COO</a-select-option>
            <a-select-option :value="3">REC</a-select-option>
            <a-select-option :value="4">INTERN</a-select-option>
            <a-select-option :value="5">MENTOR</a-select-option>
            <a-select-option :value="6">DL</a-select-option>
            <a-select-option :value="7">ADMIN</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Status" name="status">
          <a-select
            v-model:value="UpdateForm.status"
            placeholder="Select status"
          >
            <a-select-option value="ACTIVE">Active</a-select-option>
            <a-select-option value="INACTIVE">Inactive</a-select-option>
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
    >
      <a-table-column
        title="#"
        :dataIndex="'id'"
        :width="50"
        fixed="left"
        align="center"
      />

      <!-- Name Column -->
      <a-table-column
        title="Name"
        :dataIndex="'fullname'"
        :width="130"
        align="center"
      />

      <!-- Description Column -->
      <a-table-column
        title="Email"
        :dataIndex="'email'"
        :width="150"
        align="center"
      />

      <!-- Description Column -->
      <a-table-column
        title="Phone"
        :dataIndex="'phone'"
        :width="100"
        align="center"
      />

      <a-table-column
        title="Role"
        :dataIndex="'role'"
        :width="70"
        align="center"
      />

      <a-table-column
        title="Department"
        :dataIndex="'department'"
        :width="70"
        align="center"
      />

      <!-- Status Column -->
      <a-table-column
        title="Status"
        :dataIndex="'status'"
        :width="130"
        align="center"
      />

      <a-table-column title="Actions" align="center" :width="100" fixed="right">
        <template v-slot="record">
          <a-button
            @click="showUpdateAccountModal(record)"
            type="text"
            style="
              padding: 2px;
              min-width: auto;
              height: auto;
              margin-left: 7px;
            "
          >
            <img
              src="@/assets/edit.png"
              alt="Edit"
              style="width: 15px; height: 15px"
            />
          </a-button>
          <a-button
            @click="showDeleteAccountModal(record)"
            type="text"
            style="
              padding: 2px;
              min-width: auto;
              height: auto;
              margin-left: 7px;
            "
          >
            <img
              src="@/assets/delete.png"
              alt="Delete"
              style="width: 15px; height: 15px"
          /></a-button>
        </template>
      </a-table-column>
    </a-table>

    <a-modal
      v-model:visible="isDeleteModalVisible"
      title="Delete Account"
      @ok="handleDelete"
      @cancel="handleCancel"
      :ok-button-props="{ type: 'primary' }"
    >
      <p>
        Are you sure you want to permanently delete your account? This action
        cannot be undone.
      </p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useAccountStore } from "@/stores/accountStore";
import { message, Modal } from "ant-design-vue";

const accountStore = useAccountStore();

const { list, add, update, deleteAcc, setSelectedAccount } = accountStore;

const accounts = computed(() => accountStore.accounts);
const currentPage = computed(() => accountStore.currentPage);
const totalElements = computed(() => accountStore.totalElements);
const selectedAccount = computed(() => accountStore.selectedAccount);
const addAccountForm = ref(null);
const addAccountModalOpen = ref(false);
const updateAccountForm = ref(null);
const updateAccountModalOpen = ref(false);
const isDeleteModalVisible = ref(false); // Controls modal visibility
const isCheckboxChecked = ref(false); // Tracks if the checkbox is checked

const proFilter = reactive({
  role: null,
  department: null,
  status: null,
});

const applyFilters = () => {
  accountStore.filters = { ...proFilter };
  console.log(proFilter);
  console.log("Applied Filters:", accountStore.filters);
  list(1, pagination.pageSize, accountStore.filters);
};

const resetFilters = () => {
  proFilter.role = null;
  proFilter.department = null;
  proFilter.status = null;
  accountStore.filters = { ...proFilter };
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
  name: null,
  email: null,
  phone: null,
  roleId: null,
  department: null,
});

const UpdateForm = reactive({
  name: null,
  email: null,
  phone: null,
  roleId: null,
  department: null,
  status: null,
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
  setSelectedAccount(account.value);
  Object.assign(UpdateForm, account.value);
  updateAccountModalOpen.value = true;
};

const closeUpdateAccountModal = () => {
  updateAccountForm.value?.resetFields();
  updateAccountModalOpen.value = false;
};

const submitAccount = async () => {
  // Trigger frontend validation first
  const isValid = await addAccountForm.value?.validate();
  if (!isValid) {
    // If validation fails, Ant Design automatically shows error messages for each invalid field
    return; // No need to proceed with API call
  }

  try {
    // If validation passes, proceed with the backend API call
    await add(AccountForm); // Replace with your API call

    // Reset form and close modal after successful submission
    addAccountForm.value?.resetFields();
    addAccountModalOpen.value = false;
  } catch (error) {
    // Handle backend errors (if any)
    const errorMessage = error.message || "An unexpected error occurred!";
    showErrorModal(errorMessage);
  }
};

const updateAccount = async () => {
  const isValid = await updateAccountForm.value?.validate();

  if (!isValid) {
    // If validation fails, Ant Design automatically shows error messages for each invalid field
    return; // No need to proceed with API call
  }

  try {
    console.log(selectedAccount);
    await update(selectedAccount.value.id, UpdateForm);
    message.success("Account updated successfully!");
    updateAccountForm.value?.resetFields();
    updateAccountModalOpen.value = false;
  } catch (error) {
    // Display error message from the backend response
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

onMounted(async () => {
  await list();
});
</script>

<style scoped>
.header-title {
  margin-left: 5px;
}
</style>
