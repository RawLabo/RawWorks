import { quickraw, disposeWasm } from './quickraw';

const fn_map = {
  rgba_to_jpeg(id, input, width, height) {
    const row_len = width * 4;
    const pixels = new Uint8Array(height * row_len);
    for (let row = 0; row < height; row++) {
      const start = row * row_len;
      pixels.set(input.subarray(start, start + row_len), (height - row - 1) * row_len);
    }

    const jpeg = quickraw.encode_to_jpeg(pixels, width, height);
    disposeWasm();

    postMessage({ id, result: jpeg }, [jpeg.buffer]);
  }
};

onmessage = (e) => {
  if (e.data.method in fn_map) {
    fn_map[e.data.method](e.data.id, ...e.data.args);
  }
}