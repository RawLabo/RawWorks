import { createApp } from 'vue'
import './global.css'
import App from './App.vue'

import { NButton, NSlider, NConfigProvider, NUpload, NUploadDragger } from 'naive-ui';

const app = createApp(App);

app
    .component('NUpload', NUpload)
    .component('NSlider', NSlider)
    .component('NUploadDragger', NUploadDragger)
    .component('NConfigProvider', NConfigProvider)
    .component('NButton', NButton);

app.mount('#app');