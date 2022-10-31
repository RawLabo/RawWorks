<script setup>
defineProps(['img']);
defineEmits(['histogram_load']);
</script>

<template>
    <div ref="container" class="container flex-center">
        <canvas ref="canvas" :style="{ width, height }"></canvas>
    </div>
</template>

<script>
import { quickraw, initWebgl, render } from '../quickraw';
export default {
    methods: {
        updateCanvasTransform() {
            if (!this.img_info.width) return;

            const width = this.$refs.container.clientWidth;
            const height = this.$refs.container.clientHeight;

            if (width / height > this.img_info.width / this.img_info.height) {
                this.width = 'auto';
                this.height = height + 'px';
            } else {
                this.width = width + 'px';
                this.height = 'auto';
            }
        }
    },
    data() {
        return {
            img_info: {
                width: 0,
                height: 0,
            },
            width: 'auto',
            height: 'auto'
        }
    },
    watch: {
        img(img) {
            const width = img.width
            const height = img.height
            const white_balance = img.wb
            const color_matrix = img.color_matrix
            const img_data = img.data

            this.img_info.width = width;
            this.img_info.height = height;
            this.updateCanvasTransform();

            const wegbl_instance = initWebgl(this.$refs.canvas, width, height)

            render(wegbl_instance, img_data, width, height, white_balance, color_matrix, (pixels) => {
                window.timer.pixels_read = performance.now();
                const histogram_data = quickraw.calc_histogram(pixels);
                window.timer.histogram_calced = performance.now();
                this.$emit('histogram_load', histogram_data);
            });
            window.timer.rendered = performance.now();
        }
    },
    mounted() {
        window.addEventListener('resize', () => {
            this.updateCanvasTransform();
        });
    }
}
</script>

<style scoped>
.container {
    background: #111;
    overflow: hidden;
}
</style>

