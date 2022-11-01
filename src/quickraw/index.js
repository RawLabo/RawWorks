import { initWebgl, render } from './webgl'
import init, * as quickraw from './quickraw'
init()

export function disposeWasm() {
    init(init.__wbindgen_wasm_module);
}

export { quickraw, initWebgl, render };