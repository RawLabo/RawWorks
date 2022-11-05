<template>
    <div class="container" v-if="webgl_instance">
        gamma {{ shader.gamma }}
        <o-slider v-model="shader.gamma" :step="0.01" :min="0" :max="10" :tooltip="false"
            @dblclick="shader.gamma = 2.22" />
        exposure {{ shader.exposure }}
        <o-slider v-model="shader.exposure" :step="0.01" :min="-3" :max="3" :tooltip="false"
            @dblclick="shader.exposure = 0" />
        white point {{ shader.white_point }}
        <o-slider v-model="shader.white_point" :step="0.01" :min="-1" :max="1.5" :tooltip="false"
            @dblclick="shader.white_point = 0" />
        black point {{ shader.black_point }}
        <o-slider v-model="shader.black_point" :step="0.01" :min="-1" :max="1" :tooltip="false"
            @dblclick="shader.black_point = 0" />
        highlight {{ shader.highlight_point }}
        <o-slider v-model="shader.highlight_point" :step="0.01" :min="-1" :max="1" :tooltip="false"
            @dblclick="shader.highlight_point = 0" />
        shadow {{ shader.shadow_point }}
        <o-slider v-model="shader.shadow_point" :step="0.01" :min="-1" :max="1" :tooltip="false"
            @dblclick="shader.shadow_point = 0" />
        highlight threshold {{ shader.highlight_threshold }}
        <o-slider v-model="shader.highlight_threshold" :step="0.01" :min="0" :max="1" :tooltip="false"
            @dblclick="shader.highlight_threshold = 0.75" />
        <o-checkbox v-model="show_origin" variant="transparent">Show origin</o-checkbox>
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
            prevent_shader_upadte: false,
            show_origin: false,
            mem: null,
            shader: {
                gamma: 2.22,
                exposure: 0,
                white_point: 0,
                black_point: 0,
                highlight_point: 0,
                shadow_point: 0,
                highlight_threshold: 0.75
            },
        }
    },
    methods: {
        setShader(name, value) {
            if (this.prevent_shader_upadte) return;

            timeout = updateUniform(this.webgl_instance, 'uniform1f', name, value, pixels => {
                const histogram_data = quickraw.calc_histogram(pixels);
                disposeWasm();
                this.$emit("histogram_load", histogram_data);
            }, timeout, lag);
        },
    },
    watch: {
        show_origin(v) {
            if (v) {
                this.mem = {};
                Object.assign(this.mem, this.shader);
                Object.assign(this.shader, this.$options.data().shader);
            } else {
                Object.assign(this.shader, this.mem);
                this.mem = null;
            }
        },
        'timer.histogram_calced'() {
            this.prevent_shader_upadte = true;
            Object.assign(this.shader, this.$options.data().shader);
            this.$nextTick(() => {
                this.prevent_shader_upadte = false;
            });
        },
        'shader.exposure'(v) {
            this.setShader('exposure', v);
        },
        'shader.gamma'(v) {
            this.setShader('gamma', 1 / v);
        },
        'shader.white_point'(v) {
            this.setShader('white_point', v);
        },
        'shader.black_point'(v) {
            this.setShader('black_point', v);
        },
        'shader.highlight_point'(v) {
            this.setShader('highlight_point', v);
        },
        'shader.shadow_point'(v) {
            this.setShader('shadow_point', v);
        },
        'shader.highlight_threshold'(v) {
            this.setShader('highlight_threshold', v);
        },
    }
}
</script>
<style scoped>
.container {
    margin-bottom: .5rem;
}

.o-slide {
    margin: 0.5rem 0;
}
</style>