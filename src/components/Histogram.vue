<script setup>
defineEmits(["finish"]);
defineProps(["histogram"]);
</script>

<template>
    <div>
        <canvas width="256" height="128" ref="canvas"></canvas>
    </div>
</template>

<script>
export default {
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

            [
                [r, "#f33"],
                [g, "#3f3"],
                [b, "#33f"],
            ].forEach(([hg, color]) => {
                ctx.beginPath();

                let moved = false;
                let last_i_with_value = 0;

                hg.forEach((v, i) => {
                    const h = height - (Math.log2(v) * height) / max;
                    if (h < height) {
                        const x = i * width / 256;

                        if (!moved) {
                            ctx.moveTo(x, height);
                            moved = true;
                        }

                        ctx.lineTo(x, h);
                        last_i_with_value = i;
                    }
                });
                ctx.fillStyle = color;
                ctx.lineTo(last_i_with_value * width / 256, height);

                ctx.closePath();
                ctx.fill();
            });

            this.$emit("finish");
        },
    },
};
</script>

<style scoped>

</style>
