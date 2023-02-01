<template>
    <div class="container" v-if="webgl_instance">

        <label>Gamma {{ shader.gamma }}</label>
        <o-slider :disabled="show_origin" v-model="shader.gamma" :step="0.01" :min="0" :max="10" :tooltip="false"
            @dblclick="shader.gamma = 2.22" />

        <label>White point {{ shader.white_point }}</label>
        <o-slider :disabled="show_origin" v-model="shader.white_point" :step="0.001" :min="-1" :max="1" :tooltip="false"
            @dblclick="shader.white_point = 0" />

        <label>Black point {{ shader.black_point }}</label>
        <o-slider :disabled="show_origin" v-model="shader.black_point" :step="0.001" :min="-1" :max="1" :tooltip="false"
            @dblclick="shader.black_point = 0" />

        <label>Highlight {{ shader.highlight_point }}</label>
        <o-slider :disabled="show_origin" v-model="shader.highlight_point" :step="0.01" :min="-1" :max="1"
            :tooltip="false" @dblclick="shader.highlight_point = 0" />

        <label>Shadow {{ shader.shadow_point }}</label>
        <o-slider :disabled="show_origin" v-model="shader.shadow_point" :step="0.01" :min="-1" :max="1" :tooltip="false"
            @dblclick="shader.shadow_point = 0" />

        <label>Vibrance {{ shader.vibrance }}</label>
        <o-slider :disabled="show_origin" v-model="shader.vibrance" :step="0.01" :min="-1" :max="1" :tooltip="false"
            @dblclick="shader.vibrance = 0" />

        <label>White balance {{ shader.white_balance[0].toFixed(3) }} | {{ shader.white_balance[2].toFixed(3) }}</label>
        <o-slider :disabled="show_origin" v-model="shader.white_balance[0]" :step="0.001" :min="0" :max="5"
            :tooltip="false" @dblclick="shader.white_balance[0] = white_balance[0]" />
        <o-slider :disabled="show_origin" v-model="shader.white_balance[2]" :step="0.001" :min="0" :max="5"
            :tooltip="false" @dblclick="shader.white_balance[2] = white_balance[2]" />

        <label>ColorMatrix Red Δ {{ (shader.color_matrix[0] + shader.color_matrix[1] +
        shader.color_matrix[2]).toFixed(3) }}</label>
        <div class="field-wrapper">
            <label>Red {{ shader.color_matrix[0].toFixed(3) }}</label>
            <div class="flex">
                <span class="color cyan"></span>
                <o-slider :disabled="show_origin" v-model="shader.color_matrix[0]" :step="0.01" :min="-3" :max="3"
                    :tooltip="false" @dblclick="shader.color_matrix[0] = color_matrix[0]" />
                <span class="color red"></span>
            </div>
            <label>Green {{ shader.color_matrix[1].toFixed(3) }}</label>
            <div class="flex">
                <span class="color cyan"></span>
                <o-slider :disabled="show_origin" v-model="shader.color_matrix[1]" :step="0.01" :min="-3" :max="3"
                    :tooltip="false" @dblclick="shader.color_matrix[1] = color_matrix[1]" />
                <span class="color red"></span>
            </div>
            <label>Blue {{ shader.color_matrix[2].toFixed(3) }}</label>
            <div class="flex">
                <span class="color cyan"></span>
                <o-slider :disabled="show_origin" v-model="shader.color_matrix[2]" :step="0.01" :min="-3" :max="3"
                    :tooltip="false" @dblclick="shader.color_matrix[2] = color_matrix[2]" />
                <span class="color red"></span>
            </div>
        </div>


        <label>ColorMatrix Green Δ {{ (shader.color_matrix[3] + shader.color_matrix[4] +
        shader.color_matrix[5]).toFixed(3) }}</label>
        <div class="field-wrapper">
            <label>Red {{ shader.color_matrix[3].toFixed(3) }}</label>
            <div class="flex">
                <span class="color purple"></span>
                <o-slider :disabled="show_origin" v-model="shader.color_matrix[3]" :step="0.01" :min="-3" :max="3"
                    :tooltip="false" @dblclick="shader.color_matrix[3] = color_matrix[3]" />
                <span class="color green"></span>
            </div>
            <label>Green {{ shader.color_matrix[4].toFixed(3) }}</label>
            <div class="flex">
                <span class="color purple"></span>
                <o-slider :disabled="show_origin" v-model="shader.color_matrix[4]" :step="0.01" :min="-3" :max="3"
                    :tooltip="false" @dblclick="shader.color_matrix[4] = color_matrix[4]" />
                <span class="color green"></span>
            </div>
            <label>Blue {{ shader.color_matrix[5].toFixed(3) }}</label>
            <div class="flex">
                <span class="color purple"></span>
                <o-slider :disabled="show_origin" v-model="shader.color_matrix[5]" :step="0.01" :min="-3" :max="3"
                    :tooltip="false" @dblclick="shader.color_matrix[5] = color_matrix[5]" />
                <span class="color green"></span>
            </div>
        </div>


        <label>ColorMatrix Blue Δ {{ (shader.color_matrix[6] + shader.color_matrix[7] +
        shader.color_matrix[8]).toFixed(3) }}</label>
        <div class="field-wrapper">
            <label>Red {{ shader.color_matrix[6].toFixed(3) }}</label>
            <div class="flex">
                <span class="color yellow"></span>
                <o-slider :disabled="show_origin" v-model="shader.color_matrix[6]" :step="0.01" :min="-3" :max="3"
                    :tooltip="false" @dblclick="shader.color_matrix[6] = color_matrix[6]" />
                <span class="color blue"></span>
            </div>
            <label>Green {{ shader.color_matrix[7].toFixed(3) }}</label>
            <div class="flex">
                <span class="color yellow"></span>
                <o-slider :disabled="show_origin" v-model="shader.color_matrix[7]" :step="0.01" :min="-3" :max="3"
                    :tooltip="false" @dblclick="shader.color_matrix[7] = color_matrix[7]" />
                <span class="color blue"></span>
            </div>
            <label>Blue {{ shader.color_matrix[8].toFixed(3) }}</label>
            <div class="flex">
                <span class="color yellow"></span>
                <o-slider :disabled="show_origin" v-model="shader.color_matrix[8]" :step="0.01" :min="-3" :max="3"
                    :tooltip="false" @dblclick="shader.color_matrix[8] = color_matrix[8]" />
                <span class="color blue"></span>
            </div>
        </div>

        <label>Distortion X:{{ shader.distortion[0] }} Y:{{ shader.distortion[1] }}</label>
        <o-checkbox class="distortion-mask" v-model="shader.distortion_mask" variant="transparent">Larger
            view</o-checkbox>
        <o-slider :disabled="show_origin" v-model="shader.distortion[0]" :step="0.01" :min="-1" :max="1"
            :tooltip="false" @dblclick="shader.distortion[0] = 0" />
        <o-slider :disabled="show_origin" v-model="shader.distortion[1]" :step="0.01" :min="-1" :max="1"
            :tooltip="false" @dblclick="shader.distortion[1] = 0" />

        <div class="flex">
            <o-checkbox v-model="show_origin" variant="transparent">Show origin</o-checkbox>
            <o-checkbox v-model="better_demosaicing" variant="transparent">Better demosaicing</o-checkbox>
        </div>

        <div class="flex">
            <o-checkbox v-model="icc_profile.enable" variant="transparent">
                <a href="#">{{ icc_profile.name }}</a>
                <input type="file" accept=".icc" name="icc_profile" @change="iccLoad" />
            </o-checkbox>
        </div>

        <o-button class="export-btn export-jpg" :disabled="generating_exports" outlined @click="exportImg">↓ Export
            JPG</o-button>
        <div class="field-wrapper">
            Rating {{ rating }}
            <o-slider v-model="rating" :step="1" :min="1" :max="5" :tooltip="false" rounded variant="info" />
            <o-button class="export-btn" :disabled="generating_exports" outlined @click="exportAdobeXMP">↓ Adobe
                XMP</o-button>
            <o-button class="export-btn" :disabled="generating_exports" outlined @click="exportDarktableXMP">↓ darktable
                XMP</o-button>
            <o-button class="export-btn" :disabled="generating_exports" outlined @click="exportPP3">↓ PP3</o-button>
        </div>
    </div>
</template>

<script>
import { add_icc_to_jpeg, add_srgb_to_jpeg } from "./jpeg";
import { updateUniform, updateUniformAllVars, readPixelsAsync } from "../webgl";

const gen_pp3 = r => `[General]
Rank=${r}`;
const gen_xmp = r => `<?xml version="1.0" encoding="UTF-8"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="RawWorks">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:xmp="http://ns.adobe.com/xap/1.0/"
    xmp:Rating="${r}">
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>`;

const reader = new FileReader();

let shader_timeout = 0;

export default {
    props: ['webgl_instance', 'timer', 'white_balance', 'color_matrix'],
    data() {
        return {
            panel: {
                luminance: true,
                color: false,
                export: false
            },
            keep_shader_settings: false,
            prevent_shader_update: false,
            show_origin: false,
            better_demosaicing: false,
            generating_exports: false,
            mem: null,
            rating: 3,
            shader: {
                gamma: 2.22,
                white_point: 0,
                black_point: 0,
                highlight_point: 0,
                shadow_point: 0,
                vibrance: 0,
                distortion: [0, 0],
                distortion_mask: true,
                white_balance: [1, 1, 1],
                color_matrix: [1, 1, 1, 1, 1, 1, 1, 1, 1]
            },
            icc_profile: {
                enable: false,
                name: 'ICC Profile',
                data: new Uint8Array()
            }
        }
    },
    methods: {
        exportSideCar(fn, suffix_fn) {
            const canvas = document.querySelector('canvas.selected');
            const filename = canvas.getAttribute('data-filename');

            const content = fn(this.rating);

            const blob = new Blob([content], {
                type: 'text/plain'
            });
            const link = document.createElement('a');
            link.download = suffix_fn(filename);
            link.href = window.URL.createObjectURL(blob);
            link.click();
        },
        exportAdobeXMP() {
            this.exportSideCar(gen_xmp, name => name + '.xmp');
        },
        exportDarktableXMP() {
            this.exportSideCar(gen_xmp, name => name.substring(0, name.lastIndexOf('.')) + '.xmp');
        },
        exportPP3() {
            this.exportSideCar(gen_pp3, name => name + '.pp3');
        },
        exportImg() {
            if (window.isSafari) {
                this.exportImgByWasm();
            } else {
                this.exportImgByCanvas();
            }
        },
        exportImgByWasm() {
            if (this.generating_exports) return;

            this.generating_exports = true;

            const canvas = document.querySelector('canvas.selected');
            const filename = canvas.getAttribute('data-filename');
            const width = canvas.width;
            const height = canvas.height;

            const buffer = new SharedArrayBuffer(width * height * 4);
            const pixels = new Uint8Array(buffer);
            const gl = this.webgl_instance.gl;
            readPixelsAsync(gl, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
                .then(pixels => window.sendToWorker('rgba_to_jpeg', pixels, width, height))
                .then(jpeg => {
                    const processed_jpeg = this.icc_profile.enable ? add_icc_to_jpeg(jpeg.buffer, this.icc_profile.data) : add_srgb_to_jpeg(jpeg.buffer);
                    const blob = new Blob([processed_jpeg]);
                    const link = document.createElement('a');
                    link.download = filename + '.jpg';
                    link.href = window.URL.createObjectURL(blob);
                    link.click();
                    setTimeout(() => {
                        this.generating_exports = false;
                    }, 300);
                })
                .catch(err => alert(err));
        },
        exportImgByCanvas() {
            if (this.generating_exports) return;

            this.generating_exports = true;

            const canvas = document.querySelector('canvas.selected');
            const filename = canvas.getAttribute('data-filename');
            const link = document.createElement('a');
            link.download = filename + '.jpg';
            canvas.toBlob(async blob => {
                const buffer = await blob.arrayBuffer();
                const processed_jpeg = this.icc_profile.enable ? add_icc_to_jpeg(buffer, this.icc_profile.data) : add_srgb_to_jpeg(buffer);
                link.href = window.URL.createObjectURL(new Blob([processed_jpeg]));
                link.click();
                setTimeout(() => {
                    this.generating_exports = false;
                }, 300);
            }, 'image/jpeg', 0.93);
        },
        setShader(name, value, method) {
            if (this.prevent_shader_update) return;

            clearTimeout(shader_timeout);
            shader_timeout = setTimeout(() => {
                updateUniform(this.webgl_instance, method || 'uniform1f', name, value, pixels => {
                    window.sendToWorker('calc_histogram', pixels).then(data => {
                        this.$emit("histogram_load", data);
                    });
                });
            }, 1000 / 120);
        },
        resetShader(prevent_shader_update) {
            this.prevent_shader_update = !!prevent_shader_update;

            Object.assign(this.shader, this.$options.data().shader);
            this.shader.white_balance = this.white_balance.slice();
            this.shader.color_matrix = this.color_matrix.slice();

            if (prevent_shader_update) {
                this.$nextTick(() => {
                    this.prevent_shader_update = false;
                });
            }
        },
        iccLoad(e) {
            const f = e.target.files[0];

            reader.onloadend = () => {
                const buffer = reader.result;
                if (!buffer.byteLength) {
                    alert('Cannot read this ICC profile or this file is empty');
                    return;
                }
                this.icc_profile.name = f.name;
                this.icc_profile.enable = true;
                this.icc_profile.data = new Uint8Array(buffer);
            };

            reader.readAsArrayBuffer(f);
        }
    },
    watch: {
        better_demosaicing(v) {
            this.keep_shader_settings = true;
            window.settings.better_demosaicing = v;
            this.$emit("change_demosaicing");
        },
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
        'webgl_instance'(v) {
            if (!v) return;
            // this is the actual init after each new image loaded
            if (this.keep_shader_settings) {
                this.keep_shader_settings = false;
                const shader = this.shader;
                const data = {
                    gamma: 1 / shader.gamma,
                    white_point: shader.white_point,
                    black_point: shader.black_point,
                    highlight_point: shader.highlight_point,
                    shadow_point: shader.shadow_point,
                    vibrance: shader.vibrance,
                    distortion_mask: shader.distortion_mask ? 0 : 1,
                    distortion: this.shader.distortion,
                    white_balance: this.shader.white_balance,
                    color_matrix: this.shader.color_matrix
                };
                updateUniformAllVars(this.webgl_instance, data, pixels => {
                    window.sendToWorker('calc_histogram', pixels).then(data => {
                        this.$emit("histogram_load", data);
                    });
                });
            } else {
                this.resetShader(true);
                this.rating = 3;
            }
        },
        'shader.white_balance': {
            handler() {
                this.setShader('white_balance', this.shader.white_balance, 'uniform3fv');
            },
            deep: true
        },
        'shader.color_matrix': {
            handler(v) {
                this.setShader('color_matrix', this.shader.color_matrix, 'uniformMatrix3fv');
            },
            deep: true
        },
        'shader.distortion': {
            handler() {
                this.setShader('distortion', this.shader.distortion, 'uniform2fv');
            },
            deep: true
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
        'shader.vibrance'(v) {
            this.setShader('vibrance', v);
        },
        'shader.distortion_mask'(v) {
            this.setShader('distortion_mask', v ? 0 : 1);
        },
    }
}
</script>
<style scoped>
.container {
    margin-bottom: .5rem;
}

.container label {
    vertical-align: middle;
}

.distortion-mask {
    float: right;
}

.o-slide {
    margin: 0.75rem 0;
}

.flex {
    justify-content: space-between;
    align-items: center;
    margin: 2px 0;
    position: relative;
}

.flex input {
    position: absolute;
    top: 0;
    left: 17px;
    width: 100%;
    height: 100%;
    opacity: 0;
}

.flex .o-slide {
    margin: 0 4px;
}

.field-wrapper {
    border: 1px solid #333;
    border-radius: 8px;
    padding: 8px;
    margin: 8px 0;
    padding-bottom: 4px;
}

.field-wrapper .export-btn {
    margin-bottom: .5rem;
}

.field-wrapper .title {
    margin-top: .75rem;
}

.export-jpg {
    margin-top: .5rem;
}

.export-btn {
    margin-right: .5rem;
}

a.disabled {
    color: #444;
}

.color {
    display: block;
    width: 6px;
    height: 6px;
}

.cyan {
    background: cyan;
}

.red {
    background: red;
}

.green {
    background: green;
}

.purple {
    background: purple;
}

.yellow {
    background: yellow;
}

.blue {
    background: blue;
}
</style>