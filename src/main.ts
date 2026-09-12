import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Bootstrap 5 & Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

const app = createApp(App);
app.use(router);
app.mount('#app');
