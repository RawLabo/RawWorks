import { createApp } from 'vue'
import './global.css'
import App from './App.vue'

window.isSafari = navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') == -1;

window.settings = {
    better_demosaicing: false
};

const app = createApp(App);

import { OSlider, OCheckbox, OButton } from '@oruga-ui/oruga-next';
import '@oruga-ui/oruga-next/dist/oruga-full.css';

app
    .component('OButton', OButton)
    .component('OSlider', OSlider)
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
            if (e.data.err) {
                const additional_err = e.data.err.toString().indexOf('unreachable') > -1 ? '\nThis raw file is not yet supported.' : '';
                alert(e.data.err + additional_err);
                jobs[e.data.id].reject(e.data.err);
            } else {
                jobs[e.data.id].resolve(e.data.result);
            }

            delete jobs[e.data.id];
        }
    };

    window.sendToWorker = (method, ...args) => {
        worker.postMessage({
            id: ++id,
            method,
            args
        });

        return new Promise((resolve, reject) => {
            jobs[id] = {resolve, reject};
        });
    };
})();


window.onbeforeunload = (e) => {
    e.preventDefault();
    return e.returnValue = "Are you sure you leave this App?";
}