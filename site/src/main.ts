import { Chart } from "./chart";

import init, { a0, resolve } from "../pkg/rust_logic.js";
import { parse_json } from "./page";


let chart = new Chart();



const initWasm = async () => {
    // Instantiate our wasm module
    await init("./pkg/rust_logic_bg.wasm");
};
 

document.getElementById("resolve-view-id").onclick = (e) => {
    switch_view()
};

let resolve_display = false;
function switch_view() {
    resolve_display = !resolve_display;
    if (resolve_display) {
        document.getElementById("inner_resolve").style.display = "";
        document.getElementById("inner_visualizer").style.display = "none";
    } else {
        document.getElementById("inner_resolve").style.display = "none";
        document.getElementById("inner_visualizer").style.display = "";
        chart.update();
    }
}

document.getElementById("resolve-id").onclick = async (e) => {
    const coalg = (document.getElementById("coalg-input-id") as HTMLInputElement).value;
    
    const comod = (document.getElementById("comod-input-id") as HTMLInputElement).value;
    
    let field_str = coalg.split("\n")[1];

    const field = Number(field_str);
    const poly_coalg = Boolean((document.getElementById("polynomial-coalg-id") as HTMLInputElement).checked);
    const fp_comod = Boolean((document.getElementById("fp-comodule-id") as HTMLInputElement).checked);
    
    const filt_max = Number((document.getElementById("filtration-max-id") as HTMLInputElement).value);
    const comod_stem = (document.getElementById("comod-stem-id") as HTMLInputElement).value;
    
    const page = resolve(coalg,comod, field, false, fp_comod, poly_coalg, false, filt_max, comod_stem);

    chart.replace_page(parse_json(page));

    if (resolve_display) {switch_view()} 
};



initWasm();