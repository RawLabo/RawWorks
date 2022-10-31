import { initWebgl, render } from './webgl'
import init, * as quickraw from './quickraw'
init()

export function disposeWasm() {
    init(init.__wbindgen_wasm_module);
}

export function drawHistogram(canvas, pixels) {
    let histogram = quickraw.calc_histogram(pixels);

    let r = histogram.slice(0, 256);
    let g = histogram.slice(256, 256 * 2);
    let b = histogram.slice(256 * 2, 256 * 3);
    let max = Math.log2(histogram[256 * 3]);

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.globalCompositeOperation = "screen";

    [[r, '#f33'], [g, '#3f3'], [b, '#33f']].forEach(([hg, color]) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        hg.forEach((v, i) => {
            ctx.lineTo(i * width / 255, height - Math.log2(v) * height / max);
        });
        ctx.fillStyle = color
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
    });
}

export { quickraw, initWebgl, render };