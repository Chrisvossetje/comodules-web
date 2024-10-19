export type Page = {
    name : string,
    id: number,
    degrees: string[],
    x_formula: string,
    y_formula: string,
    generators: [number, number, number[], string | null][]
    structure_lines: [[number,number], [number,number], number, string][]
    differentials: [[number,number], [number,number]][]
}


export function formula_to_function(degrees: string[], formula: string): Function {
    let degree_lets = degrees.map((val, index) => {
        return `let ${val} = degree[${index}];`
    }).join(" ");
    let func_string =  `${degree_lets} return (${formula})`;
    return new Function('s', 'i', 'degree', func_string);
}

export function generate_x_function(page: Page): Function {
    return formula_to_function(page.degrees, page.x_formula);
}

export function generate_y_function(page: Page): Function {
    return formula_to_function(page.degrees, page.y_formula);
}

export function verify_page(page: Page): boolean {
    return false
} 

export function parse_json(json: string): Page {
    let page: Page = JSON.parse(json);
    return page;
}

export function empty_page(): Page {
    return {
        name: "empty",
        id: 0,
        degrees: [],
        x_formula: "0",
        y_formula: "0",
        generators: [],
        structure_lines: [],
        differentials: [],
    }   
}

