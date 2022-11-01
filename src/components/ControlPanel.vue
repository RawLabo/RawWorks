<script setup>
import { ref } from 'vue';

defineProps(['webgl_instance']);
defineEmits(['histogram_load']);

const gamma = ref(2.22)
</script>

<template>
    <div class="container" v-if="webgl_instance">
        gamma {{ gamma }}
        <n-slider v-model:value="gamma" :step="0.01" :min="0" :max="10" :tooltip="false" />
    </div>
</template>

<script>
let timeout = 1
const lag = 300

import { updateUniform, quickraw } from "../quickraw";
export default {
    watch: {
        gamma(v) {
            timeout = updateUniform(this.webgl_instance, 'uniform1f', 'gamma', 1 / v, pixels => {
                const histogram_data = quickraw.calc_histogram(pixels);
                this.$emit("histogram_load", histogram_data);
            }, timeout, lag);
        }
    }
}
</script>
<style scoped>
.container {
    margin-bottom: .5rem;
    /* margin: .5rem 0; */
    /* padding: .3rem 1rem .5rem; */
}
</style>