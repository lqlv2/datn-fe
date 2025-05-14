<template>
  <div class="schedule-container">
    <a-page-header
      title="My Class Schedule"
      sub-title="View your weekly class schedule"
    >
      <template #extra>
        <a-space>
<!--          <a-switch-->
<!--            v-model:checked="showStats"-->
<!--            checked-children="View Stats"-->
<!--            un-checked-children="View Calendar"-->
<!--            style="margin-right: 16px"-->
<!--          />-->
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
    await fetchAllData();
    // Initialize calendar only if we're in calendar view
    if (!showStats.value) {
      // Short delay to ensure DOM is ready
      setTimeout(() => {
        initCalendar();
      }, 100);
    }
  }
});

onBeforeUnmount(() => {
  if (calendar.value) {
    try {
      calendar.value.destroy();
      calendar.value = null;
    } catch (error) {
      console.error('Error destroying calendar:', error);
    }
  }
});

// Fetch all necessary data
const fetchAllData = async () => {
  loading.value = true;
  try {
    console.log('Fetching all data for user ID:', currentUserId.value);
    await fetchClasses();
    await fetchTestsData();
  } catch (error) {
    console.error('Error fetching data:', error);
    message.error('Failed to load all data');
  } finally {
    loading.value = false;
  }
};

const fetchClasses = async () => {
  try {
    console.log('Fetching classes for intern ID:', currentUserId.value);
    const response = await internClassStore.fetchInternClasses(currentUserId.value);
    internClasses.value = response || [];
    console.log('Fetched classes:', internClasses.value);
  } catch (error) {
    console.error('Error fetching classes:', error);
    message.error('Failed to load your classes');
  }
};

// Add a dedicated function to fetch tests
const fetchTestsData = async () => {
  testsLoading.value = true;
  try {
    console.log('Fetching tests data for user ID:', currentUserId.value);
    await internClassStore.fetchInternTests(currentUserId.value);
    console.log('Fetched tests:', internClassStore.internTests);
    if (internClassStore.internTests) {
      upcomingTests.value = internClassStore.internTests
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
  if (calendarEl.value) {
    console.log('Initializing calendar with plugins:', { dayGridPlugin, timeGridPlugin, interactionPlugin });
    try {
      calendar.value = new Calendar(calendarEl.value, {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: getCalendarViewType(),
        initialDate: currentDate.value,
        headerToolbar: false,
        height: 'auto',
        dayMaxEvents: true,
        selectable: false,
        allDaySlot: false,
        slotMinTime: '07:00:00',
        slotMaxTime: '20:00:00',
        eventDisplay: 'block',
        displayEventEnd: true,
        eventInteractive: false,
        lazyFetching: true,
        events: (info, successCallback, failureCallback) => {
          console.log('Calendar requesting events:', info);
          fetchCalendarEvents(info.startStr.split('T')[0], info.endStr.split('T')[0])
            .then(events => {
              successCallback(events);
            })
            .catch(error => {
              failureCallback(error);
            });
        },
        datesSet: (dateInfo) => {
          currentDate.value = dateInfo.view.currentStart;
          updateCalendarTitle();
        }
      });
      
      console.log('Calendar initialized successfully');
      calendar.value.render();
      updateCalendarTitle();
    } catch (error) {
      console.error('Error initializing calendar:', error);
      message.error('Failed to initialize calendar. Please try again.');
    }
  } else {
    console.error('Calendar element not found');
  }
};

const fetchCalendarEvents = async (startDate, endDate) => {
  try {
    console.log(`Fetching calendar events from ${startDate} to ${endDate} for user ${currentUserId.value}`);
    const response = await internClassStore.fetchScheduleEvents(
      currentUserId.value, 
      startDate,
      endDate
    );
    
    if (!response || response.length === 0) {
      console.log('No events returned from API, using fallback method to generate events');
      return generateEventsFromClasses(startDate, endDate);
    }
    
    console.log('Events received from API:', response);
    const mappedEvents = mapApiEventsToCalendarEvents(response);
    
    // If no TEST events in API response, add test events from store
    if (!mappedEvents.some(event => event.extendedProps.eventType === 'TEST')) {
      console.log('No test events in API response, adding test events from store');
      const testEvents = generateTestEvents(startDate, endDate);
      return [...mappedEvents, ...testEvents];
    }
    
    return mappedEvents;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    message.error('Failed to load calendar events from API, using class data instead');
    return generateEventsFromClasses(startDate, endDate);
  }
};

// Separate function to generate only test events
const generateTestEvents = (startDate, endDate) => {
  const tests = internClassStore.internTests || [];
  if (tests.length === 0) {
    return [];
  }
  
  console.log('Generating test events for calendar:', tests);
  const events = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  tests.forEach(test => {
    // Only include tests that are published/active
    if (!test.isPublished) {
      return;
    }
    
    let testDate;
    
    // If test has a specific date/time, use that
    if (test.scheduledDate) {
      testDate = new Date(test.scheduledDate);
    } else {
      // If no scheduled date, place test in the middle of the range as a placeholder
      // For week view, use middle of the week
      // For month view, use a date around the 15th of the month
      if (viewType.value === 'month') {
        // For month view, place around the 15th
        testDate = new Date(start);
        testDate.setDate(15);
      } else {
        // For week/day view, place in the middle of the view
        testDate = new Date((start.getTime() + end.getTime()) / 2);
      }
      
      // Set a reasonable time - 10 AM
      testDate.setHours(10, 0, 0);
    }
    
    // Only include if test date is within the current range
    if (testDate >= start && testDate <= end) {
      // Create test event
      const durationMinutes = test.durationMinutes || 60; // Default to 1 hour if not specified
      
      events.push({
        id: `test-${test.id}`,
        title: `Test: ${test.title}`,
        start: testDate.toISOString(),
        end: new Date(testDate.getTime() + durationMinutes * 60000).toISOString(),
        allDay: false,
        backgroundColor: '#f50', // Red color for tests
        borderColor: '#f50',
        display: 'block',
        extendedProps: {
          eventType: 'TEST',
          description: test.description || 'Test for ' + (test.className || 'this class'),
          testId: test.id,
          classId: test.classId || (test.lesson && test.lesson.classId),
          status: 'ACTIVE'
        }
      });
    }
  });
  
  console.log(`Generated ${events.length} test events for calendar`);
  return events;
};

// Fallback function to generate events from class data
const generateEventsFromClasses = (startDate, endDate) => {
  console.log('Generating events from class data');
  if (!internClassStore.internClasses || internClassStore.internClasses.length === 0) {
    console.warn('No class data available to generate events');
    return [];
  }
  
  const classes = internClassStore.internClasses;
  console.log('Classes data for event generation:', classes);
  
  const events = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Map of day names to day numbers used by JavaScript Date
  const dayMap = {
    'MONDAY': 1,
    'TUESDAY': 2,
    'WEDNESDAY': 3,
    'THURSDAY': 4,
    'FRIDAY': 5,
    'SATURDAY': 6,
    'SUNDAY': 0
  };
  
  // First add class events
  classes.forEach(classItem => {
    console.log('Processing class for events:', classItem);
    
    // Get scheduleDays from the correct property based on API response structure
    const scheduleDays = classItem.scheduleDays || 
                        (classItem.schedule && classItem.schedule.days) || 
                        [];
    
    // Skip classes without schedule information
    if (!scheduleDays.length) {
      console.log(`Class ${classItem.name} has no schedule days`);
      return;
    }
    
    // Get start and end times from the correct properties
    let startTime = classItem.startTime || 
                   (classItem.schedule && classItem.schedule.startTime) || 
                   '09:00';
    let endTime = classItem.endTime || 
                 (classItem.schedule && classItem.schedule.endTime) || 
                 '11:00';
    
    // Convert from string to time if needed
    if (typeof startTime === 'string' && startTime.includes('T')) {
      startTime = startTime.split('T')[1].substring(0, 5);
    }
    
    if (typeof endTime === 'string' && endTime.includes('T')) {
      endTime = endTime.split('T')[1].substring(0, 5);
    }
    
    console.log(`Class schedule: days=${scheduleDays}, startTime=${startTime}, endTime=${endTime}`);
    
    scheduleDays.forEach(dayString => {
      // Handle different formats of day strings
      let day = dayString;
      if (typeof dayString === 'object' && dayString.name) {
        day = dayString.name;
      }
      
      const dayNum = dayMap[day.toUpperCase()];
      if (dayNum === undefined) {
        console.warn(`Invalid day string: ${day}`);
        return;
      }
      
      // Find all occurrences of this day between start and end dates
      let currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + (dayNum + 7 - currentDate.getDay()) % 7);
      
      while (currentDate <= end) {
        // Parse start and end times
        const startParts = startTime.split(':');
        const startHour = parseInt(startParts[0]);
        const startMinute = parseInt(startParts[1]);
        
        const endParts = endTime.split(':');
        const endHour = parseInt(endParts[0]);
        const endMinute = parseInt(endParts[1]);
        
        // Create event start and end dates
        const eventStart = new Date(currentDate);
        eventStart.setHours(startHour, startMinute, 0);
        
        const eventEnd = new Date(currentDate);
        eventEnd.setHours(endHour, endMinute, 0);
        
        // Create event object
        events.push({
          id: `class-${classItem.id}-${currentDate.toISOString()}`,
          title: classItem.name,
          start: eventStart.toISOString(),
          end: eventEnd.toISOString(),
          allDay: false,
          backgroundColor: getEventColor(classItem.status),
          borderColor: getEventColor(classItem.status),
          display: 'block',
          extendedProps: {
            eventType: 'CLASS',
            description: classItem.description,
            classId: classItem.id,
            status: classItem.status,
            mentor: classItem.mentor ? classItem.mentor.fullname : 'Not assigned'
          }
        });
        
        // Move to next occurrence of this day
        currentDate.setDate(currentDate.getDate() + 7);
      }
    });
  });
  
  // Now add test events
  const testEvents = generateTestEvents(startDate, endDate);
  
  // Combine class and test events
  return [...events, ...testEvents];
};

const mapApiEventsToCalendarEvents = (events) => {
  return events.map(event => ({
    id: event.id.toString(),
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    backgroundColor: getEventColorByType(event),
    borderColor: getEventColorByType(event),
    display: 'block',
    extendedProps: {
      eventType: event.eventType
    }
  }));
};

// Helper function to determine color based on event type
const getEventColorByType = (event) => {
  // Use the status color if available
  if (event.status) {
    return getEventColor(event.status);
  }
  
  // Otherwise determine by event type
  switch (event.eventType) {
    case 'CLASS':
      return '#1890ff'; // Blue for classes
    case 'TEST':
      return '#ff4d4f'; // Red for tests
    case 'ASSIGNMENT':
      return '#52c41a'; // Green for assignments
    case 'OTHER':
      return '#722ed1'; // Purple for other events
    default:
      return '#1890ff'; // Default blue
  }
};

const updateCalendarView = () => {
  if (calendar.value) {
    try {
      console.log(`Changing calendar view to ${getCalendarViewType()}`);
      calendar.value.changeView(getCalendarViewType());
      updateCalendarTitle();
    } catch (error) {
      console.error('Error changing calendar view:', error);
      calendar.value.destroy();
      calendar.value = null;
      initCalendar();
    }
  } else if (calendarEl.value) {
    initCalendar();
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

const getEventColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return '#52c41a';
    case 'PLANNED':
      return '#1890ff';
    case 'COMPLETED':
      return '#8c8c8c';
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

const getClassNameById = (classId) => {
  if (!classId) return 'Unknown';
  const classObj = internClasses.value.find(c => c.id === classId);
  return classObj ? classObj.name : 'Unknown';
};

const formatEventTime = (event) => {
  if (!event || !event.start || !event.end) return 'N/A';
  
  const start = event.start instanceof Date ? event.start : new Date(event.start);
  const end = event.end instanceof Date ? event.end : new Date(event.end);
  
  const dateStr = start.toLocaleDateString();
  const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return `${dateStr}, ${startTimeStr} - ${endTimeStr}`;
};

const formatSchedule = (classItem) => {
  if (!classItem) return 'N/A';
  
  // Format schedule information based on available data
  const scheduleInfo = [];
  
  if (classItem.scheduleInfo) {
    return classItem.scheduleInfo;
  }
  
  if (classItem.startDate) {
    const startDate = new Date(classItem.startDate);
    scheduleInfo.push(`Starts: ${startDate.toLocaleDateString()}`);
  }
  
  if (classItem.endDate) {
    const endDate = new Date(classItem.endDate);
    scheduleInfo.push(`Ends: ${endDate.toLocaleDateString()}`);
  }
  
  if (classItem.schedule) {
    scheduleInfo.push(classItem.schedule);
  }
  
  if (classItem.timeSlot) {
    scheduleInfo.push(classItem.timeSlot);
  }
  
  if (classItem.location) {
    scheduleInfo.push(`Location: ${classItem.location}`);
  }
  
  return scheduleInfo.length > 0 ? scheduleInfo.join(' | ') : 'Schedule information not available';
};

const prevPeriod = () => {
  if (calendar.value) {
    calendar.value.prev();
    updateCalendarTitle();
  }
};

const nextPeriod = () => {
  if (calendar.value) {
    calendar.value.next();
    updateCalendarTitle();
  }
};

const today = () => {
  if (calendar.value) {
    calendar.value.today();
    updateCalendarTitle();
  }
};

// Setup watchers
import { watch } from 'vue';
watch(viewType, () => {
  console.log('View type changed to:', viewType.value);
  // When view type changes, clear the calendar and reload
  if (calendar.value) {
    // Force a complete refresh of the calendar when the view type changes
    console.log('Refreshing calendar with new view type');
    const currentView = calendar.value.view;
    const startDate = currentView.activeStart.toISOString().split('T')[0];
    const endDate = currentView.activeEnd.toISOString().split('T')[0];
    
    // First change the view
    updateCalendarView();
    
    // Then force a refetch of events to ensure test events are properly positioned
    calendar.value.refetchEvents();
  }
});

// Watch for stats view toggle
watch(showStats, async (newVal) => {
  if (newVal) {
    await fetchTestsData();
    // Destroy calendar when switching to stats view
    if (calendar.value) {
      calendar.value.destroy();
      calendar.value = null;
    }
  } else {
    // Need to make sure we have the element before initializing
    // Use nextTick to ensure DOM is updated before we initialize the calendar
    await new Promise(resolve => setTimeout(resolve, 0));
    initCalendar();
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
  height: 100%;
}

.modal-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* FullCalendar Customizations */
.fc-event {
  border-radius: 4px;
  padding: 2px 4px;
  pointer-events: none; /* Disable pointer events on events */
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

/* Display event time more prominently */
.fc-event-time {
  font-weight: bold;
  font-size: 0.9em;
}

/* More space for event content */
.fc-timegrid-event-harness {
  margin-right: 1px;
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