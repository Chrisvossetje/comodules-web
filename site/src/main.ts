import { empty_page, generate_dots, Page, parse_json } from "./page";
import { SvgChart } from "./svgchart";

let chart = new SvgChart();

document.getElementById("visualizer").prepend(chart);


let page: Page = empty_page();
fetch("page.json").then(x => x.text()).then(x => {
    page = parse_json(x)
    // let dots = 
    chart.replaceInner(generate_dots(page));
    chart.addEventListener('clickinner', e => console.log("i know what i am!"));
    console.log(chart)
    console.log()
});

