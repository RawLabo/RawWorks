<script setup>
import Histogram from './components/Histogram.vue'
import PhotoFrame from './components/PhotoFrame.vue'
import PhotoList from './components/PhotoList.vue'
import PerfTimer from './components/PerfTimer.vue'
import ControlPanel from './components/ControlPanel.vue'
</script>

<template>
    <div class="frame">
        <photo-frame :filename="filename" :img="img" @histogram_load="(hd, wi) => { histogram_data = hd; webgl_instance = wi }" />
        <div class="side-panel">
            <photo-list class="photo-list" @raw_decoded="(i, name) => {img = i; filename = name;}" />
            <histogram :histogram="histogram_data" />
            <control-panel :white_balance="white_balance" :timer="timer" :webgl_instance="webgl_instance"
                @histogram_load="hd => histogram_data = hd" />
            <perf-timer :timer="timer" />
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            filename: '',
            img: null,
            white_balance: [],
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
    watch: {
        img(v) {
            this.white_balance = [].slice.call(v.wb);
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
    grid-template-rows: 1fr;
}

.photo-list {
    padding: .5rem;
}

.side-panel {
    padding: 0.5rem;
    overflow-y: scroll;
    overflow-x: hidden;
}
</style>
