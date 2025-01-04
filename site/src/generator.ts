import katex from "katex";

export function gen_to_name(gen: [number, number, number[], string | null]): string {
    let [s,i,degree] = [gen[0], gen[1], gen[2]];
    let degree_str = degree.map((x) => x.toString()).join(",");
    let name = gen[3] || "x";
    return `${name}_{${s},${degree_str}}^{(${i})}`;
}

export function name_to_element(name: string): HTMLElement {
    let div = document.createElement('div');
    div.id = `latex-${name}`;
    div.className = "generator-math";
    katex.render(name, div, {output: "mathml"});
    return div;
}

export function generated_by_to_element(from: string, to: string[]) : HTMLElement {
    let div = document.createElement('div');
    div.id = `from-${from}-${to.join()}`;
    div.className = "generator-math";
    
    const name = from + " = " + to.join(" + ");
    
    katex.render(name, div, {output: "mathml"});
    return div;
}