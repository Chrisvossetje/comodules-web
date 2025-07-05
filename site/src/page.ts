export type SSeq = {
    name : string,

    degrees: string[],
    x_formula: string,
    y_formula: string,

    pages: Page[],

    // [source, target, d_r]   
    differentials: [[number,number], [number,number], number, ][]
}


export type Page = {
    // E_r
    id: number,

    // We require (s,id) to be unique
    // [s id degrees (name)]   
    generators: [number, number, number[], string | null][]
    
    // [source, target, scalar, name]   
    structure_lines: [[number,number], [number,number], number, string][]
}


export function formula_to_function(degrees: string[], formula: string): Function {
    let degree_lets = degrees.map((val, index) => {
        return `let ${val} = degree[${index}];`
    }).join(" ");
    let func_string =  `${degree_lets} return (${formula})`;
    return new Function('s', 'i', 'degree', func_string);
}

export function generate_x_function(sseq: SSeq): Function {
    return formula_to_function(sseq.degrees, sseq.x_formula);
}

export function generate_y_function(sseq: SSeq): Function {
    return formula_to_function(sseq.degrees, sseq.y_formula);
}

export function verify_page(page: Page): boolean {
    return false
} 

export function parse_json(json: string): SSeq {
    let sseq: SSeq = JSON.parse(json);
    return sseq;
}


export function empty_page(): Page {
    return {
        id: 0,
        generators: [],
        structure_lines: [],
    }   
}

export function empty_sseq(): SSeq {
    return {
        name: "empty",
        degrees: [],
        x_formula: "0",
        y_formula: "0",
        pages: [empty_page()],
        differentials: [],
    }   
}

