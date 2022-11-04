<template>
    <div class="container" v-if="webgl_instance">
        gamma {{ gamma }}
        <o-slider v-model="gamma" :step="0.01" :min="0" :max="10" :tooltip="false" />
        exposure {{ exposure }}
        <o-slider v-model="exposure" :step="0.01" :min="-3" :max="3" :tooltip="false" />
        white point {{ white_point }}
        <o-slider v-model="white_point" :step="0.01" :min="-1" :max="1" :tooltip="false" />
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
        }
    },
    watch: {
        'timer.histogram_calced'() {
            this.is_reset = true;
            this.gamma = 2.22;
            this.exposure = 0;
            this.white_point = 0;
            this.$nextTick(() => {
                this.is_reset = false;
            });
        },
        exposure(v) {
            if (this.is_reset) return;

            timeout = updateUniform(this.webgl_instance, 'uniform1f', 'exposure', v, pixels => {
                const histogram_data = quickraw.calc_histogram(pixels);
                disposeWasm();
                this.$emit("histogram_load", histogram_data);
            }, timeout, lag);
        },
        gamma(v) {
            if (this.is_reset) return;

            timeout = updateUniform(this.webgl_instance, 'uniform1f', 'gamma', 1 / v, pixels => {
                const histogram_data = quickraw.calc_histogram(pixels);
                disposeWasm();
                this.$emit("histogram_load", histogram_data);
            }, timeout, lag);
        },
        white_point(v) {
            if (this.is_reset) return;

            timeout = updateUniform(this.webgl_instance, 'uniform1f', 'white_point', v, pixels => {
                const histogram_data = quickraw.calc_histogram(pixels);
                disposeWasm();
                this.$emit("histogram_load", histogram_data);
            }, timeout, lag);
        }
    }
}
</script>
<style scoped>
.container {
    margin-bottom: .5rem;
}
</style>