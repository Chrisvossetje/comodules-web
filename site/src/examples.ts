import { Chart } from "./chart";
import { Page } from "./page";

type Example = {
    name: string,
    coalgebra: string, 
    comodule: string, 
    bigrading: boolean, 
    fp_comod: boolean, 
    filtration: number, 
    max_degree: string
}

export function initialize_examples() {
    (document.getElementById("examples-dropdown-id") as HTMLSelectElement).onchange = (_) => {
        let index = Number((document.getElementById("examples-dropdown-id") as HTMLSelectElement).value);
        set_example_from_index(index);
    };

    const html = `<option selected disabled value=-1>Examples</option>` + 
    examples.map((x,index) => {
        return `<option value=${index}>${x.name}</option>`
    }).join("");

    (document.getElementById("examples-dropdown-id") as HTMLInputElement).innerHTML = html;
}

export function set_example_from_index(index: number) {
    let ex = examples[index];
    select_example(ex);
}

function select_example(example: Example) {
    (document.getElementById("name-input-id") as HTMLInputElement).value = example.name;
    (document.getElementById("coalg-input-id") as HTMLInputElement).value = example.coalgebra;
    
    (document.getElementById("comod-input-id") as HTMLInputElement).value = example.comodule;
    
    (document.getElementById("fp-comodule-id") as HTMLInputElement).checked = example.fp_comod;

    // (document.getElementById("bigraded-id") as HTMLInputElement).checked = example.bigrading;
    
    (document.getElementById("filtration-max-id") as HTMLInputElement).value = example.filtration.toString();
    (document.getElementById("comod-stem-id") as HTMLInputElement).value = example.max_degree;
    
}



const A0: Example = {
    name: "A(0)_2",
    coalgebra: `- FIELD
2

- BASIS
1: 0
xi1: 1

- COACTION
1: 1|1 
xi1: 1|xi1 + xi1|1
`,
    comodule: "",
    bigrading: false,
    fp_comod: true,
    filtration: 20,
    max_degree: "40"
}

const A1: Example = {
    name: "A(1)_2",
    coalgebra: `- FIELD
2

- GENERATOR
xi1: 1
xi2: 3

- RELATION
xi1^4
xi2^2


- COACTION
xi1: 1|xi1 + xi1|1
xi2: 1|xi2 + xi2|1 + xi1^2|xi1 
`,
    comodule: "",
    bigrading: false,
    fp_comod: true,
    filtration: 20,
    max_degree: "40"
}







const examples = [A0, A1];
