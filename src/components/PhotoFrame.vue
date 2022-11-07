<template>
  <div ref="container" class="container flex-center" @wheel="zoom" @mousedown="moveStart" @mousemove="move"
    @mouseup="moveEnd" @mouseleave="moveEnd" @dblclick="zoom100">
    <canvas :data-filename="filename" class="selected" :key="canvas_key" ref="canvas" :style="{
      width: width < 0 ? 'auto' : width + 'px',
      height: height < 0 ? 'auto' : height + 'px',
      transform: `translate(${left_offset}px, ${top_offset}px)`,
      transition,
    }"></canvas>
    <div class="tip">{{ Math.round(tip.scale * 100) }}%</div>
  </div>
</template>

<script>
import { quickraw, initWebgl, render, disposeWasm } from "../quickraw";

let move_prev_pos = null;

export default {
  props: ['img', 'filename'],
  methods: {
    zoom100(e) {
      this.zoom(e, true);
    },
    zoom(e, toggle_100) {
      const container = this.$refs.container;
      const canvas = this.$refs.canvas;
      const [p1, p2] = this.scale_params;

      if (toggle_100 && this[p1] == this.img_info[p1]) {
        this[p1] = container[p2];
        this.left_offset = 0;
        this.top_offset = 0;
        return;
      }

      const delta_y = toggle_100 ? this.img_info[p1] - this[p1] : -e.deltaY;

      this[p1] += delta_y;

      const scales =
        p1 == "width"
          ? [delta_y, delta_y / this.img_info.ratio]
          : [delta_y * this.img_info.ratio, delta_y];
      const zoom_point = [
        e.pageX - container.offsetLeft,
        e.pageY - container.offsetTop,
      ];
      const img_center_point = [
        container.clientWidth / 2 + this.left_offset,
        container.clientHeight / 2 + this.top_offset,
      ];
      this.left_offset -=
        (scales[0] * (zoom_point[0] - img_center_point[0])) /
        canvas.clientWidth;
      this.top_offset -=
        (scales[1] * (zoom_point[1] - img_center_point[1])) /
        canvas.clientHeight;

      this.checkCanvasTransform();
    },
    moveStart(e) {
      move_prev_pos = [e.clientX, e.clientY];
    },
    move(e) {
      if (move_prev_pos) {
        this.left_offset += e.clientX - move_prev_pos[0];
        this.top_offset += e.clientY - move_prev_pos[1];
        move_prev_pos = [e.clientX, e.clientY];

        this.checkCanvasTransform();
      }
    },
    moveEnd(e) {
      move_prev_pos = null;
    },
    checkCanvasTransform() {
      if (!this.img_info.width) return;

      const container = this.$refs.container;
      const [p1, p2] = this.scale_params;

      // size limit
      if (this[p1] <= container[p2]) {
        this[p1] = container[p2];
        this.left_offset = 0;
        this.top_offset = 0;
        this.transition = "transform 0.3s";
        setTimeout(() => {
          this.transition = "";
        }, 300);
      }

      this.tip.scale = this[p1] / this.img_info[p1];
    },
    resetCanvasTransform() {
      this.scale_params = [];
      this.width = -1;
      this.height = -1;
      this.left_offset = 0;
      this.top_offset = 0;
      this.tip.scale = 0;
    },
  },
  data() {
    return {
      canvas_key: 0,
      webgl_instance: null,
      img_info: {
        width: 0,
        height: 0,
        ratio: 0,
      },
      scale_params: [],
      width: -1,
      height: -1,
      left_offset: 0,
      top_offset: 0,
      transition: "",
      tip: {
        scale: 0,
      },
    };
  },
  watch: {
    img(img) {
      const container_width = this.$refs.container.clientWidth;
      const container_height = this.$refs.container.clientHeight;

      this.resetCanvasTransform();

      const rotation = img.rotation;
      const width = rotation % 180 ? img.height : img.width;
      const height = rotation % 180 ? img.width : img.height;
      
      const white_balance = img.wb;
      const color_matrix = img.color_matrix;
      const img_data = img.data;

      this.img_info.width = width;
      this.img_info.height = height;
      this.img_info.ratio = width / height;
      this.scale_params =
        container_width / container_height < width / height
          ? ["width", "clientWidth"]
          : ["height", "clientHeight"];
      this.checkCanvasTransform();

      const render_fn = () => {
        if (this.canvas_key) {
          this.webgl_instance = initWebgl(this.$refs.canvas, width, height);
        }

        render(
          this.webgl_instance,
          img_data,
          [width, height],
          rotation,
          white_balance,
          color_matrix,
          (pixels) => {
            window.timer.pixels_read = performance.now();
            const histogram_data = quickraw.calc_histogram(pixels);
            window.timer.histogram_calced = performance.now();

            disposeWasm();

            this.$emit("histogram_load", histogram_data, this.webgl_instance);
          }
        );
        window.timer.rendered = performance.now();
      };

      if (window.chrome) {
        this.canvas_key += 1; // fix large photo rendering issue in chromium based browsers
        this.$nextTick(render_fn);
      } else {
        render_fn();
      }
    },
  },
  mounted() {
    this.webgl_instance = initWebgl(this.$refs.canvas);

    window.addEventListener("resize", () => {
      this.checkCanvasTransform();
    });
  },
};
</script>

<style scoped>
.container {
  position: relative;
  background: #111;
  overflow: hidden;
}

.tip {
  position: absolute;
  bottom: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 4px 8px;
  cursor: default;
}
</style>
