<template>
    <div class="container" v-if="webgl_instance">
        gamma {{ gamma }}
        <o-slider v-model="gamma" :step="0.01" :min="0" :max="10" :tooltip="false" />
        exposure {{ exposure }}
        <o-slider v-model="exposure" :step="0.01" :min="-3" :max="3" :tooltip="false" />
        white point {{ white_point }}
        <o-slider v-model="white_point" :step="0.01" :min="-1" :max="1.5" :tooltip="false" />
        black point {{ black_point }}
        <o-slider v-model="black_point" :step="0.01" :min="-1" :max="1" :tooltip="false" />
        highlight {{ highlight_point }}
        <o-slider v-model="highlight_point" :step="0.01" :min="-1" :max="1" :tooltip="false" />
        shadow {{ shadow_point }}
        <o-slider v-model="shadow_point" :step="0.01" :min="-1" :max="1" :tooltip="false" />
        highlight threshold {{ highlight_threshold }}
        <o-slider v-model="highlight_threshold" :step="0.01" :min="0" :max="1" :tooltip="false" />
    </div>
</template>

<script>
import { updateUniform, quickraw, disposeWasm } from "../quickraw";

let timeout = 1;
const lag = 250;

export default {
    props: ['webgl_instance', 'timer'],
    data() {
        return {
            is_reset: false,
            gamma: 2.22,
            exposure: 0,
            white_point: 0,
            black_point: 0,
            highlight_point: 0,
            shadow_point: 0,
            highlight_threshold: 0.75
        }
    },
    methods: {
        setShader(name, value) {
            if (this.is_reset) return;

            timeout = updateUniform(this.webgl_instance, 'uniform1f', name, value, pixels => {
                const histogram_data = quickraw.calc_histogram(pixels);
                disposeWasm();
                this.$emit("histogram_load", histogram_data);
            }, timeout, lag);
        }
    },
    watch: {
        'timer.histogram_calced'() {
            this.is_reset = true;
            this.gamma = 2.22;
            this.exposure = 0;
            this.white_point = 0;
            this.black_point = 0;
            this.highlight_point = 0;
            this.shadow_point = 0;
            this.highlight_threshold = 0.75;
            this.$nextTick(() => {
                this.is_reset = false;
            });
        },
        exposure(v) {
            this.setShader('exposure', v);
        },
        gamma(v) {
            this.setShader('gamma', 1/ v);
        },
        white_point(v) {
            this.setShader('white_point', v);
        },
        black_point(v) {
            this.setShader('black_point', v);
        },
        highlight_point(v) {
            this.setShader('highlight_point', v);
        },
        shadow_point(v) {
            this.setShader('shadow_point', v);
        },
        highlight_threshold(v) {
            this.setShader('highlight_threshold', v);
        },
    }
}
</script>
<style scoped>
.container {
    margin-bottom: .5rem;
}
</style>