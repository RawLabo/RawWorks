<template>
    <div class="flex">
        <o-upload v-model="file" drag-drop>
            Drop your file here or click to choose
        </o-upload>
    </div>
</template>

<script>
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

                try {
                    const content = new Uint8Array(reader.result);
                    const img = window.quickraw.fn.load_image(content);
                    img.data = new Uint16Array(window.quickraw.wasm.memory.buffer, img.data_ptr, img.data_len);
                    window.timer.raw_decoded = performance.now();
                    this.$emit("raw_decoded", img, file.name);
                } catch(e) {
                    alert(e);
                    window.quickraw.dispose();
                }
            };
            reader.readAsArrayBuffer(file);
        }
    },
}
</script>

<style scoped>
.o-upl {
    width: 100%;
    height: 48px
}
</style>
