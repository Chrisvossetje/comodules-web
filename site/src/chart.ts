import { line } from "d3";
import { initializeFileLoading } from "./file";
import { StructLineHolder, update_line_styles } from "./lines";
import { empty_page, formula_to_function, generate_x_function, generate_y_function, Page } from "./page";
import { ToStringMap } from "./stringmap";
import { SvgChart } from "./svgchart";
import katex from "katex";
import { gen_to_name, generated_by_to_element, name_to_element } from "./generator";

// [s,i]
type Index = [number, number];
type Point = [number, number];


function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

export class Chart {
    public page: Page;
    public svgchart: SvgChart;

    public formula_degrees: HTMLInputElement;
    public x_formula_input: HTMLInputElement;
    public y_formula_input: HTMLInputElement;

    public generator_div: HTMLElement;
    public generated_by_div: HTMLElement;

    public x_function: Function;
    public y_function: Function;

    public generator_to_location: ToStringMap<Index, Point> = new ToStringMap();
    public location_to_generators: ToStringMap<Point, Index[]> = new ToStringMap();
    public index_to_generator: ToStringMap<Point, [number, number, number[], string | null]> = new ToStringMap();

    public lines_to_style: {[key: string]: string};

    public lines_selector: StructLineHolder[] = [];

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

        this.generator_div = document.getElementById("generator-div");
        this.generated_by_div = document.getElementById("generated-by-div");


        
        this.init_formula_input();
        initializeFileLoading(this);
    }

    private init_formula_input() {
        this.formula_degrees = document.getElementById("formula-degrees") as HTMLInputElement;
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
        this.update_degree_names();
    }

    private update_degree_names() {
        let names = ["s", "i"];
        this.page.degrees.forEach((d) => {
            names.push(d);
        });
        this.formula_degrees.innerHTML = names.join("&nbsp;&nbsp;&nbsp;&nbsp;");;
    }

    unset_focus() {

    }



    set_focus(x: number, y: number) {
        let gens = this.location_to_generators.get([x,y]);
        if (gens !== undefined) {
            // Reset if a gen has been clicked
            this.svgchart.set_node_style(`
                .circle-${x}-${y} {
                    fill: red;
                }
                `);
            // Add a generator element for each thingy
            this.generator_div.innerHTML = "";
            this.generated_by_div.innerHTML = "";
            gens.forEach((gen) => {
                let real_gen = this.index_to_generator.get(gen);
                let name = gen_to_name(real_gen);
                let el = name_to_element(name);
                this.generator_div.appendChild(el);

                this.page.structure_lines.filter((lin) => {
                    return arraysEqual(lin[1], gen);
                }).forEach((lin) => {
                    let from_gen = this.index_to_generator.get(lin[0]);
                    let from_name = gen_to_name(from_gen);
                    let eq = generated_by_to_element(lin[3], from_name, lin[2].toString(), name);
                    this.generated_by_div.appendChild(eq);
                })
            });


        } else {
        }
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

    generate_dot(orx: number, ory: number, x: number, y: number) {
        return `<circle class="circle-${orx}-${ory}" cx="${x}" cy="-${y}" r="0.1"/>`;
    }

    update_x_function(x: string) {
        this.x_formula_input.value = x;
        try {
            this.x_function = formula_to_function(this.page.degrees, x);
        } catch {

        }
    }

    update_y_function(y: string) {
        this.y_formula_input.value = y;
        try {
            this.y_function = formula_to_function(this.page.degrees, y);
        } catch {

        }
    }

    update() {
        let dots = this.update_dots();
        let lines = this.update_lines();

        let x_col = Object.values(this.generator_to_location.map).map(xy => xy[0]);
        let y_col = Object.values(this.generator_to_location.map).map(xy => xy[1]);
        let minx = Math.min(...x_col);
        let maxx = Math.max(...x_col);
        let miny = Math.min(...y_col);
        let maxy = Math.max(...y_col);
        this.svgchart.set_size(minx, maxx, miny, maxy);

        this.svgchart.replace_inner(lines + dots);

    }

    update_dots() {
        this.generator_to_location.clear();
        this.location_to_generators.clear();
    

        let temp: ToStringMap<Point, [Point, [number, number, number[], string][]]>  = new ToStringMap();

        this.page.generators.forEach(el => {
            let real_el: [number,number, number[]] = [el[0], el[1], el[2]];
            let xy = this.get_coordinate(real_el);
            if (temp.has(xy)) {
                temp.get(xy)[1].push(el);
            } else {
                temp.set(xy, [xy,[el]]);
            }
            
            if (this.location_to_generators.has(xy)) {
                this.location_to_generators.get(xy).push([el[0],el[1]]);
            } else {
                this.location_to_generators.set(xy,[[el[0],el[1]]]);
            }
        })

        return Object.values(temp.map).map((el) => {
            let [xy, gen] = el;
            return gen.map((g, index) => {
                let [s,i] = [g[0], g[1]];    
                
                const step = 0.23;
                const offsetmult = -Math.floor((gen.length-1) / 2);
                const x = xy[0] + offsetmult*step + index* step;
                const y = xy[1];
                this.generator_to_location.set([s,i], [x,y]);
                return this.generate_dot(xy[0], xy[1], x,y)
            }).join("\n");
            
        }).join("\n");
    }

    

    update_lines() {
        return this.page.structure_lines.map((line) => {            
            let source = line[0];
            let target = line[1];

            let xy1 = this.generator_to_location.get(source);
            let xy2 = this.generator_to_location.get(target);

            if (xy1 && xy2) {
                let [x1,y1] = xy1;
                let [x2,y2] = xy2;
                return `<line class="struct struct-${line[3]}" x1="${x1}" x2="${x2}" y1="-${y1}" y2="-${y2}" />`
            } else {
                return '';
            }
        }).join("\n");
    }

    update_title() {
        let div = document.getElementById('title-katex');
        div.className = "generator-math";
        katex.render(this.page.name, div, {output: "mathml"});
    }


    // generates elements to change color and or enable certrain struct lines
    build_lines_selectors() {
        let structline_element = document.getElementById("structlines-div");
        structline_element.innerHTML = "";

        this.lines_selector = []
        let build = {};
        this.page.structure_lines.forEach((line) => {
            build[line[3]] = "";
        });

        this.lines_selector = Object.keys(build).map((line_type) =>
           new StructLineHolder(line_type, this)
        );

        console.log(this.lines_selector);
        update_line_styles(this);

    }

    

    replace_page(page: Page) {
        this.page = page;    
        
        this.index_to_generator.clear();
        this.page.generators.forEach((gen) => {
            this.index_to_generator.set([gen[0],gen[1]], gen); 
        });

        
        this.update_x_function(page.x_formula);
        this.update_y_function(page.y_formula);
        
        this.update();    
        this.update_title();
        this.update_degree_names();
        this.build_lines_selectors();
    }  

}

