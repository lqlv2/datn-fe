import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
import App from './App.vue';
import Antd from 'ant-design-vue';
import '@ant-design/icons'; 
import router from './routers/routes';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
const app = createApp(App);
import moment from 'moment';
import 'moment/locale/zh-cn'; // or your preferred locale
moment.locale('zh-cn');
const pinia = createPinia();
pinia.use(piniaPluginPersistedState);
app.use(pinia).use(router).use(Antd).mount('#app');
app.component('QuillEditor', QuillEditor)