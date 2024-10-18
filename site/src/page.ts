export type Page = {
    name : string,
    id: number,
    degrees: string[],
    x_formula: string,
    y_formula: string,
    generators: [number, number, number[], string | null][]
    structure_lines: [[number,number], [number,number], string][]
    differentials: [[number,number], [number,number]][]
}


function formula_function(degrees: string[], formula: string): Function {
    let degree_lets = degrees.map((val, index) => {
        return `let ${val} = degree[${index}];`
    }).join(" ");
    let func_string =  `${degree_lets} return (${formula})`;
    return new Function('s', 'i', 'degree', func_string);
}

export function generate_x_formula(page: Page): Function {
    return formula_function(page.degrees, page.x_formula);
}

export function generate_y_formula(page: Page): Function {
    return formula_function(page.degrees, page.y_formula);
}

export function verify_page(page: Page): boolean {
    return false
} 

export function parse_json(json: string): Page {
    let page: Page = JSON.parse(json);
    return page;
}

export function generate_dot(generator: [number,number, number[]] , x_formula: Function, y_formula: Function) {
    let [s,i,degree] = generator;
    let x = x_formula(s,i,degree);
    let y = y_formula(s,i,degree);

    return `<circle cx="${x}" cy="-${y}" r="0.1"/>`;
}

export function generate_dots(page: Page): string {
    let x_formula = generate_x_formula(page);
    let y_formula = generate_y_formula(page);

    return page.generators.map(x => generate_dot([x[0], x[1], x[2]], x_formula, y_formula)).join("\n");
    
}

export function empty_page(): Page {
    return {
        name: "empty",
        id: 0,
        degrees: [],
        x_formula: "",
        y_formula: "",
        generators: [],
        structure_lines: [],
        differentials: [],
    }   
}

