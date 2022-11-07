const WEBGL = 'webgl2';

const VERTEX = `#version 300 es
    in vec2 corner_pos;
    in vec2 pixel_pos;

    uniform float degree;

    out vec2 frag_pixel_pos;

    void main() {
        float x = corner_pos.x;
        float y = corner_pos.y;

        float angle = -degree * 3.14159265358 / 180.0;
        vec2 pos = vec2(cos(angle) * x - sin(angle) * y, sin(angle) * x + cos(angle) * y);
        
        gl_Position = vec4(pos, 0, 1);
        frag_pixel_pos = vec2(pixel_pos.x, 1.0 - pixel_pos.y);
    }
`;

const FRAGMENT = `#version 300 es
    precision mediump float;

    uniform mediump usampler2D image;

    // uniform variables should also be added to (1)webgl_instance.uniform (2)render function for init
    uniform vec3 white_balance;
    uniform mat3 color_matrix;
    uniform float gamma;
    uniform float exposure;
    uniform float white_point;
    uniform float black_point;
    uniform float highlight_point;
    uniform float shadow_point;
    uniform float highlight_threshold;

    in vec2 frag_pixel_pos;
    out vec4 output_color;

    void main() {
        vec3 center = vec3(texture(image, frag_pixel_pos).rgb) / 65535.0;

        // color convert
        vec3 colored =  clamp(clamp(center * white_balance, 0.0, 1.0) * color_matrix, 0.0, 1.0);

        vec3 highlight_th = vec3(highlight_threshold);
        vec3 shadow_th = vec3(1.0) - highlight_th;

        // color adjustment
        vec3 gamma_v = pow(max(colored, 0.00001), vec3(gamma)); // gamma 0 fix
        vec3 exposure_v = clamp(gamma_v * pow(2.0, exposure), vec3(0.0), vec3(1.0));

        vec3 white_point_v = exposure_v + white_point * exposure_v;
        vec3 highlight_v = white_point_v + highlight_point * (highlight_th - abs(white_point_v - highlight_th));

        vec3 black_point_v = highlight_v+ black_point * (vec3(1.0) - highlight_v);
        vec3 shadow_v = black_point_v + shadow_point * (highlight_th - abs(black_point_v - shadow_th));

        output_color = vec4(shadow_v, 1.0);
    }
`;

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    gl.deleteShader(shader);
}


function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    gl.deleteProgram(program);
}


function genProgram(gl, vertex_text, fragment_text) {
    const vertex_shader = createShader(gl, gl.VERTEX_SHADER, vertex_text);
    const fragment_shader = createShader(gl, gl.FRAGMENT_SHADER, fragment_text);
    const program = createProgram(gl, vertex_shader, fragment_shader);

    return program;
}

function setXYin(program, gl, name, data, type) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var attr_loc = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(attr_loc);
    var size = 2;
    var type = type || gl.BYTE;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(
        attr_loc, size, type, normalize, stride, offset);
}

function initTexture(gl) {
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}

export function initWebgl(canvas, width, height) {
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
    }

    const gl = canvas.getContext(WEBGL, {
        antialias: false,
        depth: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: true
    });

    const program = genProgram(gl, VERTEX, FRAGMENT);
    gl.useProgram(program);

    setXYin(program, gl, "corner_pos", new Int8Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1
    ]));

    setXYin(program, gl, "pixel_pos", new Int8Array([
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,
    ]));

    initTexture(gl);

    return {
        gl,
        uniform: {
            image: gl.getUniformLocation(program, "image"),
            degree: gl.getUniformLocation(program, "degree"),
            exposure: gl.getUniformLocation(program, "exposure"),
            white_point: gl.getUniformLocation(program, "white_point"),
            black_point: gl.getUniformLocation(program, "black_point"),
            highlight_point: gl.getUniformLocation(program, "highlight_point"),
            shadow_point: gl.getUniformLocation(program, "shadow_point"),
            highlight_threshold: gl.getUniformLocation(program, "highlight_threshold"),
            gamma: gl.getUniformLocation(program, "gamma"),
            white_balance: gl.getUniformLocation(program, "white_balance"),
            color_matrix: gl.getUniformLocation(program, "color_matrix")
        }
    }
}

export function render(webgl_instance, img_data, size, rotation, white_balance, color_matrix, pixels_callback) {
    const { gl, uniform } = webgl_instance;
    const [width, height] = size;

    gl.canvas.width = width;
    gl.canvas.height = height;

    gl.viewport(0, 0, width, height);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB16UI, rotation % 180 ? height : width, rotation % 180 ? width : height, 0, gl.RGB_INTEGER, gl.UNSIGNED_SHORT, img_data);

    gl.uniform1f(uniform.degree, rotation);
    gl.uniform1f(uniform.black_point, 0);
    gl.uniform1f(uniform.white_point, 0);
    gl.uniform1f(uniform.highlight_point, 0);
    gl.uniform1f(uniform.shadow_point, 0);
    gl.uniform1f(uniform.highlight_threshold, 0.75);
    gl.uniform1f(uniform.exposure, 0);
    gl.uniform1f(uniform.gamma, 1 / 2.22);
    gl.uniform3fv(uniform.white_balance, [].slice.call(white_balance));
    gl.uniformMatrix3fv(uniform.color_matrix, false, [].slice.call(color_matrix));

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (pixels_callback) {
        const pixels = new Uint8Array(width * height * 4);
        readPixelsAsync(gl, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels).then(x => {
            pixels_callback(x)
        })
    }
}

export function updateUniform(webgl_instance, uniform_fn, uniform_name, data, pixels_callback, timeout, lag) {
    const { gl, uniform } = webgl_instance;

    gl[uniform_fn](uniform[uniform_name], data);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (pixels_callback) {
        const prog = () => {
            const width = gl.canvas.width;
            const height = gl.canvas.height;
            const pixels = new Uint8Array(width * height * 4);
            readPixelsAsync(gl, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels).then(x => {
                pixels_callback(x)
            })
        };
        if (timeout) {
            clearTimeout(timeout);
            return setTimeout(() => {
                prog();
            }, lag);
        } else {
            prog();
        }
    }
}


function clientWaitAsync(gl, sync, flags, interval_ms) {
    return new Promise((resolve, reject) => {
        function test() {
            const res = gl.clientWaitSync(sync, flags, 0);
            if (res === gl.WAIT_FAILED) {
                reject();
                return;
            }
            if (res === gl.TIMEOUT_EXPIRED) {
                setTimeout(test, interval_ms);
                return;
            }
            resolve();
        }
        test();
    });
}

async function getBufferSubDataAsync(gl, target, buffer, srcByteOffset, dstBuffer, dstOffset, length) {
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();

    await clientWaitAsync(gl, sync, 0, 10);
    gl.deleteSync(sync);

    gl.bindBuffer(target, buffer);
    gl.getBufferSubData(target, srcByteOffset, dstBuffer, dstOffset, length);
    gl.bindBuffer(target, null);
}

async function readPixelsAsync(gl, x, y, w, h, format, type, dest) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buf);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, dest.byteLength, gl.STREAM_READ);
    gl.readPixels(x, y, w, h, format, type, 0);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

    await getBufferSubDataAsync(gl, gl.PIXEL_PACK_BUFFER, buf, 0, dest);

    gl.deleteBuffer(buf);
    return dest;
}