// Mock data for development and testing
import dayjs from 'dayjs';

// Mock data for Classes
export const mockClasses = [
  {
    id: 1,
    name: "Web Development Fundamentals",
    status: "ACTIVE",
    description: "Introduction to HTML, CSS, and JavaScript for beginners.",
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().add(60, 'day').format('YYYY-MM-DD'),
    scheduleDays: ["Monday", "Wednesday", "Friday"],
    startTime: "09:00",
    endTime: "11:30",
    mentor: {
      id: 101,
      fullname: "John Doe",
      email: "john.doe@example.com"
    },
    internsCount: 12
  },
  {
    id: 2,
    name: "Advanced React Development",
    status: "ACTIVE",
    description: "Deep dive into React hooks, context API, and state management.",
    startDate: dayjs().subtract(15, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().add(75, 'day').format('YYYY-MM-DD'),
    scheduleDays: ["Tuesday", "Thursday"],
    startTime: "13:00",
    endTime: "16:00",
    mentor: {
      id: 102,
      fullname: "Jane Smith",
      email: "jane.smith@example.com"
    },
    internsCount: 8
  },
  {
    id: 3,
    name: "Backend Development with Node.js",
    status: "PLANNED",
    description: "Creating RESTful APIs with Express and MongoDB.",
    startDate: dayjs().add(15, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().add(105, 'day').format('YYYY-MM-DD'),
    scheduleDays: ["Monday", "Wednesday"],
    startTime: "14:00",
    endTime: "17:00",
    mentor: null,
    internsCount: 0
  },
  {
    id: 4,
    name: "Vue.js Masterclass",
    status: "COMPLETED",
    description: "Complete guide to Vue.js framework including Vuex and Vue Router.",
    startDate: dayjs().subtract(120, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    scheduleDays: ["Tuesday", "Thursday", "Friday"],
    startTime: "09:30",
    endTime: "12:30",
    mentor: {
      id: 103,
      fullname: "Michael Johnson",
      email: "michael.j@example.com"
    },
    internsCount: 15
  },
  {
    id: 5,
    name: "Database Design & SQL",
    status: "ACTIVE",
    description: "Learn database modeling, SQL queries, and database optimization.",
    startDate: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().add(50, 'day').format('YYYY-MM-DD'),
    scheduleDays: ["Monday", "Friday"],
    startTime: "10:00",
    endTime: "13:00",
    mentor: {
      id: 104,
      fullname: "Sarah Williams",
      email: "sarah.w@example.com"
    },
    internsCount: 10
  }
];

// Mock data for Mentors
export const mockMentors = [
  {
    id: 101,
    fullname: "John Doe",
    email: "john.doe@example.com",
    expertise: ["JavaScript", "React", "Node.js"],
    yearsOfExperience: 5
  },
  {
    id: 102,
    fullname: "Jane Smith",
    email: "jane.smith@example.com",
    expertise: ["React", "Redux", "TypeScript"],
    yearsOfExperience: 7
  },
  {
    id: 103,
    fullname: "Michael Johnson",
    email: "michael.j@example.com",
    expertise: ["Vue.js", "Angular", "Frontend Development"],
    yearsOfExperience: 6
  },
  {
    id: 104,
    fullname: "Sarah Williams",
    email: "sarah.w@example.com",
    expertise: ["SQL", "Database Design", "MongoDB"],
    yearsOfExperience: 8
  },
  {
    id: 105,
    fullname: "Robert Brown",
    email: "robert.b@example.com",
    expertise: ["DevOps", "AWS", "Docker"],
    yearsOfExperience: 4
  }
];

// Mock data for Interns
export const mockInterns = [
  {
    id: 201,
    fullname: "Alex Johnson",
    email: "alex.j@example.com",
    university: "MIT",
    graduationYear: 2023
  },
  {
    id: 202,
    fullname: "Emily Chen",
    email: "emily.c@example.com",
    university: "Stanford",
    graduationYear: 2024
  },
  {
    id: 203,
    fullname: "David Park",
    email: "david.p@example.com",
    university: "UC Berkeley",
    graduationYear: 2023
  },
  {
    id: 204,
    fullname: "Sophia Rodriguez",
    email: "sophia.r@example.com",
    university: "Harvard",
    graduationYear: 2024
  },
  {
    id: 205,
    fullname: "James Kim",
    email: "james.k@example.com",
    university: "UCLA",
    graduationYear: 2023
  }
];

// Mock data for tests within classes
export const mockTests = [
  {
    id: 301,
    classId: 1,
    title: "HTML & CSS Basics",
    description: "Test covering fundamental HTML elements and CSS selectors",
    date: dayjs().subtract(15, 'day').format('YYYY-MM-DD'),
    totalPoints: 100,
    passingScore: 70,
    duration: 60 // minutes
  },
  {
    id: 302,
    classId: 1,
    title: "JavaScript Fundamentals",
    description: "Core concepts of JavaScript including variables, functions, and objects",
    date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    totalPoints: 100,
    passingScore: 60,
    duration: 90
  },
  {
    id: 303,
    classId: 1,
    title: "DOM Manipulation",
    description: "Working with the Document Object Model in JavaScript",
    date: dayjs().add(10, 'day').format('YYYY-MM-DD'),
    totalPoints: 100,
    passingScore: 65,
    duration: 75
  },
  {
    id: 304,
    classId: 2,
    title: "React Component Lifecycle",
    description: "Understanding component mounting, updating, and unmounting",
    date: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
    totalPoints: 100,
    passingScore: 70,
    duration: 90
  },
  {
    id: 305,
    classId: 2,
    title: "React Hooks",
    description: "Using useState, useEffect, and custom hooks",
    date: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    totalPoints: 100,
    passingScore: 75,
    duration: 90
  }
];

// Mock data for class interns (assignments)
export const mockClassInterns = [
  // Web Development Fundamentals class
  { id: 401, classId: 1, internId: 201, joinDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD') },
  { id: 402, classId: 1, internId: 202, joinDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD') },
  { id: 403, classId: 1, internId: 203, joinDate: dayjs().subtract(28, 'day').format('YYYY-MM-DD') },
  
  // Advanced React Development class
  { id: 404, classId: 2, internId: 201, joinDate: dayjs().subtract(15, 'day').format('YYYY-MM-DD') },
  { id: 405, classId: 2, internId: 204, joinDate: dayjs().subtract(15, 'day').format('YYYY-MM-DD') },
  { id: 406, classId: 2, internId: 205, joinDate: dayjs().subtract(14, 'day').format('YYYY-MM-DD') },
  
  // Database Design & SQL class
  { id: 407, classId: 5, internId: 202, joinDate: dayjs().subtract(10, 'day').format('YYYY-MM-DD') },
  { id: 408, classId: 5, internId: 203, joinDate: dayjs().subtract(10, 'day').format('YYYY-MM-DD') },
  { id: 409, classId: 5, internId: 205, joinDate: dayjs().subtract(8, 'day').format('YYYY-MM-DD') }
];

// Mock data for test results
export const mockTestResults = [
  // Test results for HTML & CSS Basics
  {
    id: 501,
    testId: 301,
    internId: 201,
    score: 85,
    submissionDate: dayjs().subtract(15, 'day').format('YYYY-MM-DD'),
    status: 'PASSED'
  },
  {
    id: 502,
    testId: 301,
    internId: 202,
    score: 92,
    submissionDate: dayjs().subtract(15, 'day').format('YYYY-MM-DD'),
    status: 'PASSED'
  },
  {
    id: 503,
    testId: 301,
    internId: 203,
    score: 68,
    submissionDate: dayjs().subtract(15, 'day').format('YYYY-MM-DD'),
    status: 'FAILED'
  },
  
  // Test results for JavaScript Fundamentals
  {
    id: 504,
    testId: 302,
    internId: 201,
    score: 78,
    submissionDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    status: 'PASSED'
  },
  {
    id: 505,
    testId: 302,
    internId: 202,
    score: 88,
    submissionDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    status: 'PASSED'
  },
  {
    id: 506,
    testId: 302,
    internId: 203,
    score: 75,
    submissionDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    status: 'PASSED'
  },
  
  // Test results for React Component Lifecycle
  {
    id: 507,
    testId: 304,
    internId: 201,
    score: 82,
    submissionDate: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
    status: 'PASSED'
  },
  {
    id: 508,
    testId: 304,
    internId: 204,
    score: 95,
    submissionDate: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
    status: 'PASSED'
  },
  {
    id: 509,
    testId: 304,
    internId: 205,
    score: 65,
    submissionDate: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
    status: 'FAILED'
  }
];

// Mock class statistics (for charts and analysis)
export const mockClassStatistics = {
  1: { // Web Development Fundamentals
    testAvgScores: [
      { testName: "HTML & CSS Basics", avgScore: 81.7 },
      { testName: "JavaScript Fundamentals", avgScore: 80.3 }
    ],
    passingRate: 83.3, // percentage
    attendanceRate: 92.1, // percentage
    testCompletionRate: 100, // percentage
    scoreDistribution: {
      '<60': 1,
      '60-70': 1,
      '71-80': 2,
      '81-90': 2,
      '91-100': 1
    }
  },
  2: { // Advanced React Development
    testAvgScores: [
      { testName: "React Component Lifecycle", avgScore: 80.7 }
    ],
    passingRate: 66.7, // percentage
    attendanceRate: 88.5, // percentage
    testCompletionRate: 100, // percentage
    scoreDistribution: {
      '<60': 0,
      '60-70': 1,
      '71-80': 0,
      '81-90': 1,
      '91-100': 1
    }
  },
  5: { // Database Design & SQL
    testAvgScores: [],
    passingRate: 0, // No tests yet
    attendanceRate: 95.0, // percentage
    testCompletionRate: 0, // percentage
    scoreDistribution: {
      '<60': 0,
      '60-70': 0,
      '71-80': 0,
      '81-90': 0,
      '91-100': 0
    }
  }
};
