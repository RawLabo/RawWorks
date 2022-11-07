<template>
    <div class="flex">
        <o-upload v-model="file" drag-drop>
            Drop your file here or click to choose
        </o-upload>
    </div>
</template>

<script>
import { quickraw } from "../quickraw";

export default {
    data() {
        return {
            file: []
        }
    },
    watch: {
        file(file) {
            window.timer.file_to_load = performance.now();

            const reader = new FileReader();
            reader.onload = () => {
                window.timer.file_loaded = performance.now();

                const img = quickraw.load_image(new Uint8Array(reader.result));

                window.timer.raw_decoded = performance.now();

                this.$emit("raw_decoded", img, file.name);
            };
            reader.readAsArrayBuffer(file);
        }
    },
}
</script>

<style scoped>
.o-upl {width: 100%; height: 48px}
</style>
