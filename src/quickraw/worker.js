import init, * as quickraw from './quickraw'
init()

function disposeWasm() {
    init(init.__wbindgen_wasm_module);
}

const fn_map = {
    rgba_to_jpeg(id, input, width, height) {
        const row_len = width * 4;
        const pixels = new Uint8Array(height * row_len);
        for (let row = 0; row < height; row++) {
            const start = row * row_len;
            pixels.set(input.subarray(start, start + row_len), (height - row - 1) * row_len);
        }

        const jpeg = quickraw.encode_to_jpeg(pixels, width, height);

        postMessage({ id, result: jpeg }, [jpeg.buffer]);
    },
    calc_histogram(id, pixels) {
        const histogram_data = quickraw.calc_histogram(pixels);

        postMessage({ id, result: histogram_data }, [histogram_data.buffer]);
    },
    load_image(id, buffer) {
        const img = quickraw.load_image(buffer);

        const result = {
            orientation: img.orientation,
            width: img.width,
            height: img.height,
            white_balance: img.white_balance,
            color_matrix: img.color_matrix,
        };
        result.data = img.data;

        postMessage({ id, result }, [result.data.buffer, result.white_balance.buffer, result.color_matrix.buffer]);
    },
    load_thumbnail(id, buffer) {
        const thumbnail = quickraw.load_thumbnail(buffer);
        
        const result = {
            orientation: thumbnail.orientation,
        };
        result.data = thumbnail.data;

        postMessage({ id, result }, [result.data.buffer]);
    }
};

onmessage = (e) => {
    if (e.data.method in fn_map) {
        try {
            fn_map[e.data.method](e.data.id, ...e.data.args);
        } catch(err) {
            postMessage({ id: e.data.id, err: err.toString() });
        } finally {
            disposeWasm();
        }
    }
}