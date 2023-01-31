<template>
  <div ref="container" class="container flex-center" @wheel="zoom" @touchstart="moveStart" @touchmove="move"
    @touchend="moveEnd" @mousedown="moveStart" @mousemove="move" @mouseup="moveEnd" @mouseleave="moveEnd"
    @dblclick="zoom($event, 1)">
    <canvas v-if="img" :data-filename="filename" class="selected" :key="canvas_key" ref="canvas" :style="{
      height: height < 0 ? 'auto' : height + 'px',
      transform: `translate(${left_offset}px, ${top_offset}px)`,
      transition,
    }"></canvas>
    <div class="tip" v-if="img">{{ Math.round(tip.scale * 100) }}%</div>
    <button :class="{ 'edit-btn': true, reverse: ui_edit_reverse }"
      @click="$emit('toggle_control'); ui_edit_reverse = !ui_edit_reverse">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
          d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256S114.6 512 256 512s256-114.6 256-256zM215 127c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-71 71L392 232c13.3 0 24 10.7 24 24s-10.7 24-24 24l-214.1 0 71 71c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L103 273c-9.4-9.4-9.4-24.6 0-33.9L215 127z" />
      </svg>
    </button>
  </div>
</template>

<script>
import { initWebgl, render } from "../webgl";

let move_prev_pos = null;
let touch_zoom_start = null;

function get_distance_of_touches(touches) {
  const [[x1, y1], [x2, y2]] = [[touches[0].clientX, touches[0].clientY], [touches[1].clientX, touches[1].clientY]];
  return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
}

export default {
  props: ['img', 'filename'],
  methods: {
    updateHeightAlso(p1) {
      if (p1 == 'width') {
        this.height = this[p1] / this.img_info.ratio;
      }
    },
    zoom(e, toggle_to_x) {
      if (e.preventDefault)
        e.preventDefault();

      const container = this.$refs.container;
      const canvas = this.$refs.canvas;
      const [p1, p2] = this.scale_params;

      // double click toggle from fit to 100%
      if (toggle_to_x == 1 && this[p1] == this.img_info[p1]) {
        this[p1] = container[p2];
        this.updateHeightAlso(p1);
        this.left_offset = 0;
        this.top_offset = 0;
        this.tip.scale = this[p1] / this.img_info[p1];
        return;
      }

      const delta_y = e.delta_distance ? e.delta_distance / 100 : toggle_to_x ? this.img_info[p1] * toggle_to_x - this[p1] : -e.deltaY;

      this[p1] += delta_y;
      this.updateHeightAlso(p1);

      // prepare points
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

      // calc new offsets
      this.left_offset -=
        (scales[0] * (zoom_point[0] - img_center_point[0])) /
        canvas.clientWidth;
      this.top_offset -=
        (scales[1] * (zoom_point[1] - img_center_point[1])) /
        canvas.clientHeight;

      this.checkCanvasTransform();
    },
    moveStart(e) {
      this.$emit('toggle_control', true);
      this.ui_edit_reverse = false;

      if (e.touches) {
        if (e.touches.length > 2)
          return;
        if (e.touches.length === 2) {
          touch_zoom_start = e.touches;
          return;
        }

        e = e.touches[0];
      }

      move_prev_pos = [e.clientX, e.clientY];
    },
    move(e) {
      e.preventDefault();
      
      if (e.touches) {
        if (e.touches.length > 2)
          return;
        if (e.touches.length === 2) {
          const start_distance = get_distance_of_touches(touch_zoom_start);
          const curr_distance = get_distance_of_touches(e.touches);

          const [p1, p2] = touch_zoom_start;
          const evt = {
            delta_distance: curr_distance - start_distance,
            pageX: (p1.pageX + p2.pageX) >> 1,
            pageY: (p1.pageY + p2.pageY) >> 1
          };

          if (evt.delta_distance)
            this.zoom(evt);

          touch_zoom_start = e.touches;
          return;
        }

        e = e.touches[0];
      }

      if (move_prev_pos) {
        this.left_offset += e.clientX - move_prev_pos[0];
        this.top_offset += e.clientY - move_prev_pos[1];
        move_prev_pos = [e.clientX, e.clientY];

        this.checkCanvasTransform();
      }
    },
    moveEnd() {
      touch_zoom_start = null;
      move_prev_pos = null;
    },
    checkCanvasTransform() {
      if (!this.img_info.width) return;

      const container = this.$refs.container;
      const [p1, p2] = this.scale_params;

      // fit size limit
      if (this[p1] <= container[p2]) {
        this[p1] = container[p2];
        this.updateHeightAlso(p1);

        this.left_offset = 0;
        this.top_offset = 0;
        this.transition = "transform ease 0.3s";
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
    }
  },
  data() {
    return {
      ui_edit_reverse: false,
      canvas_key: 0,
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
      if (!img) {
        this.$refs.canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext();
        return;
      };

      const container_width = this.$refs.container.clientWidth;
      const container_height = this.$refs.container.clientHeight;

      this.resetCanvasTransform();

      const orientation = img.orientation;
      const width = orientation % 180 ? img.height : img.width;
      const height = orientation % 180 ? img.width : img.height;

      const white_balance = img.white_balance;
      const color_matrix = img.color_matrix;
      const img_data = img.data;
      delete img.data; // free image memory

      this.img_info.width = width / window.devicePixelRatio;
      this.img_info.height = height / window.devicePixelRatio;
      this.img_info.ratio = width / height;
      this.scale_params =
        container_width / container_height < width / height
          ? ["width", "clientWidth"]
          : ["height", "clientHeight"];
      this.checkCanvasTransform();

      this.canvas_key += 1;
      this.$nextTick(() => {
        const webgl_instance = initWebgl(this.$refs.canvas, width, height);
        render(
          webgl_instance,
          img_data,
          [width, height],
          orientation,
          white_balance,
          color_matrix,
          (pixels) => {
            window.sendToWorker('calc_histogram', pixels).then(data => {
              this.$emit("histogram_load", data, webgl_instance);
            });
          }
        );
        window.timer.rendered = performance.now();
      });
    },
  },
  mounted() {
    window.addEventListener("resize", () => {
      this.checkCanvasTransform();
    });

    window.addEventListener("keyup", e => {
      if (e.key >= 1 && e.key <= 8) {
        const container = this.$refs.container;
        const mod_e = {};
        Object.assign(mod_e, e);
        mod_e.pageX = container.offsetLeft + container.clientWidth / 2;
        mod_e.pageY = container.offsetTop + container.clientHeight / 2;
        this.zoom(mod_e, parseInt(e.key));
      }
    });
  },
};
</script>

<style scoped>
@media only screen and (max-width: 600px) {
  body .edit-btn {
    display: block;
    width: 16px;
    height: 16px;
    fill: #aaaa;
  }
}

.edit-btn {
  display: none;
  position: absolute;
  bottom: 2px;
  right: 2px;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: transform ease 0.2s;
}

.edit-btn.reverse {
  transform: rotate(180deg);
}

canvas {
  image-rendering: pixelated;
}

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
  text-shadow: 0 0 2px #111;
}
</style>
