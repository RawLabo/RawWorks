<template>
    <div class="flex wrapper" ref="wrapper" @scroll="lazyLoad" @wheel="wheel">
        <div class="loading flex-center"
            :style="{ opacity: isLoading ? 1 : 0, 'pointer-events': isLoading ? 'auto' : 'none' }">
            Loading...
        </div>
        <label ref="uploader" :class="{ uploader: true, 'flex-center': true, active: isDraggingOver }"
            @dragover="isDraggingOver = true" @dragleave="isDraggingOver = false">
            Click to + raw files
            <br>
            Drop to + folder
            <input type="file" title="" multiple @change="fileChange" @drop="fileChange" />
        </label>
        <div @click="loadImage(index)" v-for="(file, index) in files"
            :class="{ 'flex-center': true, thumbnail: true, active: index == activeIndex }">
            <div class="name">{{ file.file.name }}</div>
            <img :src="file.thumb64"
                :style="{ transform: `rotate(${file.orientation}deg)`, opacity: file.thumb64 ? 1 : 0 }" />
        </div>
    </div>
</template>

<script>
const EXTENSIONS = new Set(['arw']);
function checkExtension(name) {
    name = name.toLowerCase();
    if (name[0] == '.') return false;
    const name_arr = name.split('.');
    if (EXTENSIONS.has(name_arr[name_arr.length - 1])) {
        return true;
    }
    return false;
}

async function readEntry(item, result) {
    if (item.isFile) {
        if (checkExtension(item.name)) {
            const f = await new Promise((resolve, reject) => item.file(resolve, reject));
            result.push(f);
        }
    } else if (item.isDirectory) {
        const total_entries = [];
        const reader = item.createReader();
        let len = 0;
        do {
            const entries = await new Promise(resolve => reader.readEntries(resolve));
            len = entries.length;
            total_entries.push(...entries);
        } while (len > 0);
        
        for (let i = 0; i < total_entries.length; i++) {
            await readEntry(total_entries[i], result);
        }
    }
}

const reader = new FileReader();
const readSets = new Set();

export default {
    data() {
        return {
            isDraggingOver: false,
            isLoading: false,
            activeIndex: -1,
            files: [],
            filesIndexToRead: []
        }
    },
    methods: {
        wheel(e) {
            if (e.deltaX) return;

            this.$refs.wrapper.scrollLeft += e.deltaY;
        },
        lazyLoad() {
            const width = this.$refs.wrapper.clientWidth;
            const scroll_left = this.$refs.wrapper.scrollLeft - this.$refs.uploader.clientWidth;
            const thumb_width = 128 + 4;
            const left_bound = parseInt(scroll_left / thumb_width);
            let right_bound = parseInt((scroll_left + width) / thumb_width);
            if (right_bound >= this.files.length)
                right_bound = this.files.length - 1;

            const range = [];
            for (let i = left_bound; i <= right_bound; ++i)
                range.push(i);

            this.filesIndexToRead = range;
            this.readFilesOneByOne();
        },
        readFilesOneByOne() {
            if (!this.filesIndexToRead.length || reader.readyState == 1) return;

            const index = this.filesIndexToRead.shift();
            const f = this.files[index].file;

            reader.onloadend = () => {
                const buffer = reader.result;
                this.readFilesOneByOne();

                window.sendToWorker(['load_thumbnail', [buffer]], new Uint8Array(buffer)).then(thumb => {
                    const data = thumb.data;
                    const orientation = thumb.orientation;
                    const blob = new Blob([data]);
                    this.files[index].orientation = orientation;
                    this.files[index].thumb64 = URL.createObjectURL(blob);
                });
            };

            if (readSets.has(f)) {
                return this.readFilesOneByOne();
            }
            readSets.add(f);
            reader.readAsArrayBuffer(f);
        },
        async fileChange(e) {
            e.preventDefault();
            this.isDraggingOver = false;

            let files;
            if (e.dataTransfer) {
                files = [];
                let items = e.dataTransfer.items;
                for (let i = 0; i < items.length; i++) {
                    const item = items[i].webkitGetAsEntry();
                    await readEntry(item, files);
                }
            } else {
                files = Array.from(e.target.files).filter(f => checkExtension(f.name));
            }

            files.sort((a, b) => b.lastModified - a.lastModified);
            if (this.activeIndex >= 0) {
                this.activeIndex += files.length;
            }
            this.files = files.map(f => ({
                file: f,
                orientation: 0,
                thumb64: null
            })).concat(this.files);
            this.lazyLoad();
        },
        loadImage(index) {
            if (index == this.activeIndex) return;

            if (index == undefined)
                index = this.activeIndex;

            window.timer.file_to_load = performance.now();

            this.isLoading = true;
            this.activeIndex = index;
            const f = this.files[index].file;

            const reader = new FileReader();
            reader.onload = async () => {
                window.timer.file_loaded = performance.now();

                const content = new Uint8Array(reader.result);
                const method = window.quickraw.settings.better_demosaicing ? 'load_image_enhanced' : 'load_image';
                const img = await window.sendToWorker(['load_image', [content.buffer]], content, method);
                window.timer.raw_decoded = performance.now();
                this.$emit("raw_decoded", img, f.name);
                this.isLoading = false;
            };
            reader.readAsArrayBuffer(f);
        }
    },
}
</script>

<style scoped>
.uploader {
    color: #888;
    padding: 8px;
    border: 1px dotted #333;
    position: relative;
    transition: all ease 0.5s;
    border-radius: 4px;
    min-width: 128px;
    min-height: 128px;
    text-align: center;
    background: #171717;
}

.uploader:hover {
    color: #bbb;
    border: 1px dotted #555;
}

.uploader input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

.uploader.active {
    color: #fff;
    border-color: #fff;
}

.thumbnail {
    position: relative;
    background: #222;
    transition: background ease 0.3s;
    margin-left: 4px;
    cursor: pointer;
    height: 128px;
    min-width: 128px;
}

.thumbnail:hover {
    background: #333;
}

.thumbnail.active {
    background: #5a57;
}

.thumbnail img {
    max-width: 128px;
    max-height: 128px;
    transition: opacity ease 0.3s;
}
.thumbnail .name {
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    z-index: 1;
    text-shadow: 0 0 2px #111;
    color: #eee;
}
.wrapper {
    position: relative;
    overflow: auto;
    background: #111;
    padding: .5rem;
    padding-bottom: 2px;
}

.loading {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 136px;
    background: #000a;
    z-index: 1;
    transition: opacity ease-in .2s;
}
</style>
