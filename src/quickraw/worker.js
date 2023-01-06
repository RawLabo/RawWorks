import init, * as quickraw from './quickraw'
import { initSync } from './quickraw'

let wasm;

init().then(v => wasm = v);

const fn_map = {
    rgba_to_jpeg(id, input, width, height) {
        const row_len = width * 4;
        const ptr = wasm.__wbindgen_malloc(height * row_len);

        const pixels = new Uint8Array(wasm.memory.buffer);
        for (let row = 0; row < height; row++) {
            const start = row * row_len;
            pixels.set(input.subarray(start, start + row_len), ptr + (height - row - 1) * row_len);
        }

        const jpeg = quickraw.encode_to_jpeg(ptr, width, height);

        postMessage({ id, result: jpeg }, [jpeg.buffer]);
    },
    calc_histogram(id, pixels) {
        const histogram_data = quickraw.calc_histogram(pixels);
        pixels = null;
        postMessage({ id, result: histogram_data }, [histogram_data.buffer]);
    },
    load_exif_with_thumbnail(id, buffer) {
        const exif_with_thumbnail = quickraw.load_exif_with_thumbnail(buffer);
        buffer = null;
        const exif = {};
        exif_with_thumbnail.exif.split('\n').forEach(line => {
            if (!line.trim()) return;

            let [field, value] = line.trim().split(':');
            value = value.split('/').map(x => x.trim());
            exif[field.trim()] = value;
        });
        const result = {
            orientation: exif_with_thumbnail.orientation,
            exif
        };
        result.thumb = exif_with_thumbnail.thumbnail;
        postMessage({ id, result }, [result.thumb.buffer]);
    },
    load_image(id, buffer, method) {
        const img = quickraw[method](buffer);
        const image = {
            width: img.width,
            height: img.height,
            orientation: img.orientation,
            white_balance: img.white_balance,
            color_matrix: img.color_matrix
        };
        image.data = img.data;
        
        postMessage({ id, result: image }, [image.data.buffer]);
    }
};


onmessage = (e) => {
    if (e.data.method in fn_map) {
        try {
            fn_map[e.data.method](e.data.id, ...e.data.args);
        } catch (err) {
            wasm = initSync(init.__wbindgen_wasm_module);
            postMessage({ id: e.data.id, err: err.toString() });
        }
    }
}