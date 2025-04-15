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
        <a-button key="submit" type="primary" @click="handleSubmit"
        >Submit
        </a-button
        >
      </template>
      <a-form layout="vertical" ref="addMentorForm" :model="form">
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
                  format="DD/MM/YYYY"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Position and Image -->
        <a-row gutter="{16}">
          <a-col :span="12">
            <a-form-item style="width: 90%" label="Level" name="level">
              <a-select v-model:value="form.level" placeholder="Select level">
                <a-select-option v-for="lev in level" :key="lev" :value="lev">
                  {{ lev }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
                style="width: 100%"
                label="Department"
                name="department"
            >
              <a-select
                  v-model:value="form.department"
                  placeholder="Select department"
                  :dropdown-style="{ maxHeight: '140px', overflow: 'auto' }"
              >
                <a-select-option
                    v-for="dep in departments"
                    :key="dep"
                    :value="dep"
                >
                  {{ dep }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item
            style="width: 100%"
            label="Skills"
            name="skills"
            :rules="[{ required: false, message: 'Please input skills' }]"
        >
          <a-input v-model:value="form.skills" placeholder="Enter skills"/>
        </a-form-item>
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
        <a-select
            v-model:value="filters.department"
            placeholder="Department"
            allowClear
            style="width: 100%"
        >
          <a-select-option value="Pending">Pending</a-select-option>
          <a-select-option value="On Progress">On Progress</a-select-option>
        </a-select>
      </a-col>

      <a-col span="4">
        <a-select
            v-model:value="filters.position"
            placeholder="Position"
            allowClear
            style="width: 100%"
        >
          <a-select-option value="Pending">Pending</a-select-option>
          <a-select-option value="On Progress">On Progress</a-select-option>
        </a-select>
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
    >
      <template #open="{ record }">
        <a-checkbox
            :checked="isMentorOpen(record)"
            @change="handleToggle(record.id)"
        >
        </a-checkbox>
      </template>

      <template #action="{ record }">
        <a @click="handleUpdate(record)">Update</a>
        <a-divider type="vertical"/>
        <a @click="handleDelete(record)">Delete</a>
        <a-divider type="vertical"/>
        <a @click="showModalAssign(record)">Assign Intern</a>
      </template>

      <!--      <template #expandedRowRender="{ record }">-->
      <!--        <a-table-->
      <!--            :columns="innerColumns"-->
      <!--            :data-source="innerData(record)"-->
      <!--            :pagination="false"-->
      <!--        >-->
      <!--          <template #bodyCell="{ column, record }">-->
      <!--            <template v-if="column.key === 'operation'">-->
      <!--              <span class="table-operation">-->
      <!--                <a @click="unassign(record.id)">Unassign</a>-->
      <!--                <a style="margin-left: 20px">Contact</a>-->
      <!--              </span>-->
      <!--            </template>-->
      <!--          </template>-->
      <!--        </a-table>-->
      <!--      </template>-->

      <!--      <template #expandColumnTitle>-->
      <!--        <span style="color: red">Interns</span>-->
      <!--      </template>-->
    </a-table>

    <a-modal
        v-model:open="openAssign"
        title="Assign Interns"
        @ok="assignInternsToMentor"
        @cancel="closeModalAssign"
    >
      <template #footer>
        <a-button key="back" @click="closeModalAssign">Cancel</a-button>
        <a-button key="submit" type="primary" @click="handleAssignIntern"
        >Assign
        </a-button
        >
      </template>
      <div>
        <a-switch
            checked-children="Recommend"
            un-checked-children="All Unassigned"
            v-model:checked="recommended"
            @change="switchRecommned"
        />
        <span style="margin-left: 20px"
        >Recommend based on mentor skills - intern position</span
        >
        <a-table
            :data-source="unassignedInterns"
            :columns="internColumns"
            row-key="id"
            :pagination="innerPagination"
            @change="onPaginationChange"
            :row-selection="{
            selectedRowKeys: selectedInterns,
            onChange: updateSelectedInterns,
          }"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted} from "vue";
import {useMentorStore} from "@/stores/mentorStore";
import {useAuthStore} from "@/stores/authStore";
import {toTitleCase} from "@/util/Functions.js";

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
    title: "Department",
    dataIndex: "department",
    key: "department",
  },
  {
    title: "Position",
    dataIndex: "level",
    key: "level",
  },
]

const {
  add,
  update,
  list,
  assign,
  unassign,
  fetchUnassignedInterns,
  setSelectedMentor,
  toggleOpen
} = mentorStore;

const mentors = computed(() => mentorStore.mentors);
const unassignedInterns = computed(() => mentorStore.unassignedInterns);
const currentPage = computed(() => mentorStore.currentPage);
const totalElements = computed(() => mentorStore.totalElements);
const selectedMentor = computed(() => mentorStore.selectedMentor);
const openMentors = computed(() => mentorStore.openMentors);
const addMentorForm = ref(null);
const recommended = ref(false);
const level = ref([
  "Technical Leader",
  "Project Manager",
  "Senior",
  "Engineer Manager",
]);

const departments = ref([
  "DU10",
  "DU11",
  "DU12",
  "DU13",
  "DU20",
  "DU35",
  "JFC",
  "PMO-QAJ",
]);

const filters = ref({
  name: null,
  department: null,
  position: null,
});

const open = ref(false);
const openAssign = ref(false);

const selectedInterns = ref([]);

const updateSelectedInterns = (keys) => {
  selectedInterns.value = keys;
};

const form = reactive({
  email: null,
  fullname: null,
  phone: null,
  dob: null,
  level: null,
  skills: null,
  department: null,
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

const generateColumns = (data) => {
  if (!data || data.length === 0) return;

  columns.value = Object.keys(data[0])
      .filter((key) => key !== "interns" && key !== "open")
      .map((key) => ({
        title:
            key === "department"
                ? "DPT"
                : toTitleCase(key),
        dataIndex: key,
        width:
            key === "department"
                ? 40
                : key === "phone"
                    ? 59
                    : key === "id"
                        ? 30
                        : 90,
      }));

  if (authStore.userRole === "DL") {
    columns.value.push({
      title: "Open",
      key: "open",
      fixed: "right",
      width: 50,
      slots: {customRender: "open"},
    });
  }

  if (authStore.userRole === "DL") {
    columns.value.push({
      title: "Action",
      key: "action",
      fixed: "right",
      width: 70,
      slots: {customRender: "action"},
    });
  }
  ;
}

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

const handleUpdate = (record) => {
  console.log("Update clicked for record:", record);
};

const handleDelete = (record) => {
  console.log("Delete clicked for record:", record);
};

const handleAssignIntern = () => {
  assign(selectedMentor.value.id, selectedInterns.value);
};

const isMentorOpen = (mentor) => {
  // Check if the mentor is open (exists in openMentors array)
  return openMentors.value.includes(mentor);
};

const handleToggle = async (mentorId) => {
  try {
    // Call the store's toggleOpenStatus method and pass the mentorId and the new checked state
    await toggleOpen(mentorId);
  } catch (error) {
    console.error("Failed to toggle mentor status:", error);
  }
};

const applyFilters = async () => {
    await list(currentPage.value, pagination.pageSize, filters.value);
};


const internColumns = [
  {
    title: "Intern ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Intern Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Position",
    dataIndex: "position",
    key: "position",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
];

const innerColumns = [
  {
    title: "Intern Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Intern Name",
    dataIndex: "fullname",
    key: "fullname",
  },
  {
    title: "Position",
    dataIndex: "position",
    key: "position",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Action",
    dataIndex: "operation",
    key: "operation",
  },
];

const innerData = (record) => {
  console.log(record);
  return record.interns || [];
};

const showModal = () => {
  open.value = true;
};

const showModalAssign = (record) => {
  setSelectedMentor(record);
  fetchUnassignedInterns(record.id, recommended.value);
  openAssign.value = true;
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
</style>
