<template>
  <div>
    <h2 class="header-title">Recruit and Intern Program Management</h2>

    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      "
    >
      <div style="display: flex; gap: 8px">
        <a-button
          type="primary"
          :ghost="activeTab !== 'recruitments'"
          @click="changeTab('recruitments')"
        >
          Recruitments
        </a-button>
        <a-button
          type="primary"
          :ghost="activeTab !== 'programs'"
          @click="changeTab('programs')"
        >
          Programs
        </a-button>
      </div>

      <div>
        <a-button
          v-if="authStore.userRole === 'DL' && activeTab === 'recruitments'"
          type="primary"
          style="margin-left: 8px"
          @click="showCreateRecruitModal"
        >
          + Create Recruitment Request
        </a-button>

        <a-button
          v-if="authStore.userRole === 'EDU' && activeTab === 'programs'"
          type="primary"
          style="margin-left: 8px"
          @click="showCreateTrainingModal"
        >
          + Create Training Program Request
        </a-button>
      </div>
    </div>

    <div>
      <div v-if="activeTab === 'recruitments'">
        <h3>Recruitments</h3>

        <div class="recruitment-cards-grid">
          <div
            v-for="recruit in recruitments"
            :key="recruit.id"
            class="recruitment-card"
            @click="redirectToRequestDetail(recruit.id)"
          >
            <div class="card-header">
              <h4>Department: {{ recruit.department }}</h4>
              <p><strong>Quarter:</strong> {{ recruit.quarter }}</p>
              <p><strong>Year:</strong> {{ recruit.year }}</p>
              <p>
                <strong>Status: </strong>
                <span :class="getStatusClass(recruit.status)">{{
                  recruit.status
                }}</span>
              </p>
            </div>
          </div>
        </div>

        <a-pagination
          :current="recruitPagination.current"
          :page-size="recruitPagination.pageSize"
          :total="recruitPagination.total"
          @change="handlePageChange"
          @showSizeChange="handlePageSizeChange"
          :show-quick-jumper="recruitPagination.showQuickJumper"
          :show-size-changer="recruitPagination.showSizeChanger"
          :page-size-options="recruitPagination.pageSizeOptions"
          style="margin-top: 16px; text-align: center"
        />
      </div>

      <!-- Programs Pagination -->
      <div v-else-if="activeTab === 'programs'">
        <h3>Programs</h3>
        <a-pagination
          :current="programsPagination.current"
          :page-size="programsPagination.pageSize"
          :total="programsPagination.total"
          @change="handleProgramsPageChange"
        />
      </div>
    </div>

    <!-- Recruitment Request Modal -->
    <a-modal
      v-model:visible="isRecruitModalVisible"
      title="Create Intern Recruitment Request"
      @ok="handleRecruitSubmit"
      @cancel="handleRecruitCancel"
      width="800px"
    >
      <div>
        <a-form :model="recruitmentRequest" ref="recruitFormRef">
          <a-row :gutter="[13, 13]">
            <a-col :span="12">
              <a-form-item label="Quarter" name="quarter" required>
                <a-select
                  v-model:value="recruitmentRequest.quarter"
                  placeholder="Select quarter"
                >
                  <a-select-option value="Q1">Q1</a-select-option>
                  <a-select-option value="Q2">Q2</a-select-option>
                  <a-select-option value="Q3">Q3</a-select-option>
                  <a-select-option value="Q4">Q4</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Year" name="year" required>
                <a-select
                  v-model:value="recruitmentRequest.year"
                  placeholder="Select year"
                >
                  <a-select-option
                    v-for="year in availableYears"
                    :key="year"
                    :value="year"
                  >
                    {{ year }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <div
            v-for="(detail, index) in recruitmentRequest.requestDetails"
            :key="index"
            class="recruitment-detail"
            style="border-bottom: 1px solid #f0f0f0; "
          >
            <h3>Position Request {{ index + 1 }}</h3>
            <div style="display: flex; gap: 24px; align-items: flex-start">
              <!-- Position Field -->
              <a-form-item
                :label="'Position '"
                :name="'position_' + index"
                style="flex: 3"
              >
                <a-input
                  v-model:value="detail.position"
                  placeholder="Enter position"
                />
              </a-form-item>

              <!-- Number of Interns Field -->
              <a-form-item
                :label="'Number of Interns '"
                :name="'numberOfRq_' + index"
                style="flex: 1"
              >
                <a-input-number
                  v-model:value="detail.numberOfRq"
                  :min="1"
                  placeholder="Enter number"
                  style="width: 100%"
                  @change="triggerValidation(index, 'numberOfRq')"
                />
              </a-form-item>
            </div>

            <!-- Required Skills -->
            <a-form-item :label="'Required Skills '" :name="'skills_' + index">
              <a-textarea
                v-model:value="detail.requiredSkill"
                placeholder="Enter skills"
                auto-size
              />
            </a-form-item>

            <!-- Job Description -->
            <a-form-item
              :label="'Job Description '"
              :name="'jobDescription_' + index"
            >
              <a-textarea
                v-model:value="detail.jobDescription"
                placeholder="Enter job description"
                auto-size
              />
            </a-form-item>

            <!-- Remove Button -->
            <a-button
              type="danger"
              @click="removeRecruitDetail(index)"
              v-if="recruitmentRequest.requestDetails.length > 1"
            >
              Remove Position
            </a-button>
          </div>

          <!-- Add Position Button -->
          <a-button type="primary" @click="addRecruitDetail">
            Add Position
          </a-button>
        </a-form>
      </div>
    </a-modal>

    <!-- Training Program Modal -->
    <a-modal
      v-model:visible="isTrainingModalVisible"
      title="Create Training Program Request"
      @ok="handleTrainingSubmit"
      @cancel="handleTrainingCancel"
      width="500px"
    >
      <div>
        <a-form
          layout="vertical"
          ref="trainingFormRef"
          :model="trainingDetails"
        >
          <a-form-item label="Name" name="name" required>
            <a-input
              v-model:value="trainingDetails.name"
              placeholder="Enter name"
            />
          </a-form-item>

          <!-- Quarter and Year -->
          <a-row :gutter="[16, 16]">
            <a-col :span="12">
              <a-form-item label="Quarter" name="quarter" required>
                <a-select
                  v-model:value="trainingDetails.quarter"
                  placeholder="Select quarter"
                >
                  <a-select-option value="Q1">Q1</a-select-option>
                  <a-select-option value="Q2">Q2</a-select-option>
                  <a-select-option value="Q3">Q3</a-select-option>
                  <a-select-option value="Q4">Q4</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="Year" name="year" required>
                <a-select
                  v-model:value="trainingDetails.year"
                  placeholder="Select year"
                >
                  <a-select-option
                    v-for="year in availableYears"
                    :key="year"
                    :value="year"
                  >
                    {{ year }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- Start Date and End Date -->
          <a-row :gutter="[16, 16]">
            <a-col :span="12">
              <a-form-item label="Start Date" name="startDate" required>
                <a-date-picker
                  v-model:value="trainingDetails.startDate"
                  style="width: 100%"
                  placeholder="Select start date"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="End Date" name="endDate" required>
                <a-date-picker
                  v-model:value="trainingDetails.endDate"
                  style="width: 100%"
                  placeholder="Select end date"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="Documents" name="Documents">
            <a-select
              v-model="selectedDocument"
              :options="documentOptions"
            ></a-select>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, reactive } from "vue";
import { useAuthStore } from "@/stores/authStore";
import dayjs from "dayjs";
import { useRouter } from "vue-router";
import { useRecEduStore } from "@/stores/recruitEduStore";
import { useDocumentStore } from "@/stores/documentStore";
import { message, Modal } from "ant-design-vue";

const trainingFormRef = ref(null);
const router = useRouter();
const authStore = useAuthStore();
const RecEduStore = useRecEduStore();
const documentStore = useDocumentStore();
const recruitments = computed(() => RecEduStore.recruitments);
const programs = computed(() => RecEduStore.programs);
const totalRecruits = computed(() => RecEduStore.totalRecruitments);
const programDocs = computed(() => documentStore.programDocs);
const { listProgramDoc } = documentStore;

const {
  listRecruit,
  listProgram,
  addProgram,
  addRecruit,
  setCurrentRecruitment,
} = RecEduStore;
const activeTab = ref("recruitments");

const changeTab = (tab) => {
  activeTab.value = tab;

  if (activeTab.value === "recruitments") {
    listRecruit(1, 3);
  } else {
    listProgram();
    listProgramDoc();
  }
};

const recruitPagination = reactive({
  current: 1,
  total: totalRecruits,
  pageSize: 3,
  pageSizeOptions: ["3", "6", "9"],
  showSizeChanger: true,
  showQuickJumper: true,
});

const handlePageChange = (page) => {
  recruitPagination.current = page;
  listRecruit(page, recruitPagination.pageSize); // Call API with the updated page and size
};

// Handle page size change
const handlePageSizeChange = (current, size) => {
  recruitPagination.pageSize = size; // Update page size
  recruitPagination.current = 1; // Reset to the first page
  listRecruit(1, size); // Fetch first page with updated size
};

const programsPagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

// Recruitment modal states
const isRecruitModalVisible = ref(false);
const recruitFormRef = ref(null);

const recruitmentRequest = reactive({
  quarter: null,
  year: null,
  requestDetails: [
    {
      position: null,
      numberOfRq: null,
      requiredSkill: null,
      jobDescription: null,
    },
  ],
});

// Add a new recruitment detail entry
const addRecruitDetail = () => {
  recruitmentRequest.requestDetails.push({
    position: null,
    numberOfRq: null,
    requiredSkill: null,
    jobDescription: null,
  });
};

// Remove a recruitment detail entry by index
const removeRecruitDetail = (index) => {
  recruitmentRequest.requestDetails.splice(index, 1);
};

const getStatusClass = (status) => {
  return (
    {
      APPROVED: "status-approved",
      PENDING: "status-pending",
      REJECTED: "status-rejected",
    }[status] || "status-unknown"
  );
};

// Training modal states
const isTrainingModalVisible = ref(false);

const trainingDetails = reactive({
  name: "",
  quarter: "",
  year: "",
  startDate: null,
  endDate: null,
  documentIds: [],
});

// Options for document selection
const documentOptions = computed(() => {
  return programDocs.value.map((doc) => ({
    value: doc.id, // Use `id` as the value
    label: doc.title, // Use `title` as the label
  }));
});

const currentYear = dayjs().year();
const availableYears = ref([currentYear, currentYear + 1]);

const showCreateRecruitModal = () => {
  isRecruitModalVisible.value = true;
};

const handleRecruitCancel = () => {
  // Reset the form fields using the reference

  // Close the modal
  isRecruitModalVisible.value = false;
};

const handleRecruitSubmit = async () => {
  console.log(recruitmentRequest);
  const isValid = await recruitFormRef.value?.validate();

  if (!isValid) {
    // If validation fails, Ant Design automatically shows error messages for each invalid field
    return; // No need to proceed with API call
  }

  try {
    await addRecruit(recruitmentRequest);
    listRecruit(1, recruitPagination.pageSize);
    message.success("Recruitment created successfully!");
    recruitFormRef.value?.resetFields();
    isRecruitModalVisible.value = false;
  } catch (error) {
    // Display error message from the backend response
    const errorMessage = error.message || "An unexpected error occurred!";
    showErrorModal(errorMessage);
  }
};

// Lalala
// Training modal methods
const showCreateTrainingModal = () => {
  isTrainingModalVisible.value = true;
};
const handleTrainingCancel = () => {
  trainingFormRef.value?.resetFields();
  trainingDetails.startDate = null;
  trainingDetails.endDate = null;
  trainingDetails.documentIds = [];
  isTrainingModalVisible.value = false;
};

const handleTrainingSubmit = async () => {
  const isValid = await trainingFormRef.value?.validate();

  if (!isValid) {
    // If validation fails, Ant Design automatically shows error messages for each invalid field
    return; // No need to proceed with API call
  }

  try {
    await addProgram(trainingDetails);
    message.success("Program created successfully!");
    trainingFormRef.value?.resetFields();
    trainingDetails.startDate = null;
    trainingDetails.endDate = null;
    trainingDetails.documentIds = [];
    isTrainingModalVisible.value = false;
  } catch (error) {
    // Display error message from the backend response
    const errorMessage = error.message || "An unexpected error occurred!";
    showErrorModal(errorMessage);
  }
};

const redirectToRequestDetail = (id) => {
  setCurrentRecruitment(id);
  router.push({ name: "RecruitmentDetail", params: { id: id } });
};

const showErrorModal = (errorMessage) => {
  Modal.error({
    title: "Error",
    content: errorMessage,
  });
};

onMounted(() => {
  if (activeTab.value === "recruitments") {
    listRecruit(1, 3);
  } else {
    listProgram();
    listProgramDoc();
  }
});
</script>

<style scoped>
.header-title {
  margin-left: 10px;
}

.recruitment-detail {
  background-color: #fafafa;
  border-radius: 8px;
}

.recruitment-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.recruitment-card {
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 12px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  cursor: pointer;
}

.recruitment-card:hover {
  box-shadow: 0 4px 13px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

.card-header {
  margin-bottom: 8px;
}

.status-approved {
  color: green;
}

.status-pending {
  color: orange;
}

.status-rejected {
  color: red;
}
</style>
