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
            file: null
        }
    },
    methods: {
        fileLoad() {
            window.timer.file_to_load = performance.now();

            const reader = new FileReader();
            reader.onload = () => {
                window.timer.file_loaded = performance.now();

                try {
                    const content = new Uint8Array(reader.result);
                    const fn_name = window.quickraw.settings.better_demosaicing ? 'load_image_enhanced' : 'load_image';
                    const img = window.quickraw.fn[fn_name](content);
                    img.data = new Uint16Array(window.quickraw.wasm.memory.buffer, img.data_ptr, img.data_len);
                    window.timer.raw_decoded = performance.now();
                    this.$emit("raw_decoded", img, this.file.name);
                } catch (e) {
                    alert(e);
                    window.quickraw.dispose();
                }
            };
            reader.readAsArrayBuffer(this.file);
        }
    },
    watch: {
        file() {
            this.fileLoad();
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
