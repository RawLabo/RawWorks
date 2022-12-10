import init, * as quickraw from './quickraw'
let wasm;

init().then(v => wasm = v);
function disposeWasm() {
    init(init.__wbindgen_wasm_module).then(v => wasm = v);
}

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
    load_thumbnail(id, buffer) {
        const thumbnail = quickraw.load_thumbnail(buffer);
        buffer = null;
        const result = {
            orientation: thumbnail.orientation,
        };
        result.data = thumbnail.data;

        postMessage({ id, result }, [result.data.buffer]);
    },
    load_image(id, buffer, method) {
        const img = quickraw[method](buffer);
        const image = {
            data: new Uint16Array(wasm.memory.buffer, img.data_ptr, img.data_len).slice(),
            width: img.width,
            height: img.height,
            orientation: img.orientation,
            white_balance: img.white_balance,
            color_matrix: img.color_matrix
        };

        postMessage({ id, result: image }, [image.data.buffer]);
    }
};


onmessage = (e) => {
    if (e.data.method in fn_map) {
        try {
            fn_map[e.data.method](e.data.id, ...e.data.args);
        } catch (err) {
            postMessage({ id: e.data.id, err: err.toString() });
        } finally {
            disposeWasm();
        }
    }
}