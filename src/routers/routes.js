import Login from '@/pages/Login.vue';
import PAGES from '@/constants/pages';
import NotFound from '@/components/NotFound.vue';
import ForgotPassword from '@/pages/ForgotPassword.vue';
import ResetPassword from '@/pages/ResetPassword.vue';
import Account from '@/pages/Account.vue';
import Intern from '@/pages/Intern.vue';
import Mentor from '@/pages/Mentor.vue';
import Task from '@/pages/Task.vue';
import Document from '@/pages/Document.vue';
import Project from '@/pages/Project.vue';
import ChangePassword from '@/pages/ChangePassword.vue';
import RecruitEdu from '@/pages/RecruitEdu.vue';
import RecruitmentDetail from '@/pages/RecruitmentDetail.vue';
import { useAuthStore } from '@/stores/authStore';
import { createRouter, createWebHistory } from 'vue-router';
import ProjectDetail from '@/pages/ProjectDetail.vue';
import ProjectTransfer from '@/pages/ProjectTransfer.vue';
import TaskDetail from '@/pages/intern/TaskDetail.vue';
import TaskDetailMentor from '@/pages/mentor/TaskDetailMentor.vue';
import TabPage from '@/pages/TabPage.vue';
import Feedback from '@/components/Feedback.vue';
// import Evaluation from '@/components/Evaluation.vue';
import Evaluation from '@/pages/Evaluation.vue';
import Intern2 from "@/pages/mentor/Intern2.vue";
import Task2 from "@/pages/intern/Task2.vue";
import EvaluationDetail from "@/pages/EvaluationDetail.vue";

const routes = [
  { path: PAGES.LOGIN, component: Login },
  { path: PAGES.FORGOT_PASSWORD, component: ForgotPassword },
  { path: PAGES.RESET_PASSWORD, component: ResetPassword },
  { path: PAGES.CHANGE_PASSWORD, component: ChangePassword },

  {
    path: '/:catchAll(.*)',
    component: NotFound,
  },

  {
    path: '/account',
    name: 'Account',
    component: Account,
  },
  {
    path: '/mentor/intern',
    name: 'Intern2',
    component: Intern2,
  },
  {
    path: '/intern/task',
    name: 'Task2',
    component: Task2,
  },
  {
    path: '/intern/task/:id',
    name: 'Task3',
    component: TaskDetail,
  },
  {
    path: '/mentor/task/:id',
    name: 'TaskDetailMentor',
    component: TaskDetailMentor,
  },
  {
    path: '/intern',
    name: 'Intern',
    component: Intern,
  },
  {
    path: '/mentor',
    name: 'Mentor',
    component: Mentor,
  },
  {
    path: '/document',
    name: 'Document',
    component: Document,
  },
  {
    path: '/task',
    name: 'Task',
    component: Task,
  },
  {
    path: '/evaluation',
    name: 'Evaluation',
    component: Evaluation,
  },
  {
    path: '/evaluation/:id',
    name: 'EvaluationDetail',
    component: EvaluationDetail,
  },
  {
    path: '/project',
    component: Project,
  },
  {
    path: '/recruit-edu',
    component: RecruitEdu,
  },
  {
    path: '/recruitment-detail/:id',
    name: 'RecruitmentDetail',
    component: RecruitmentDetail,
  },
  {
    path: '/project-detail/:id',
    name: 'ProjectDetail',
    component: ProjectDetail,
  },
  {
    path: '/task-detail/:id',
    name: 'TaskDetail',
    component: TaskDetail,
  },
  {
    path: '/project-transfer',
    name: 'ProjectTransfer',
    component: ProjectTransfer,
  },
  // {
  //   path: '/evaluation',
  //   name: 'Evaluation',
  //   component: TabPage,
  //   children: [
  //     {
  //       path: 'eva-edu',
  //       name: 'evaluation',
  //       component: Evaluation,
  //     },
  //     {
  //       path: 'eva-feedback',
  //       name: 'feedback',
  //       component: Feedback,
  //     },
  //   ],
  // },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (
    !authStore.isAuthenticated &&
    to.path !== PAGES.LOGIN &&
    to.path !== PAGES.FORGOT_PASSWORD &&
    to.path != PAGES.RESET_PASSWORD
  ) {
    next(PAGES.LOGIN);
  } else {
    next();
  }
});

export default router;
