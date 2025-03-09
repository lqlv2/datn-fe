import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedState from 'pinia-plugin-persistedstate';
import App from './App.vue';
import Antd from 'ant-design-vue';
import '@ant-design/icons'; 
import router from './routers/routes';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);
app.use(pinia).use(router).use(Antd).mount('#app');
