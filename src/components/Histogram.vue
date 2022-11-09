<template>
    <div>
        <canvas v-show="histogram" width="256" height="128" ref="canvas" @dblclick="switchLog"></canvas>
    </div>
</template>

<script>
export default {
    props: ['histogram'],
    data() {
        return {
            is_log: false
        }
    },
    watch: {
        histogram() {
            this.drawHistogram();
            this.$emit("finish");
        },
    },
    methods: {
        switchLog() {
            this.is_log = !this.is_log;
            this.drawHistogram();
        },
        drawHistogram() {
            const valueDisplay = this.is_log ? v => v > 1 ? Math.log2(v) : 0 : v => v;

            const r = this.histogram.subarray(0, 256);
            const g = this.histogram.subarray(256, 256 * 2);
            const b = this.histogram.subarray(256 * 2, 256 * 3);
            const max = valueDisplay(this.histogram[256 * 3]);

            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext("2d");

            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            ctx.globalCompositeOperation = "screen";

            [
                [r, this.is_log ? "#a33" : "#f33"],
                [g, this.is_log ? "#3a3" : "#3f3"],
                [b, this.is_log ? "#33a" : "#33f"],
            ].forEach(([hg, color]) => {
                ctx.beginPath();
                ctx.moveTo(0, height);
                hg.forEach((v, i) => {
                    const h = height - (valueDisplay(v) * height) / max;
                    const x = i * width / 256;
                    ctx.lineTo(x, h);
                });
                ctx.lineTo(width, height);
                ctx.fillStyle = color;
                ctx.closePath();
                ctx.fill();
            });
        }
    }
};
</script>

<style scoped>
canvas {
    border-left: 1px dashed #444;
    border-right: 1px dashed #444;
}
</style>
