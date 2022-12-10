<script setup>
import Histogram from './components/Histogram.vue'
import PhotoFrame from './components/PhotoFrame.vue'
import PhotoList from './components/PhotoList.vue'
import PerfTimer from './components/PerfTimer.vue'
import ControlPanel from './components/ControlPanel.vue'
</script>

<template>
    <div class="body-wrapper">
        <div class="frames" :style="{ 'grid-template-columns': `repeat(${grid_cols}, 1fr)` }">
            <photo-frame :filename="filename" :img="img"
                @histogram_load="(hd, wi) => { histogram_data = hd; webgl_instance = wi }" />
        </div>
        <div class="side-panel">
            <histogram :histogram="histogram_data" />
            <control-panel :white_balance="white_balance" :timer="timer" :webgl_instance="webgl_instance"
                @histogram_load="hd => histogram_data = hd" @change_demosaicing="$refs.photo_lst_comp.loadImage()" />
            <perf-timer :timer="timer" />
            <div class="app-info">{{ app_info }}</div>
        </div>
        <photo-list ref="photo_lst_comp" class="photo-list" @prepare="prepare"
            @raw_decoded="(i, name) => { img = i; filename = name; }" />
    </div>
</template>

<script>
export default {
    data() {
        return {
            app_info: __APP_INFO__,
            grid_cols: 1,
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
    methods: {
        prepare() {
            this.img = null;
            this.histogram_data = null;
            this.webgl_instance = null;
        },
    },
    watch: {
        img(v) {
            if (v)
                this.white_balance = [].slice.call(v.white_balance);
            else
                this.white_balance = [];
        }
    },
    mounted() {
        window.timer = this.timer; // for better accuracy
    }
}
</script>

<style scoped>
.body-wrapper {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 272px;
    grid-template-rows: 1fr auto;
}

.frames {
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: grid;
}

.photo-list {
    grid-area: auto / 1 / auto / 3;
}

.side-panel {
    padding: 0.5rem;
    overflow-y: scroll;
    overflow-x: hidden;
}

.app-info {
    color: #444;
    padding-left: 0.1rem;
}
</style>
