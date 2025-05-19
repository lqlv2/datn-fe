<template>
  <div class="class-management">
    <div class="page-header">
      <h2 class="header-title">Class Management</h2>
      <a-button type="primary" class="add-button" @click="showCreateClassModal">
        <template #icon><plus-outlined /></template>
        Create Class
      </a-button>
    </div>
    
    <div class="filter-container">
      <a-row :gutter="[24, 16]" align="middle">
        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-input 
              v-model:value="filters.name" 
              placeholder="Search by class name..." 
              class="filter-input"
              allow-clear
            />
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :md="8" :lg="6">
          <div class="filter-item">
            <a-button type="primary" class="search-button" @click="handleSearch">
              <template #icon><search-outlined /></template>
              Search
            </a-button>
          </div>
        </a-col>
      </a-row>
    </div>
    
    <div class="table-container">
      <a-table 
        :dataSource="classStore.classes" 
        :columns="columns"
        :pagination="pagination"
        :loading="classStore.loading"
        @change="handleTableChange"
        row-key="id"
        :scroll="{ x: 1500, y: 500 }"
        :row-class-name="(_record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')"
        class="custom-table"
        bordered
      >
        <template #status="{ text }">
          <a-tag :color="getStatusColor(text)" class="status-tag">
            {{ text }}
          </a-tag>
        </template>
        
        <template #scheduleDays="{ record }">
          <div>
            <a-tag v-for="day in record.scheduleDays" :key="day" color="blue" class="day-tag">
              {{ day }}
            </a-tag>
          </div>
        </template>
        
        <template #mentor="{ record }">
          <span v-if="record.mentor">{{ record.mentor.fullname }}</span>
          <a-tag v-else color="orange">No Mentor Assigned</a-tag>
        </template>
        
        <template #internsCount="{ record }">
          <a-badge :count="record.internsCount" :overflowCount="99" />
        </template>
        
        <template #action="{ record }">
          <div class="action-buttons">
            <a-button type="primary" size="small" @click="handleViewClass(record)" class="action-button">
              <eye-outlined />
              View
            </a-button>
            <a-button type="default" size="small" @click="handleEditClass(record)" class="action-button">
              <edit-outlined />
              Edit
            </a-button>
            <a-button type="danger" size="small" @click="showDeleteConfirm(record)" class="action-button">
              <delete-outlined />
              Delete
            </a-button>
          </div>
        </template>
      </a-table>
    </div>

    <!-- Create/Edit Class Modal -->
    <a-modal
      v-model:visible="classModalVisible"
      :title="editMode ? 'Edit Class' : 'Create New Class'"
      @ok="handleSaveClass"
      :confirmLoading="confirmLoading"
      width="700px"
    >
      <a-form :model="classForm" :rules="rules" ref="classFormRef" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="Class Name" name="name">
              <a-input v-model:value="classForm.name" placeholder="Enter class name" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Start Date" name="startDate">
              <a-date-picker v-model:value="classForm.startDate" style="width: 100%" format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="End Date" name="endDate">
              <a-date-picker v-model:value="classForm.endDate" style="width: 100%" format="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Description" name="description">
          <a-textarea v-model:value="classForm.description" placeholder="Enter class description" rows="3" />
        </a-form-item>

        <a-form-item label="Detailed Description" name="detailedDescription">
          <a-textarea v-model:value="classForm.detailedDescription" placeholder="Enter detailed class description (markdown supported)" rows="5" />
        </a-form-item>

        <a-form-item label="Schedule" name="schedule">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item name="scheduleDays" label="Days">
                <a-select v-model:value="classForm.scheduleDays" mode="multiple" placeholder="Select days">
                  <a-select-option value="Monday">Monday</a-select-option>
                  <a-select-option value="Tuesday">Tuesday</a-select-option>
                  <a-select-option value="Wednesday">Wednesday</a-select-option>
                  <a-select-option value="Thursday">Thursday</a-select-option>
                  <a-select-option value="Friday">Friday</a-select-option>
                  <a-select-option value="Saturday">Saturday</a-select-option>
                  <a-select-option value="Sunday">Sunday</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="startTime" label="Start Time">
                <a-time-picker v-model:value="classForm.startTime" format="HH:mm" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="endTime" label="End Time">
                <a-time-picker v-model:value="classForm.endTime" format="HH:mm" style="width: 100%" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>

        <a-form-item label="Assign Mentor" name="mentorId">
          <a-select 
            v-model:value="classForm.mentorId" 
            placeholder="Select a mentor"
            show-search
            :filter-option="filterMentorOption"
          >
            <a-select-option v-for="mentor in mentors" :key="mentor.id" :value="mentor.id">
              {{ mentor.fullname }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Delete Confirmation Modal -->
    <a-modal
      v-model:visible="deleteModalVisible"
      title="Delete Class"
      @ok="handleDeleteClass"
      :confirmLoading="confirmLoading"
    >
      <p>Are you sure you want to delete class <strong>{{ selectedClass?.name }}</strong>?</p>
      <p>This action cannot be undone.</p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useClassStore } from '@/stores/classStore';
import { useMentorStore } from '@/stores/mentorStore';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';

// Router and stores
const router = useRouter();
const classStore = useClassStore();
const mentorStore = useMentorStore();

// Data & state
const mentors = ref([]);
const classModalVisible = ref(false);
const deleteModalVisible = ref(false);
const confirmLoading = ref(false);
const editMode = ref(false);
const classFormRef = ref(null);
const selectedClass = ref(null);

const classForm = reactive({
  id: null,
  name: '',
  status: 'ACTIVE',
  description: '',
  detailedDescription: '',
  startDate: null,
  endDate: null,
  scheduleDays: [],
  startTime: null,
  endTime: null,
  mentorId: null
});

const filters = reactive({
  name: '',
});

const columns = [
  {
    title: 'Class Name',
    dataIndex: 'name',
    key: 'name',
    align: 'center'
  },
  {
    title: 'Start Date',
    dataIndex: 'startDate',
    key: 'startDate',
    align: 'center'
  },
  {
    title: 'End Date',
    dataIndex: 'endDate',
    key: 'endDate',
    align: 'center'
  },
  {
    title: 'Schedule Days',
    key: 'scheduleDays',
    slots: { customRender: 'scheduleDays' },
    align: 'center'
  },
  {
    title: 'Mentor',
    key: 'mentor',
    slots: { customRender: 'mentor' },
    align: 'center'
  },
  {
    title: 'Interns',
    key: 'internsCount',
    slots: { customRender: 'internsCount' },
    align: 'center',
  },
  {
    title: 'Actions',
    key: 'action',
    slots: { customRender: 'action' },
    align: 'center',
    fixed: 'right',
  },
];

const rules = {
  name: [{ required: true, message: 'Please enter the class name', trigger: 'blur' }],
  status: [{ required: true, message: 'Please select a status', trigger: 'change' }],
  startDate: [{ required: true, message: 'Please select a start date', trigger: 'change' }],
  endDate: [{ required: true, message: 'Please select an end date', trigger: 'change' }],
  scheduleDays: [{ required: true, message: 'Please select at least one day', trigger: 'change' }],
  startTime: [{ required: true, message: 'Please select a start time', trigger: 'change' }],
  endTime: [{ required: true, message: 'Please select an end time', trigger: 'change' }],
};

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: total => `Total ${total} classes`,
});

// Fetch data on mount
onMounted(async () => {
  await fetchData();
  await fetchMentors();
});

// Methods
const fetchData = async () => {
  try {
    const params = {
      page: pagination.current - 1, // Backend uses 0-based indexing
      size: pagination.pageSize,
      name: filters.name || undefined,
      status: filters.status || undefined,
    };
    await classStore.fetchClasses(params);
    pagination.total = classStore.pagination.total;
  } catch (error) {
    console.error('Error fetching classes:', error);
  }
};

const fetchMentors = async () => {
  try {
    await mentorStore.list(1, 10000, {});
    mentors.value = mentorStore.mentors;
  } catch (error) {
    console.error('Error fetching mentors:', error);
  }
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchData();
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const showCreateClassModal = () => {
  editMode.value = false;
  resetForm();
  classModalVisible.value = true;
};

const handleEditClass = (record) => {
  editMode.value = true;
  selectedClass.value = record;
  
  classForm.id = record.id;
  classForm.name = record.name;
  classForm.status = record.status;
  classForm.description = record.description || '';
  classForm.detailedDescription = record.detailedDescription || '';
  classForm.startDate = record.startDate ? dayjs(record.startDate) : null;
  classForm.endDate = record.endDate ? dayjs(record.endDate) : null;
  classForm.scheduleDays = record.scheduleDays || [];
  classForm.startTime = record.startTime ? dayjs(record.startTime, 'HH:mm') : null;
  classForm.endTime = record.endTime ? dayjs(record.endTime, 'HH:mm') : null;
  classForm.mentorId = record.mentor?.id || null;
  
  classModalVisible.value = true;
};

const handleViewClass = (record) => {
  router.push(`/admin/classes/${record.id}`);
};

const showDeleteConfirm = (record) => {
  selectedClass.value = record;
  deleteModalVisible.value = true;
};

const handleDeleteClass = async () => {
  try {
    confirmLoading.value = true;
    await classStore.deleteClass(selectedClass.value.id);
    await fetchData();
    deleteModalVisible.value = false;
  } catch (error) {
    console.error('Error deleting class:', error);
  } finally {
    confirmLoading.value = false;
  }
};

const handleSaveClass = () => {
  classFormRef.value.validate().then(async () => {
    try {
      confirmLoading.value = true;
      
      const formattedData = {
        name: classForm.name,
        code: classForm.code || generateClassCode(classForm.name),
        status: classForm.status,
        description: classForm.description,
        detailedDescription: classForm.detailedDescription,
        startDate: classForm.startDate ? dayjs(classForm.startDate).format('YYYY-MM-DDTHH:mm:ss') : null,
        endDate: classForm.endDate ? dayjs(classForm.endDate).format('YYYY-MM-DDTHH:mm:ss') : null,
        scheduleDays: classForm.scheduleDays,
        startTime: classForm.startTime ? dayjs(classForm.startTime).format('HH:mm') : null,
        endTime: classForm.endTime ? dayjs(classForm.endTime).format('HH:mm') : null,
        mentorId: classForm.mentorId,
      };
      
      if (editMode.value) {
        await classStore.updateClass(classForm.id, formattedData);
      } else {
        await classStore.createClass(formattedData);
      }
      
      classModalVisible.value = false;
      await fetchData();
    } catch (error) {
      console.error('Error saving class:', error);
    } finally {
      confirmLoading.value = false;
    }
  });
};

const resetForm = () => {
  classForm.id = null;
  classForm.name = '';
  classForm.status = 'PLANNED';
  classForm.description = '';
  classForm.detailedDescription = '';
  classForm.startDate = null;
  classForm.endDate = null;
  classForm.scheduleDays = [];
  classForm.startTime = null;
  classForm.endTime = null;
  classForm.mentorId = null;
  
  // Reset form validation
  nextTick(() => {
    classFormRef.value?.resetFields();
  });
};

const filterMentorOption = (input, option) => {
  return (option.children[0] || '').toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'green';
    case 'PLANNED':
      return 'blue';
    case 'COMPLETED':
      return 'gray';
    default:
      return 'default';
  }
};

// Helper function to generate a class code if not provided
const generateClassCode = (name) => {
  if (!name) return '';
  // Generate a code based on name + timestamp
  const prefix = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${timestamp}`;
};
</script>

<style scoped>
.class-management {
  padding: 16px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eaeaea;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
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

.filter-input, .filter-select {
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

.status-tag {
  font-weight: medium;
  padding: 2px 8px;
  border-radius: 12px;
}

.day-tag {
  margin: 2px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-button {
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .class-management {
    padding: 12px;
  }
  
  .filter-container,
  .table-container {
    padding: 16px;
  }
  
  .header-title {
    font-size: 1.25rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
