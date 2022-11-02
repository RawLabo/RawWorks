<template>
    <div>
        <canvas width="256" height="128" ref="canvas"></canvas>
    </div>
</template>

<script>
export default {
    props: ['histogram'],
    mounted() {
        const canvas = this.$refs.canvas;
        const ctx = canvas.getContext("2d");
        ctx.translate(.5, -.5);
    },  
    watch: {
        histogram(histogram) {
            const r = histogram.slice(0, 256);
            const g = histogram.slice(256, 256 * 2);
            const b = histogram.slice(256 * 2, 256 * 3);
            const max = Math.log2(histogram[256 * 3]);

            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext("2d");

            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            ctx.globalCompositeOperation = "screen";
            
            ctx.lineWidth = 1;

            [
                [r, "#f33"],
                [g, "#3f3"],
                [b, "#33f"],
            ].forEach(([hg, color]) => {
                ctx.beginPath();

                hg.forEach((v, i) => {
                    const h = height - (Math.log2(v) * height) / max;
                    const x = i * width / 256;
                    ctx.moveTo(x, height);
                    ctx.lineTo(x, h);
                });
                ctx.strokeStyle = color;
                ctx.closePath();

                ctx.stroke();
            });

            this.$emit("finish");
        },
    },
};
</script>

<style scoped>

</style>
