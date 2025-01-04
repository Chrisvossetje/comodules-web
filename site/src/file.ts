import { Chart } from "./chart";
import { parse_json } from "./page";

export function initializeFileLoading(chart: Chart) {
    localjsonpage(chart);
    attachDragAndDrop(chart);
}

function localjsonpage(chart: Chart) {
    fetch("./page.json").then(x => x.text()).then(x => {
        let page = parse_json(x);
        if (page != null) {
            chart.replace_page(page);
        }
    });
}

function attachDragAndDrop(chart: Chart) {
    document.body.addEventListener('dragover', e => {
        e.preventDefault();
        document.body.classList.add('hover');
    });
    
    document.body.addEventListener('drop', e => {
        e.preventDefault();
        document.body.classList.remove('hover');
        handleFile(chart, e.dataTransfer.files[0]);
    });
    
    document.body.addEventListener('dragleave', e => {
        document.body.classList.remove('hover');
    });

    let load_button = document.getElementById("load-json-button-id");
    load_button.onclick = (e) => {
        var input = document.createElement('input');
        input.type = 'file';
        input.onchange = (_) => { 
            var file = input.files[0]; 
            handleFile(chart, file);
        }
        input.click();
    }

    let save_button = document.getElementById("save-json-button-id");
    save_button.onclick = (e) => {
        const str = JSON.stringify(chart.page);
        var a = document.createElement('a');
        a.setAttribute('href', 'data:text/json;charset=uft-8,' + str);
        a.setAttribute('download', "page.json");
        a.style.display = 'none';
        a.click();

        // document.body.appendChild
    }

}


function handleFile(chart: Chart, file: File) {
    if (file.type != "application/json") {
        return;
    }
    file.text().then(x => {
        let page = parse_json(x);
        if (page != null) {
            chart.replace_page(page);
        }
    })
}

