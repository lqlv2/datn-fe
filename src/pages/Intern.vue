<template>
  <div>
    <h2 class="header-title">Intern Management</h2>

    <a-row gutter="16" style="margin-bottom: 16px">
      <!-- Position Filter -->
      <a-col span="6">
        <a-select
            v-model:value="filters.position"
            placeholder="Position"
            allowClear
            style="width: 100%"
        >
          <a-select-option value="BACKEND_DEVELOPER">Backend Developer</a-select-option>
          <a-select-option value="FRONTEND_DEVELOPER">ReactJS Developer</a-select-option>
          <a-select-option value="DEVOPS_ENGINEER">DevOps</a-select-option>
          <a-select-option value="BUSINESS_ANALYST">Business Analyst</a-select-option>
        </a-select>
      </a-col>

      <!-- Status Filter -->
      <a-col span="6">
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

      <!-- Start Date Filter -->
      <a-col span="6">
        <a-date-picker
            v-model:value="filters.startDate"
            placeholder="Start Date"
            style="width: 100%"
        />
      </a-col>

      <!-- End Date Filter -->
      <a-col span="6">
        <a-date-picker
            v-model:value="filters.endDate"
            placeholder="End Date"
            style="width: 100%"
        />
      </a-col>
    </a-row>

    <!-- Apply Filters Button -->
    <a-button type="primary" style="margin-left: 8px" @click="applyFilters"
    >Search
    </a-button
    >
    <a-button style="margin-left: 8px" @click="resetFilters">Reset</a-button>
    <a-button
        style="
        float: right;
        margin-right: 8px;
        background-color: saddlebrown;
        color: aliceblue;
      "
        @click="showModal"
    >Add Intern
    </a-button
    >

    <a-modal
        v-model:open="open"
        title="Add New Intern"
        @ok="handleSubmit"
        @cancel="closeModal"
    >
      <template #footer>
        <a-button key="back" @click="closeModal">Cancel</a-button>
        <a-button key="submit" type="primary" @click="handleSubmit"
        >Submit
        </a-button
        >
      </template>
      <a-form layout="vertical" ref="addInternForm" :model="form">
        <!-- Full Name and Email -->
        <a-row gutter="{16}">
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
                style="width: 90%"
                label="Email"
                name="email"
                :rules="[{ required: true, message: 'Please input email' }]"
            >
              <a-input v-model:value="form.email" placeholder="Enter email"/>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Phone and Date of Birth -->
        <a-row gutter="{16}">
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
            <a-form-item label="Date of Birth" name="dob">
              <a-date-picker
                  v-model:value="form.dob"
                  style="width: 100%"
                  placeholder="Select date of birth"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Start Date and End Date -->
        <a-row gutter="{16}">
          <a-col :span="12">
            <a-form-item style="width: 90%" label="Start Date" name="startDate">
              <a-date-picker
                  v-model:value="form.startDate"
                  style="width: 100%"
                  placeholder="Select start date"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="End Date" name="endDate">
              <a-date-picker
                  v-model:value="form.endDate"
                  style="width: 100%"
                  placeholder="Select end date"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Position and Image -->
        <a-row gutter="{16}">
          <a-col :span="12">
            <a-form-item style="width: 90%" label="Position" name="position">
              <a-select
                  v-model:value="form.position"
                  placeholder="Select position"
              >
                <a-select-option
                    v-for="[key, value] in Object.entries(positions)"
                    :key="key"
                    :value="key"
                >
                  {{ value }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item style="width: 90%" label="Mentor" name="mentor">
              <a-select
                  v-model:value="form.position"
                  placeholder="Select position"
              >
                <a-select-option
                    v-for="pos in positions"
                    :key="pos"
                    :value="pos"
                >
                  {{ pos }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Image" name="image">
              <a-upload
                  name="file"
                  list-type="picture-card"
                  :maxCount="1"
                  :onPreview="handlePreview"
                  :customRequest="handleUpload"
              >
                <div>
                  <plus-outlined/>
                  <div style="margin-top: 8px">Upload</div>
                </div>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <a-tooltip
        title="Application will export by selecting filters, not the current list"
    >
      <a-button
          style="float: right; background-color: green; color: aliceblue"
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
      <template #expandedRowRender="{ record }">
        <p style="margin: 0">
          {{ record.description }}
        </p>
      </template>

      <template #expandColumnTitle>
        <span style="color: red">Action</span>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted, h} from "vue";
import {useInternStore} from "@/stores/internStore";
import userImage from "@/assets/user.png";

const internStore = useInternStore();
const columns = ref([]);
const addInternForm = ref(null);
const selectedFile = ref(null);

const {add, uploadImage, filterStoreInterns, exportInternsToExcel} =
    internStore;

const interns = computed(() => internStore.interns);
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

// Generate Columns Dynamically from Response Data
const generateColumns = (data) => {
  if (!data || data.length === 0) return;

  const statusStyles = {
    ONBOARD: {backgroundColor: "rgba(30, 144, 255, 0.2)", color: "#1E90FF"},
    OJT: {backgroundColor: "rgba(50, 205, 50, 0.2)", color: "#32CD32"},
    FINISH_ONBOARD: {
      backgroundColor: "rgba(255, 165, 0, 0.2)",
      color: "#FFA500",
    }, // Light orange
    TERMINATED: {backgroundColor: "rgba(255, 69, 0, 0.2)", color: "#FF4500"},
    COMPLETED: {backgroundColor: "rgba(128, 0, 128, 0.2)", color: "#800080"},
  };

  columns.value = Object.keys(data[0]).map((key) => ({
    title: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
    dataIndex: key,
    fixed:
        key === "id"
            ? "left"
            : key === "position"
                ? "right"
                : key === "status"
                    ? "right"
                    : undefined,
    width: key === "id" ? 40 : key === "status" || key === "position" ? 89 : 88,
    customRender:
        key === "image"
            ? ({text}) =>
                h("img", {
                  src: text || userImage,
                  alt: "User",
                  style: "max-width: 90%; height: 80px;",
                })
            : key === "status"
                ? ({text}) =>
                    h(
                        "span",
                        {
                          style: {
                            ...statusStyles[text],
                            padding: "4px 8px",
                            borderRadius: "4px",
                            display: "inline-block",
                            textAlign: "center",
                          },
                        },
                        text
                    )
                : undefined,
  }));
};

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

onMounted(async () => {
  await filterStoreInterns();
  generateColumns(internStore.interns);
});
</script>

<style scoped>
.header-title {
  margin-left: 5px;
}
</style>
