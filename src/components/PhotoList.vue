<script setup>
import { quickraw } from "../quickraw";

const emit = defineEmits(["raw_decoded"]);

const fileSelected = (info) => {
    window.timer.file_to_load = performance.now();

    const reader = new FileReader();
    reader.onload = () => {
        window.timer.file_loaded = performance.now();

        const img = quickraw.load_image(new Uint8Array(reader.result));

        window.timer.raw_decoded = performance.now();

        emit("raw_decoded", img);
    };
    reader.readAsArrayBuffer(info.file.file);
};
</script>

<template>
    <div class="flex">
        <n-upload class="flex" :show-file-list="false" directory-dnd @change="fileSelected">
            <n-upload-dragger class="flex-center">Click or drag a raw photo to this area</n-upload-dragger>
        </n-upload>
    </div>
</template>

<style scoped>
.n-upload-dragger {
    width: 150px;
    height: 100%;
}
</style>
