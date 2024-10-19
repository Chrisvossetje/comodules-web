import { initializeFileLoading } from "./file";
import { empty_page, formula_to_function, generate_x_function, generate_y_function, Page } from "./page";
import { ToStringMap } from "./stringmap";
import { SvgChart } from "./svgchart";

// [s,i]
type Index = [number, number];
type Point = [number, number];

export class Chart {
    public page: Page;
    public svgchart: SvgChart;

    public x_formula_input: HTMLInputElement;
    public y_formula_input: HTMLInputElement;

    public x_function: Function;
    public y_function: Function;

    public generator_to_location: ToStringMap<Index, Point> = new ToStringMap();
    public location_to_generators: ToStringMap<Point, Index> = new ToStringMap();

    constructor() {
        this.page = empty_page();
 
        this.svgchart = new SvgChart();
        document.getElementById("svgchart").append(this.svgchart);
        this.svgchart.addEventListener('clickinner', (e) => {
            // Do the following to make linter happy :)
            // Because svgchart.ts does not expose correct types we do this.
            type ChartEvent = {
                chartX: number,
                chartY: number,
            }
            let xy = e as unknown as ChartEvent;
            this.set_focus(xy.chartX, xy.chartY);
        })


        
        this.init_formula_input();
        initializeFileLoading(this);
    }

    private init_formula_input() {
        this.x_formula_input = document.getElementById("x-formula-input-id") as HTMLInputElement;
        this.y_formula_input = document.getElementById("y-formula-input-id") as HTMLInputElement;
        this.x_formula_input.addEventListener('input', (e) => {
            this.update_x_function(this.x_formula_input.value);
            this.update();
        });
        this.y_formula_input.addEventListener('input', (e) => {
            this.update_y_function(this.y_formula_input.value);
            this.update();
        });
    }

    unset_focus() {

    }

    set_focus(x: number, y: number) {
        console.log("Set focus on: ", x, y);
    }

    get_coordinate(generator: [number,number, number[]]): [number,number] {
        let [s,i,degree] = generator;
        try {
            let x = this.x_function(s,i,degree);
            let y = this.y_function(s,i,degree);
            return [x,y]
        } catch {
            throw "A formula is invalid";
        }
    }

    generate_dot(generator: [number,number, number[]]) {
        let [x,y] = this.get_coordinate(generator);
        return `<circle cx="${x}" cy="-${y}" r="0.1"/>`;
    }

    public update_x_function(x: string) {
        this.x_formula_input.value = x;
        try {
            this.x_function = formula_to_function(this.page.degrees, x);
        } catch {

        }
    }

    public update_y_function(y: string) {
        this.y_formula_input.value = y;
        try {
            this.y_function = formula_to_function(this.page.degrees, y);
        } catch {

        }
    }

    public update() {
        let dots = this.update_dots();
        let lines = this.update_lines();
        this.svgchart.replace_inner(lines + dots);

    }

    public update_dots() {
        this.generator_to_location.clear();
    
        return this.page.generators.map(el => {
            let real_el: [number,number, number[]] = [el[0], el[1], el[2]];
            let [x,y] = this.get_coordinate(real_el);
            this.generator_to_location.set([el[0],el[1]], [x,y]);
            return this.generate_dot(real_el)
        }).join("\n");
    }

    public update_lines() {
        return this.page.structure_lines.map((line) => {            
            let source = line[0];
            let target = line[1];

            let xy1 = this.generator_to_location.get(source);
            let xy2 = this.generator_to_location.get(target);

            if (xy1 && xy2) {
                let [x1,y1] = xy1;
                let [x2,y2] = xy2;
                return `<line class="struct" x1="${x1}" x2="${x2}" y1="-${y1}" y2="-${y2}" />`
            } else {
                return '';
            }
        }).join("\n");
    }
    
    public replace_page(page: Page) {
        this.page = page;    
        this.update_x_function(page.x_formula);
        this.update_y_function(page.y_formula);
        
        this.update();    
    }  

}

