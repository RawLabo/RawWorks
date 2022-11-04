import { createApp } from 'vue'
import './global.css'
import App from './App.vue'

const app = createApp(App);

import { OSlider, OUpload } from '@oruga-ui/oruga-next';
import '@oruga-ui/oruga-next/dist/oruga-full.css';

app.component('OSlider', OSlider).component('OUpload', OUpload);

app.mount('#app');