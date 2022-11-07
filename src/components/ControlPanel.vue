<template>
    <div class="container" v-if="webgl_instance">
        white balance {{ shader.white_balance_r.toFixed(3) }} | {{ shader.white_balance_b.toFixed(3) }}
        <o-slider :disabled="show_origin" v-model="shader.white_balance_r" :step="0.001" :min="0" :max="5"
            :tooltip="false" @dblclick="shader.white_balance_r = white_balance[0]" />
        <o-slider :disabled="show_origin" v-model="shader.white_balance_b" :step="0.001" :min="0" :max="5"
            :tooltip="false" @dblclick="shader.white_balance_b = white_balance[2]" />

        gamma {{ shader.gamma }}
        <o-slider :disabled="show_origin" v-model="shader.gamma" :step="0.01" :min="0" :max="10" :tooltip="false"
            @dblclick="shader.gamma = 2.22" />

        exposure {{ shader.exposure }}
        <o-slider :disabled="show_origin" v-model="shader.exposure" :step="0.01" :min="-3" :max="3" :tooltip="false"
            @dblclick="shader.exposure = 0" />

        highlight {{ shader.highlight_point }}
        <o-slider :disabled="show_origin" v-model="shader.highlight_point" :step="0.01" :min="-1" :max="1"
            :tooltip="false" @dblclick="shader.highlight_point = 0" />

        white point {{ shader.white_point }}
        <o-slider :disabled="show_origin" v-model="shader.white_point" :step="0.01" :min="-1" :max="2" :tooltip="false"
            @dblclick="shader.white_point = 0" />

        shadow {{ shader.shadow_point }}
        <o-slider :disabled="show_origin" v-model="shader.shadow_point" :step="0.01" :min="-1" :max="1" :tooltip="false"
            @dblclick="shader.shadow_point = 0" />

        black point {{ shader.black_point }}
        <o-slider :disabled="show_origin" v-model="shader.black_point" :step="0.01" :min="-1" :max="1" :tooltip="false"
            @dblclick="shader.black_point = 0" />

        highlight threshold {{ shader.highlight_threshold }}
        <o-slider :disabled="show_origin" v-model="shader.highlight_threshold" :step="0.01" :min="0" :max="1"
            :tooltip="false" @dblclick="shader.highlight_threshold = 0.75" />

        <o-checkbox v-model="show_origin" variant="transparent">Show origin</o-checkbox>
    </div>
</template>

<script>
import { updateUniform, quickraw, disposeWasm } from "../quickraw";

let timeout = 1;
const lag = 250;

export default {
    props: ['webgl_instance', 'timer', 'white_balance'],
    data() {
        return {
            prevent_shader_update: false,
            show_origin: false,
            mem: null,
            shader: {
                gamma: 2.22,
                exposure: 0,
                white_point: 0,
                black_point: 0,
                highlight_point: 0,
                shadow_point: 0,
                highlight_threshold: 0.75,
                white_balance_r: 1,
                white_balance_b: 1
            },
        }
    },
    methods: {
        setShader(name, value, method) {
            if (this.prevent_shader_update) return;

            timeout = updateUniform(this.webgl_instance, method || 'uniform1f', name, value, pixels => {
                const histogram_data = quickraw.calc_histogram(pixels);
                disposeWasm();
                this.$emit("histogram_load", histogram_data);
            }, timeout, lag);
        },
        resetShader(prevent_shader_update) {
            this.prevent_shader_update = !!prevent_shader_update;

            Object.assign(this.shader, this.$options.data().shader);
            this.shader.white_balance_r = this.white_balance[0];
            this.shader.white_balance_b = this.white_balance[2];

            if (prevent_shader_update) {
                this.$nextTick(() => {
                    this.prevent_shader_update = false;
                });
            }
        }
    },
    watch: {
        show_origin(v) {
            if (v) {
                this.mem = {};
                Object.assign(this.mem, this.shader);
                this.resetShader();
            } else {
                Object.assign(this.shader, this.mem);
                this.mem = null;
            }
        },
        'timer.histogram_calced'() {
            // this is the actual init after each new image loaded
            this.resetShader(true);
        },
        'shader.white_balance_r'(v) {
            this.setShader('white_balance', [v, 1.0, this.shader.white_balance_b], 'uniform3fv');
        },
        'shader.white_balance_b'(v) {
            this.setShader('white_balance', [this.shader.white_balance_r, 1.0, v], 'uniform3fv');
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