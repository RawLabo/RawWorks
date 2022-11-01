const WEBGL = 'webgl2';

const VERTEX = `#version 300 es
    in vec2 corner_pos;
    in vec2 pixel_pos;

    out vec2 frag_pixel_pos;

    void main() {
        gl_Position = vec4(corner_pos, 0, 1);
        frag_pixel_pos = vec2(pixel_pos.x, 1.0 - pixel_pos.y);
    }
`;

const FRAGMENT = `#version 300 es
    precision mediump float;

    uniform mediump usampler2D image;
    uniform vec3 white_balance;
    uniform mat3 color_matrix;

    in vec2 frag_pixel_pos;
    out vec4 output_color;

    void main() {
        vec3 center = vec3(texture(image, frag_pixel_pos).rgb) / 65535.0;

        // color convert
        vec3 colored =  clamp(clamp(center * white_balance, 0.0, 1.0) * color_matrix, 0.0, 1.0);

        // exposure adjustment
        vec3 gamma_corrected = pow(colored, vec3(0.45));
        vec3 exposure_adjusted = min(gamma_corrected, vec3(1.0));

        output_color = vec4(exposure_adjusted, 1.0);
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

export function initWebgl(canvas) {
    const gl = canvas.getContext(WEBGL, {
        antialias: false,
        depth: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false
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
            white_balance: gl.getUniformLocation(program, "white_balance"),
            color_matrix: gl.getUniformLocation(program, "color_matrix")
        }
    }
}

export function render(webgl_instance, img_data, width, height, white_balance, color_matrix, pixels_callback) {
    const { gl, uniform } = webgl_instance;
    gl.canvas.width = width;
    gl.canvas.height = height;

    gl.viewport(0, 0, width, height);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB16UI, width, height, 0, gl.RGB_INTEGER, gl.UNSIGNED_SHORT, img_data);

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