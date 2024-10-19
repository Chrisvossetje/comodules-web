import katex from "katex";
import { Chart } from "./chart";


function line_element(id: string) : string {
    return `<div id="structlines-${id}" style="display: flex; padding-left: 20px; padding-right: 20px; align-items: center;">
    <div style="flex: 1;"></div>
    <div id="structlinesp-${id}" style="flex: 2; margin: 0px;"></div>
    <input id="structlinesswitch-${id}" type="checkbox" role="switch" checked> 
    <div style="flex: 1;"></div>
    <input id="structlinescolor-${id}" type="color" style="width: 80px; margin: 0px;">
    <div style="flex: 1;"></div>
</div>`
}

export function update_line_styles(chart: Chart) {
    let styles = chart.lines_selector.map((x) => x.get_style()).join("\n");
    chart.svgchart.set_line_style(styles);
}

export class StructLineHolder {
    public p: HTMLElement;
    public toggle: HTMLInputElement;
    public color: HTMLInputElement

    public toggle_call: Function;
    public color_call: Function;

    public line_type: string;
    public chart: Chart;

    constructor(line_type: string, chart: Chart) {
        this.line_type = line_type;

        let structline_element = document.getElementById("structlines-div");
        let div = document.createElement('div');
        div.innerHTML = line_element(line_type);
        structline_element.appendChild(div);

        this.p = document.getElementById(`structlinesp-${line_type}`);
        katex.render(line_type, this.p, {output: "mathml"});

        this.toggle = document.getElementById(`structlinesswitch-${line_type}`) as HTMLInputElement;
        this.color = document.getElementById(`structlinescolor-${line_type}`) as HTMLInputElement;
            
        this.toggle.addEventListener('change' ,(e) =>  {
            update_line_styles(chart);
        });
        this.color.addEventListener('change' ,(e) =>  {
            update_line_styles(chart);
        });
    }

    public get_style(): string {
        let display = this.toggle.checked ? "initial" : " none";
        return `.struct-${this.line_type} {
            stroke: ${this.color.value};
            display: ${display};
        }`
    }
    

}
