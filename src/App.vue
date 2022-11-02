<script setup>
import { darkTheme } from 'naive-ui'

import Histogram from './components/Histogram.vue'
import PhotoFrame from './components/PhotoFrame.vue'
import PhotoList from './components/PhotoList.vue'
import PerfTimer from './components/PerfTimer.vue'
import ControlPanel from './components/ControlPanel.vue'
</script>

<template>
    <n-config-provider :theme="darkTheme">
        <div class="frame">
            <photo-frame :img="img" @histogram_load="(hd, wi) => { histogram_data = hd; webgl_instance = wi }" />
            <div class="side-panel">
                <histogram :histogram="histogram_data" />
                <control-panel :webgl_instance="webgl_instance" @histogram_load="hd => histogram_data = hd" />
                <perf-timer :timer="timer" />
            </div>
            <photo-list class="photo-list" @raw_decoded="i => img = i" />
        </div>
    </n-config-provider>
</template>

<script>
export default {
    data() {
        return {
            img: null,
            histogram_data: null,
            webgl_instance: null,
            timer: {
                file_to_load: 0,
                file_loaded: 0,
                raw_decoded: 0,
                rendered: 0,
                pixels_read: 0,
                histogram_calced: 0,
            }
        }
    },
    mounted() {
        window.timer = this.timer; // for better accuracy
    }
}
</script>

<style scoped>
.frame {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 272px;
    grid-template-rows: 1fr 128px;
}

.photo-list {
    padding: .5rem;
    grid-area: 2 / 1 / 3 / 3;
}

.side-panel {
    padding: 0.5rem;
}
</style>
