const WEBGL = 'webgl2';

const VERTEX = `#version 300 es
    in vec2 corner_coord;
    in vec2 tex_coord;

    uniform mat2 rotation_matrix;

    out vec2 frag_tex_coord;

    void main() {
        vec2 coord = rotation_matrix * corner_coord;

        gl_Position = vec4(coord, 0, 1);
        frag_tex_coord = vec2(tex_coord.x, 1.0 - tex_coord.y);
    }
`;

const FRAGMENT = `#version 300 es
    precision mediump float;

    uniform highp usampler2D image;

    // uniform variables should also be added to (1)webgl_instance.uniform (2)render function for init
    uniform float distortion_mask;
    uniform vec2 distortion;
    uniform vec3 white_balance;
    uniform mat3 color_matrix;
    uniform float gamma;
    uniform float white_point;
    uniform float black_point;
    uniform float highlight_point;
    uniform float shadow_point;
    uniform float vibrance;

    in vec2 frag_tex_coord;
    out vec4 output_color;

    void main() {
        vec2 coord = frag_tex_coord - 0.5;
        vec2 shift_coord = distortion * pow(distance(coord, vec2(0.0)), 2.0);
        vec2 coord_mask = max(vec2(distortion_mask), vec2(pow(abs(coord.y), 1.1), pow(abs(coord.x), 1.1)));
        vec2 k = 1.0 + shift_coord * coord_mask;
        vec2 corrected_coord = coord * k + 0.5;
        vec3 center = vec3(texture(image, corrected_coord).rgb) / 65535.0;

        // color convert
        vec3 colored = clamp(clamp(center * white_balance, 0.0, 1.0) * color_matrix, 0.0, 1.0);

        // gamma 
        vec3 color = pow(max(colored, 0.00001), vec3(gamma)); // gamma 0 fix

        // white level
        color += white_point * smoothstep(vec3(0), vec3(0.33), color);

        // black level
        color += black_point * smoothstep(vec3(1.0), vec3(0.33), color);
    
        // highlight
        color += highlight_point * (vec3(1) - color) * color * color;

        // shadow
        color += shadow_point * (vec3(1) - color) * (vec3(1) - color) * color;

        // vibrance
        float maxval = max(color.r, max(color.g, color.b));
        float minval = min(color.r, min(color.g, color.b));
        float saturation = clamp((maxval - minval) / maxval, 0.0, 1.0);
        vec3 color_pair = (color.brr + color.gbg) * 0.5;
        vec3 saturated = color + (color - color_pair) * vibrance;
        color = mix(saturated, color, saturation);

        output_color = vec4(color, 1.0);
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

    setXYin(program, gl, "tex_coord", new Int8Array([
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
        program,
        uniform: {
            image: gl.getUniformLocation(program, "image"),
            distortion_mask: gl.getUniformLocation(program, "distortion_mask"),
            distortion: gl.getUniformLocation(program, "distortion"),
            rotation_matrix: gl.getUniformLocation(program, "rotation_matrix"),
            white_point: gl.getUniformLocation(program, "white_point"),
            black_point: gl.getUniformLocation(program, "black_point"),
            highlight_point: gl.getUniformLocation(program, "highlight_point"),
            shadow_point: gl.getUniformLocation(program, "shadow_point"),
            vibrance: gl.getUniformLocation(program, "vibrance"),
            gamma: gl.getUniformLocation(program, "gamma"),
            white_balance: gl.getUniformLocation(program, "white_balance"),
            color_matrix: gl.getUniformLocation(program, "color_matrix")
        }
    }
}

function renderWithPixelReading(program, gl, width, height, pixels_callback) {
    setXYin(program, gl, "corner_coord", new Float32Array([
        -.1, -.1,
        .1, -.1,
        -.1, .1,
        -.1, .1,
        .1, -.1,
        .1, .1
    ]), gl.FLOAT);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    const w = parseInt(width * 0.1);
    const h = parseInt(height * 0.1);
    const buffer = new SharedArrayBuffer(w * h * 4);
    const pixels = new Uint8Array(buffer);
    gl.readPixels(width / 2 - w / 2, height / 2 - h / 2, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    setXYin(program, gl, "corner_coord", new Int8Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
    ]));

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    pixels_callback(pixels);
}

export function render(webgl_instance, img_data, size, orientation, white_balance, color_matrix, pixels_callback) {
    const { gl, uniform, program } = webgl_instance;
    const [width, height] = size;

    gl.canvas.width = width;
    gl.canvas.height = height;

    gl.viewport(0, 0, width, height);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB16UI, orientation % 180 ? height : width, orientation % 180 ? width : height, 0, gl.RGB_INTEGER, gl.UNSIGNED_SHORT, img_data);

    const angle = -orientation * Math.PI / 180;
    const sin_of_angle = Math.sin(angle);
    const cos_of_angle = Math.cos(angle);

    gl.uniform1f(uniform.distortion_mask, 0);
    gl.uniform2fv(uniform.distortion, [0, 0]);
    gl.uniformMatrix2fv(uniform.rotation_matrix, false, [cos_of_angle, sin_of_angle, -sin_of_angle, cos_of_angle]);
    gl.uniform1f(uniform.black_point, 0);
    gl.uniform1f(uniform.white_point, 0);
    gl.uniform1f(uniform.highlight_point, 0);
    gl.uniform1f(uniform.shadow_point, 0);
    gl.uniform1f(uniform.gamma, 1 / 2.22);
    gl.uniform1f(uniform.vibrance, 0);
    gl.uniform3fv(uniform.white_balance, [].slice.call(white_balance));
    gl.uniformMatrix3fv(uniform.color_matrix, false, [].slice.call(color_matrix));

    renderWithPixelReading(program, gl, width, height, pixels_callback);
}

export function updateUniform(webgl_instance, uniform_fn, uniform_name, data, pixels_callback) {
    const { gl, uniform, program } = webgl_instance;

    gl[uniform_fn](uniform[uniform_name], data);

    const width = gl.canvas.width;
    const height = gl.canvas.height;

    renderWithPixelReading(program, gl, width, height, pixels_callback);
}
export function updateUniformAllVars(webgl_instance, data, pixels_callback) {
    const { gl, uniform, program } = webgl_instance;

    gl.uniform1f(uniform.distortion_mask, data.distortion_mask);
    gl.uniform2fv(uniform.distortion, data.distortion);
    gl.uniform1f(uniform.black_point, data.black_point);
    gl.uniform1f(uniform.white_point, data.white_point);
    gl.uniform1f(uniform.highlight_point, data.highlight_point);
    gl.uniform1f(uniform.shadow_point, data.shadow_point);
    gl.uniform1f(uniform.gamma, data.gamma);
    gl.uniform1f(uniform.vibrance, data.vibrance);
    gl.uniform3fv(uniform.white_balance, data.white_balance);

    const width = gl.canvas.width;
    const height = gl.canvas.height;

    renderWithPixelReading(program, gl, width, height, pixels_callback);
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

export async function readPixelsAsync(gl, x, y, w, h, format, type, dest) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buf);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, dest.byteLength, gl.STREAM_READ);
    gl.readPixels(x, y, w, h, format, type, 0);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

    await getBufferSubDataAsync(gl, gl.PIXEL_PACK_BUFFER, buf, 0, dest);

    gl.deleteBuffer(buf);
    return dest;
}