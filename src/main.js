import { createApp } from 'vue'
import './global.css'
import App from './App.vue'

const app = createApp(App);

import { OSlider, OUpload, OCheckbox, OButton } from '@oruga-ui/oruga-next';
import '@oruga-ui/oruga-next/dist/oruga-full.css';

app
    .component('OButton', OButton)
    .component('OSlider', OSlider)
    .component('OUpload', OUpload)
    .component('OCheckbox', OCheckbox);

app.mount('#app');

(() => {
    // setup web worker
    const worker = new Worker(new URL('./quickraw/worker.js', import.meta.url), {
        type: 'module'
    });

    let id = 0;
    const jobs = {};
    worker.onmessage = (e) => {
        if (e.data.id in jobs) {
            jobs[e.data.id](e.data.result);
            delete jobs[e.data.id];
        }
    };

    window.sendToWorker = ([method, transfer_lst], ...args) => {
        worker.postMessage({
            id: ++id,
            method,
            args
        }, transfer_lst);

        return new Promise(resolve => {
            jobs[id] = resolve;
        });
    };
})();