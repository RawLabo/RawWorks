<template>
    <div>
        <canvas v-show="histogram" width="256" height="128" ref="canvas"></canvas>
    </div>
</template>

<script>
export default {
    props: ['histogram'],
    watch: {
        histogram(histogram) {
            const r = histogram.slice(0, 256);
            const g = histogram.slice(256, 256 * 2);
            const b = histogram.slice(256 * 2, 256 * 3);
            const max = histogram[256 * 3];

            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext("2d");

            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            ctx.globalCompositeOperation = "screen";

            [
                [r, "#f33"],
                [g, "#3f3"],
                [b, "#33f"],
            ].forEach(([hg, color]) => {
                ctx.beginPath();
                ctx.moveTo(0, height);
                hg.forEach((v, i) => {
                    const h = height - (v * height) / max;
                    const x = i * width / 256;
                    ctx.lineTo(x, h);
                });
                ctx.lineTo(width, height);
                ctx.fillStyle = color;
                ctx.closePath();
                ctx.fill();
            });

            this.$emit("finish");
        },
    },
};
</script>

<style scoped>
canvas {
    border-left: 1px dashed #444;
    border-right: 1px dashed #444;
}
</style>
