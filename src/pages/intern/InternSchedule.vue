<template>
  <div class="schedule-container">
    <a-page-header
      title="My Class Schedule"
      sub-title="View your weekly class schedule"
    >
      <template #extra>
        <a-space>
          <a-switch
            v-model:checked="showStats"
            checked-children="View Stats"
            un-checked-children="View Calendar"
            style="margin-right: 16px"
          />
          <a-radio-group v-model:value="viewType" button-style="solid" :disabled="showStats">
            <a-radio-button value="month">Month</a-radio-button>
            <a-radio-button value="week">Week</a-radio-button>
            <a-radio-button value="day">Day</a-radio-button>
          </a-radio-group>
        </a-space>
      </template>
    </a-page-header>
    
    <a-spin :spinning="loading">
      <!-- Statistics View -->
      <div v-if="showStats" class="stats-container">
        <a-row :gutter="[24, 24]">
          <!-- Class Summary -->
          <a-col :span="24" :lg="12">
            <a-card title="My Class Schedule Summary">
              <a-statistic-card title="Enrolled Classes" :value="internClasses.length" style="margin-bottom: 16px;">
                <template #footer>
                  <div class="stat-footer">
                    <a-tag color="blue">{{ activeClasses.length }} Active</a-tag>
                    <a-tag color="orange">{{ plannedClasses.length }} Planned</a-tag>
                    <a-tag color="gray">{{ completedClasses.length }} Completed</a-tag>
                  </div>
                </template>
              </a-statistic-card>

              <a-list
                :data-source="internClasses"
                :pagination="{ pageSize: 5 }"
                header="Class Schedule"
              >
                <template #renderItem="{ item }">
                  <a-list-item>
                    <a-list-item-meta
                      :title="item.name"
                      :description="formatSchedule(item)"
                    >
                      <template #avatar>
                        <a-tag :color="getStatusColor(item.status)">{{ item.status }}</a-tag>
                      </template>
                    </a-list-item-meta>
                    <template #actions>
                      <router-link :to="`/intern/classes/${item.id}`">
                        <a-button type="link">Details</a-button>
                      </router-link>
                    </template>
                  </a-list-item>
                </template>
              </a-list>
            </a-card>
          </a-col>

          <!-- Upcoming Tests -->
          <a-col :span="24" :lg="12">
            <a-card title="Upcoming Tests" :loading="testsLoading">
              <template #extra>
                <router-link to="/intern/tests">
                  <a-button type="link">View All Tests</a-button>
                </router-link>
              </template>
              
              <a-empty v-if="!upcomingTests || upcomingTests.length === 0" description="No upcoming tests" />
              
              <a-list v-else :data-source="upcomingTests" :pagination="{ pageSize: 5 }">
                <template #renderItem="{ item }">
                  <a-list-item>
                    <a-list-item-meta
                      :title="item.title"
                      :description="`${getClassNameById(item.classId)} | ${item.durationMinutes} minutes | Passing: ${item.passingScore}%`"
                    >
                      <template #avatar>
                        <a-avatar style="background-color: #1890ff">
                          <template #icon><form-outlined /></template>
                        </a-avatar>
                      </template>
                    </a-list-item-meta>
                    <template #actions>
                      <router-link :to="`/intern/tests/${item.id}`">
                        <a-button type="primary" size="small">Take Test</a-button>
                      </router-link>
                    </template>
                  </a-list-item>
                </template>
              </a-list>
            </a-card>
          </a-col>
        </a-row>
      </div>
      
      <!-- Calendar View -->
      <div v-else class="calendar-container">
        <a-card>
          <a-row>
            <a-col :span="24">
              <div class="calendar-header">
                <a-button @click="prevPeriod">
                  <left-outlined />
                </a-button>
                <h2>{{ calendarTitle }}</h2>
                <a-button @click="nextPeriod">
                  <right-outlined />
                </a-button>
                <a-button @click="today">Today</a-button>
              </div>
              
              <div class="calendar" ref="calendarEl"></div>
            </a-col>
          </a-row>
        </a-card>
      </div>
    </a-spin>
    
    <!-- Event Details Modal -->
    <a-modal
      v-model:visible="eventModalVisible"
      :title="selectedEvent?.title || 'Class Details'"
      @ok="closeEventModal"
      @cancel="closeEventModal"
      :footer="null"
    >
      <a-descriptions bordered :column="1">
        <a-descriptions-item label="Class">
          <router-link :to="`/intern/classes/${selectedEvent?.classId}`">
            {{ selectedEvent?.title }}
          </router-link>
        </a-descriptions-item>
        <a-descriptions-item label="Time">{{ formatEventTime(selectedEvent) }}</a-descriptions-item>
        <a-descriptions-item label="Status">
          <a-tag :color="getStatusColor(selectedEvent?.status)">{{ selectedEvent?.status }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Mentor">{{ selectedEvent?.mentor || 'Not assigned' }}</a-descriptions-item>
        <a-descriptions-item label="Description">{{ selectedEvent?.description || 'No description' }}</a-descriptions-item>
      </a-descriptions>
      
      <div class="modal-footer">
        <a-button @click="closeEventModal">Close</a-button>
        <a-button type="primary" @click="viewClassDetails">View Class Details</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useInternClassStore } from '@/stores/internClassStore';
import { useAuthStore } from '@/stores/authStore';
import { message } from 'ant-design-vue';
import { LeftOutlined, RightOutlined, FormOutlined } from '@ant-design/icons-vue';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const router = useRouter();
const internClassStore = useInternClassStore();
const authStore = useAuthStore();

const loading = ref(false);
const testsLoading = ref(false);
const calendarEl = ref(null);
const calendar = ref(null);
const viewType = ref('week');
const currentDate = ref(new Date());
const calendarTitle = ref('');
const showStats = ref(false);
const upcomingTests = ref([]);
const internClasses = ref([]);

// Event details modal
const eventModalVisible = ref(false);
const selectedEvent = ref(null);

// Computed properties for class statistics
const activeClasses = computed(() => 
  internClasses.value.filter(c => c.status === 'ACTIVE')
);

const plannedClasses = computed(() => 
  internClasses.value.filter(c => c.status === 'PLANNED')
);

const completedClasses = computed(() => 
  internClasses.value.filter(c => c.status === 'COMPLETED')
);

const currentUserId = computed(() => {
  const user = authStore.currentUser;
  return user ? user.id : null;
});

onMounted(async () => {
  if (currentUserId.value) {
    await fetchClasses();
    initCalendar();
  }
});

onBeforeUnmount(() => {
  if (calendar.value) {
    calendar.value.destroy();
  }
});

const fetchClasses = async () => {
  loading.value = true;
  try {
    const response = await internClassStore.fetchInternClasses(currentUserId.value);
    internClasses.value = response || [];
    
    // Fetch tests for stats view if needed
    if (showStats.value) {
      await fetchTestsData();
    }
  } catch (error) {
    console.error('Error fetching classes:', error);
    message.error('Failed to load your classes');
  } finally {
    loading.value = false;
  }
};

const fetchTestsData = async () => {
  testsLoading.value = true;
  try {
    const response = await internClassStore.fetchInternTests(currentUserId.value);
    if (response && Array.isArray(response)) {
      // Filter for only upcoming tests (not taken yet)
      upcomingTests.value = response
        .filter(test => test.isPublished)
        .slice(0, 5); // Show only top 5
    }
  } catch (error) {
    console.error('Error fetching tests:', error);
  } finally {
    testsLoading.value = false;
  }
};

const initCalendar = () => {
  const calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: getCalendarViewType(),
    headerToolbar: false, // We'll create our own header
    events: generateCalendarEvents(),
    eventClick: handleEventClick,
    height: 'auto',
    allDaySlot: false,
    slotMinTime: '07:00:00',
    slotMaxTime: '21:00:00',
    stickyHeaderDates: true,
    weekNumbers: true,
    nowIndicator: true,
    datesSet: (info) => {
      currentDate.value = info.view.currentStart;
      updateCalendarTitle();
    }
  };
  
  calendar.value = new Calendar(calendarEl.value, calendarOptions);
  calendar.value.render();
  updateCalendarTitle();
};

const updateCalendarView = () => {
  if (calendar.value) {
    calendar.value.changeView(getCalendarViewType());
    updateCalendarTitle();
  }
};

const updateCalendarTitle = () => {
  const date = currentDate.value;
  const dateFormatter = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const monthFormatter = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long'
  });
  
  if (viewType.value === 'month') {
    calendarTitle.value = monthFormatter.format(date);
  } else if (viewType.value === 'week') {
    const weekStart = new Date(date);
    const weekEnd = new Date(date);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      calendarTitle.value = `${monthFormatter.format(weekStart)} ${weekStart.getDate()} - ${weekEnd.getDate()}`;
    } else {
      calendarTitle.value = `${dateFormatter.format(weekStart)} - ${dateFormatter.format(weekEnd)}`;
    }
  } else {
    calendarTitle.value = dateFormatter.format(date);
  }
};

const getCalendarViewType = () => {
  switch (viewType.value) {
    case 'month':
      return 'dayGridMonth';
    case 'week':
      return 'timeGridWeek';
    case 'day':
      return 'timeGridDay';
    default:
      return 'timeGridWeek';
  }
};

const generateCalendarEvents = () => {
  const classes = internClassStore.internClasses || [];
  const events = [];
  
  classes.forEach(classItem => {
    if (classItem.scheduleDays && classItem.scheduleDays.length) {
      const days = mapScheduleDaysToDayNumbers(classItem.scheduleDays);
      const startTime = classItem.startTime || '09:00';
      const endTime = classItem.endTime || '11:00';
      
      days.forEach(day => {
        events.push({
          id: `class-${classItem.id}-day-${day}`,
          title: classItem.name,
          daysOfWeek: [day],
          startTime,
          endTime,
          classId: classItem.id,
          status: classItem.status,
          description: classItem.description,
          mentor: classItem.mentor ? classItem.mentor.fullname : 'Not assigned',
          color: getEventColor(classItem.status)
        });
      });
    }
  });
  
  return events;
};

const mapScheduleDaysToDayNumbers = (days) => {
  const dayMap = {
    'MONDAY': 1,
    'TUESDAY': 2,
    'WEDNESDAY': 3,
    'THURSDAY': 4,
    'FRIDAY': 5,
    'SATURDAY': 6,
    'SUNDAY': 0
  };
  
  return days.map(day => dayMap[day.toUpperCase()]).filter(day => day !== undefined);
};

const getEventColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return '#52c41a'; // green
    case 'PLANNED':
      return '#1890ff'; // blue
    case 'COMPLETED':
      return '#8c8c8c'; // grey
    default:
      return '#1890ff';
  }
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

const handleEventClick = (info) => {
  selectedEvent.value = info.event.extendedProps;
  selectedEvent.value.title = info.event.title;
  eventModalVisible.value = true;
};

const prevPeriod = () => {
  calendar.value.prev();
};

const nextPeriod = () => {
  calendar.value.next();
};

const today = () => {
  calendar.value.today();
};

const closeEventModal = () => {
  eventModalVisible.value = false;
  selectedEvent.value = null;
};

const viewClassDetails = () => {
  if (selectedEvent.value && selectedEvent.value.classId) {
    router.push(`/intern/classes/${selectedEvent.value.classId}`);
    closeEventModal();
  }
};

const formatEventTime = (event) => {
  if (!event) return '';
  return `${event.startTime} - ${event.endTime}`;
};

const getClassNameById = (classId) => {
  if (!classId) return 'Unknown';
  const classObj = internClasses.value.find(c => c.id === classId);
  return classObj ? classObj.name : 'Unknown';
};

// Watch for changes in view type
const watchViewType = () => {
  if (calendar.value) {
    updateCalendarView();
  }
};

// Setup watchers
import { watch } from 'vue';
watch(viewType, watchViewType);

// Watch for stats view toggle
watch(showStats, async (newVal) => {
  if (newVal) {
    // When switching to stats view, fetch tests data
    await fetchTestsData();
  } else {
    // When switching to calendar view, make sure calendar is initialized
    if (!calendar.value && calendarEl.value) {
      initCalendar();
    }
  }
});
</script>

<style>
.schedule-container {
  padding: 20px;
}

.calendar-container {
  margin-top: 20px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  gap: 16px;
}

.calendar-header h2 {
  margin: 0;
  flex: 1;
  text-align: center;
}

.calendar {
  height: 800px;
}

.modal-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* FullCalendar Customizations */
.fc-event {
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 4px;
}

.fc-event-title {
  font-weight: 500;
  white-space: normal;
}

.fc-today-button {
  text-transform: capitalize;
}

.fc .fc-col-header-cell-cushion {
  padding: 8px;
  font-weight: 600;
  color: #1f2937;
}

.fc-theme-standard td, .fc-theme-standard th {
  border-color: #f0f0f0;
}

.fc .fc-daygrid-day.fc-day-today,
.fc .fc-timegrid-col.fc-day-today {
  background-color: rgba(24, 144, 255, 0.05);
}

/* Stats tag styling */
:deep(.ant-tag) {
  font-size: 14px;
  padding: 4px 8px;
  margin-right: 8px;
}

/* Stats view styling */
.stats-container {
  margin-top: 20px;
}

.stat-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.ant-list-header) {
  font-weight: 600;
  font-size: 16px;
  padding: 16px;
  background-color: #f7f7f7;
}

:deep(.ant-statistic-card) {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

:deep(.ant-list-item) {
  padding: 12px 16px;
}

:deep(.ant-list-pagination) {
  margin-top: 16px;
  text-align: center;
}
</style> 