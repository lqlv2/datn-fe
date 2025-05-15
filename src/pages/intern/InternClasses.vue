<template>
  <div class="intern-classes-container">
    <a-page-header 
      title="My Learning Portal" 
      sub-title="Manage your enrolled classes and discover new courses"
    >
      <template #extra>
        <a-button type="primary" @click="refreshData">
          <reload-outlined />
          Refresh
        </a-button>
      </template>
    </a-page-header>
    
    <a-tabs>
      <a-tab-pane key="my-classes" tab="My Classes">
        <div class="filters-container">
          <a-input-search
            v-model:value="filters.name"
            placeholder="Search by class name"
            style="width: 250px; margin-right: 16px"
            @search="applyFilters"
          />
          <a-select
            v-model:value="filters.status"
            placeholder="Filter by status"
            style="width: 150px; margin-right: 16px"
            @change="applyFilters"
            allowClear
          >
            <a-select-option value="ACTIVE">Active</a-select-option>
            <a-select-option value="PLANNED">Planned</a-select-option>
            <a-select-option value="COMPLETED">Completed</a-select-option>
          </a-select>
          <a-select
            v-model:value="sortOption"
            placeholder="Sort by"
            style="width: 150px"
            @change="applyFilters"
          >
            <a-select-option value="name_asc">Name (A-Z)</a-select-option>
            <a-select-option value="name_desc">Name (Z-A)</a-select-option>
            <a-select-option value="date_asc">Start Date (Oldest)</a-select-option>
            <a-select-option value="date_desc">Start Date (Newest)</a-select-option>
          </a-select>
        </div>
        
        <a-spin :spinning="loading">
          <a-empty v-if="filteredInternClasses.length === 0" description="You are not enrolled in any classes matching your criteria" />
          
          <div v-else class="class-cards">
            <a-card v-for="classItem in filteredInternClasses" :key="classItem.id" class="class-card">
              <template #title>
                <div class="class-title">
                  {{ classItem.name }}
                  <a-tag :color="getStatusColor(classItem.status)">{{ classItem.status }}</a-tag>
                </div>
              </template>
              
              <template #extra>
                <router-link :to="`/intern/classes/${classItem.id}`">
                  <a-button type="primary">
                    View Details
                  </a-button>
                </router-link>
              </template>
              
              <div class="class-info">
                <p><strong>Code:</strong> {{ classItem.code }}</p>
                <p><strong>Schedule:</strong> {{ formatSchedule(classItem) }}</p>
                <p><strong>Mentor:</strong> {{ classItem.mentor ? classItem.mentor.fullname : 'Not assigned yet' }}</p>
                <p v-if="classItem.description"><strong>Description:</strong> {{ classItem.description }}</p>
              </div>
            </a-card>
          </div>
        </a-spin>
      </a-tab-pane>
      
      <a-tab-pane key="available-classes" tab="Available Classes">
        <div class="filters-container">
          <a-input-search
            v-model:value="availableFilters.name"
            placeholder="Search by class name"
            style="width: 250px; margin-right: 16px"
            @search="applyAvailableFilters"
          />
          <a-select
            v-model:value="availableFilters.status"
            placeholder="Filter by status"
            style="width: 150px; margin-right: 16px"
            @change="applyAvailableFilters"
            allowClear
          >
            <a-select-option value="ACTIVE">Active</a-select-option>
            <a-select-option value="PLANNED">Planned</a-select-option>
          </a-select>
          <a-select
            v-model:value="availableSortOption"
            placeholder="Sort by"
            style="width: 150px"
            @change="applyAvailableFilters"
          >
            <a-select-option value="name_asc">Name (A-Z)</a-select-option>
            <a-select-option value="name_desc">Name (Z-A)</a-select-option>
            <a-select-option value="date_asc">Start Date (Oldest)</a-select-option>
            <a-select-option value="date_desc">Start Date (Newest)</a-select-option>
          </a-select>
        </div>
        
        <a-spin :spinning="loading">
          <a-empty v-if="filteredAvailableClasses.length === 0" description="No available classes matching your criteria" />
          
          <div v-else class="class-cards">
            <a-card v-for="classItem in filteredAvailableClasses" :key="classItem.id" class="class-card">
              <template #title>
                <div class="class-title">
                  {{ classItem.name }}
                  <a-tag :color="getStatusColor(classItem.status)">{{ classItem.status }}</a-tag>
                </div>
              </template>
              
              <div class="class-info">
                <p><strong>Code:</strong> {{ classItem.code }}</p>
                <p><strong>Schedule:</strong> {{ formatSchedule(classItem) }}</p>
                <p><strong>Mentor:</strong> {{ classItem.mentor ? classItem.mentor.fullname : 'Not assigned yet' }}</p>
                <p v-if="classItem.description"><strong>Description:</strong> {{ classItem.description }}</p>
              </div>
              
              <a-button 
                type="primary" 
                class="register-btn" 
                @click="registerForClass(classItem.id)"
              >
                Register
              </a-button>
            </a-card>
          </div>
        </a-spin>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useInternClassStore } from '@/stores/internClassStore';
import { useAuthStore } from '@/stores/authStore';
import { message, Modal } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';

const internClassStore = useInternClassStore();
const authStore = useAuthStore();

const internClasses = computed(() => internClassStore.internClasses || []);
const availableClasses = computed(() => internClassStore.availableClasses || []);
const loading = computed(() => internClassStore.loading);

// Filters
const filters = ref({
  name: '',
  status: null
});

const availableFilters = ref({
  name: '',
  status: null
});

const sortOption = ref('name_asc');
const availableSortOption = ref('name_asc');

// Computed properties for filtered and sorted classes
const filteredInternClasses = computed(() => {
  let result = [...internClasses.value];
  
  // Apply name filter
  if (filters.value.name) {
    const searchTerm = filters.value.name.toLowerCase();
    result = result.filter(classItem => 
      classItem.name.toLowerCase().includes(searchTerm) ||
      (classItem.code && classItem.code.toLowerCase().includes(searchTerm))
    );
  }
  
  // Apply status filter
  if (filters.value.status) {
    result = result.filter(classItem => classItem.status === filters.value.status);
  }
  
  // Apply sorting
  result = sortClasses(result, sortOption.value);
  
  return result;
});

const filteredAvailableClasses = computed(() => {
  let result = [...availableClasses.value];
  
  // Apply name filter
  if (availableFilters.value.name) {
    const searchTerm = availableFilters.value.name.toLowerCase();
    result = result.filter(classItem => 
      classItem.name.toLowerCase().includes(searchTerm) ||
      (classItem.code && classItem.code.toLowerCase().includes(searchTerm))
    );
  }
  
  // Apply status filter
  if (availableFilters.value.status) {
    result = result.filter(classItem => classItem.status === availableFilters.value.status);
  }
  
  // Apply sorting
  result = sortClasses(result, availableSortOption.value);
  
  return result;
});

const currentUserId = computed(() => {
  const user = authStore.currentUser;
  return user ? user.id : null;
});

onMounted(async () => {
  if (currentUserId.value) {
    await fetchData();
  }
});

const sortClasses = (classes, sortOpt) => {
  const sorted = [...classes];
  
  switch(sortOpt) {
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name_desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'date_asc':
      return sorted.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    case 'date_desc':
      return sorted.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    default:
      return sorted;
  }
};

const applyFilters = () => {
  // No need to do anything here as we're using computed properties
  // You could add custom logic here if needed
};

const applyAvailableFilters = () => {
  // No need to do anything here as we're using computed properties
  // You could add custom logic here if needed
};

const refreshData = async () => {
  try {
    await fetchData();
    message.success('Data refreshed successfully');
  } catch (error) {
    message.error('Failed to refresh data');
  }
};

const fetchData = async () => {
  try {
    console.log('Fetching intern classes data, user ID:', currentUserId.value);
    await Promise.all([
      internClassStore.fetchInternClasses(currentUserId.value),
      internClassStore.fetchAvailableClasses(currentUserId.value)
    ]);
    console.log('Successfully fetched class data:', {
      internClasses: internClassStore.internClasses.length,
      availableClasses: internClassStore.availableClasses.length
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    message.error('Failed to load classes');
  }
};

const formatSchedule = (classItem) => {
  const days = classItem.scheduleDays ? classItem.scheduleDays.join(', ') : 'N/A';
  const times = classItem.startTime && classItem.endTime 
    ? `${classItem.startTime} - ${classItem.endTime}` 
    : '';
  
  return times ? `${days} (${times})` : days;
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

const registerForClass = async (classId) => {
  try {
    await internClassStore.registerForClass(currentUserId.value, classId);
  } catch (error) {
    console.error('Error registering for class:', error);
  }
};

const confirmUnregister = (classItem) => {
  Modal.confirm({
    title: 'Unregister from Class',
    content: `Are you sure you want to unregister from "${classItem.name}"?`,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk: () => unregisterFromClass(classItem.id)
  });
};

const unregisterFromClass = async (classId) => {
  try {
    await internClassStore.unregisterFromClass(currentUserId.value, classId);
  } catch (error) {
    console.error('Error unregistering from class:', error);
  }
};
</script>

<style scoped>
.intern-classes-container {
  padding: 20px;
}

.filters-container {
  display: flex;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.class-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.class-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  border-radius: 8px;
  overflow: hidden;
}

.class-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.class-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.class-info {
  flex: 1;
  margin-bottom: 15px;
  line-height: 1.6;
}

.class-info p {
  margin-bottom: 8px;
}

.register-btn,
.unregister-btn {
  width: 100%;
  border-radius: 4px;
  font-weight: 500;
  margin-top: 8px;
}

/* Tab styling */
:deep(.ant-tabs-nav) {
  margin-bottom: 24px;
}

:deep(.ant-tabs-tab) {
  font-size: 16px;
  padding: 12px 20px;
}

:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  font-weight: 600;
}
</style> 