import Login from '@/pages/share/Login.vue';
import PAGES from '@/constants/pages';
import NotFound from '@/components/NotFound.vue';
import ForgotPassword from '@/pages/share/ForgotPassword.vue';
import ResetPassword from '@/pages/share/ResetPassword.vue';
import Account from '@/pages/admin/Account.vue';
import Intern from '@/pages/admin/Intern.vue';
import Mentor from '@/pages/admin/Mentor.vue';
import Task from '@/pages/admin/Task.vue';
import ChangePassword from '@/pages/share/ChangePassword.vue';
import {useAuthStore} from '@/stores/authStore';
import {createRouter, createWebHistory} from 'vue-router';
import TaskDetail from '@/pages/intern/TaskDetail.vue';
import TaskDetailMentor from '@/pages/mentor/TaskDetailMentor.vue';
import TaskDetailAdmin from '@/pages/admin/TaskDetailAdmin.vue';
import Evaluation from '@/pages/share/Evaluation.vue';
import Intern2 from "@/pages/mentor/Intern2.vue";
import Task2 from "@/pages/intern/Task2.vue";
import TaskMentor from "@/pages/mentor/TaskMentor.vue";
import EvaluationDetail from "@/pages/share/EvaluationDetail.vue";
import Mentor2 from "@/pages/intern/Mentor2.vue";
import AdminIntern from "@/pages/intern/AdminIntern.vue";
import {getCurrentUserRole} from "@/util/Functions.js";

const routes = [
    {path: PAGES.LOGIN, component: Login},
    {path: PAGES.FORGOT_PASSWORD, component: ForgotPassword},
    {path: PAGES.RESET_PASSWORD, component: ResetPassword},
    {path: PAGES.CHANGE_PASSWORD, component: ChangePassword},
    {
        path: '/:catchAll(.*)',
        component: NotFound,
    },
    {
        path: '/mentor',
        children: [
            {
                path: 'admin',
                component: AdminIntern,
            },
            {
                path: 'intern',
                component: Intern2,
            },
            {
                path: 'task',
                component: TaskMentor,
            },
            {
                path: 'task/:id',
                component: TaskDetailMentor,
            },
            {
                path: 'evaluation',
                component: Evaluation,
            },
            {
                path: 'evaluation/:id',
                name: 'MentorEvaluationDetail',
                component: EvaluationDetail,
            }
        ]
    },
    {
        path: '/admin',
        children: [
            {
                path: 'account',
                component: Account,
            },
            {
                path: 'intern',
                component: Intern,
            },
            {
                path: 'mentor',
                component: Mentor,
            },
            {
                path: 'task',
                component: Task,
            },
            {
                path: 'task/:id',
                component: TaskDetailAdmin,
            },
            {
                path: 'evaluation',
                component: Evaluation,
            },
            {
                path: 'evaluation/:id',
                component: EvaluationDetail,
            }
        ]
    },
    {
        path: '/intern',
        children: [
            {
                path: 'mentor',
                component: Mentor2,
            },
            {
                path: 'admin',
                component: AdminIntern,
            },
            {
                path: 'task',
                component: Task2,
            },
            {
                path: 'task/:id',
                component: TaskDetail,
            },
            {
                path: 'evaluation',
                component: EvaluationDetail,
            }
        ]
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const publicRoutes = [PAGES.LOGIN, PAGES.FORGOT_PASSWORD, PAGES.RESET_PASSWORD];

     if (publicRoutes.includes(to.path)) {
        next()
    } else if (!authStore.isAuthenticated && !publicRoutes.includes(to.path)) {
        next(PAGES.LOGIN);
    } else if (authStore.isAuthenticated && !publicRoutes.includes(to.path) && !to.path.startsWith(`/${getCurrentUserRole().toLowerCase()}`) && !to.path.startsWith("/intern")) {
        authStore.logout();
        next(PAGES.LOGIN);
    } else {
        next();
    }
});

export default router;
