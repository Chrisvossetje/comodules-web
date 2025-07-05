use std::sync::Arc;

// The wasm-pack uses wasm-bindgen to build and generate JavaScript binding file.
// Import the wasm-bindgen crate.
use wasm_bindgen::prelude::*;
use comodules::{comodule::{self, kcoalgebra::kCoalgebra, kcomodule::kComodule, traits::Comodule}, linalg::{field::{Field, Fp, F2}, flat_matrix::FlatMatrix, grading::{BiGrading, Grading}, row_matrix::RowMatrix}, resolution::Resolution};


#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
    pub fn log(s: &str);
}

#[wasm_bindgen]
pub fn a0() -> String {
    type F = F2;
    type G = i32;
    type M = kComodule<i32,F,RowMatrix<F>>; 

    
    let coalg = Arc::new(comodule::kcoalgebra::A0_coalgebra());
    
    let fp = comodule::kcomodule::kComodule::fp_comodule(coalg.clone());
    
    let mut res = Resolution::new(fp);
    res.resolve_to_s(20, 20);



    res.generate_sseq("A(0)").to_string()
}

#[wasm_bindgen]
pub fn resolve(name: String, coalgebra: String, comodule: String, fp: usize, bigrading: bool, fp_comod: bool, filtration: usize, max_degree: String) -> String {
    let resolve = match fp {
        2 => {
            type F = F2;
            field_resolve::<F>(name, coalgebra, comodule, bigrading, fp_comod, filtration, max_degree)
        },
        3 => {
            type F = Fp<3>;
            field_resolve::<F>(name, coalgebra, comodule, bigrading, fp_comod, filtration, max_degree)
        },
        5 => {
            type F = Fp<5>;
            field_resolve::<F>(name, coalgebra, comodule, bigrading, fp_comod, filtration, max_degree)
        },
        7 => {
            type F = Fp<7>;
            field_resolve::<F>(name, coalgebra, comodule, bigrading, fp_comod, filtration, max_degree)
        }
        _ => {
            alert("only primes 2,3,5,7 are implemented for now.");
            todo!()
        }
    };
    resolve.unwrap_or_else(|e| {
        alert(&e);
        panic!()
    })
}

pub fn field_resolve<F: Field>(name: String, coalgebra: String, comodule: String, bigrading: bool, fp_comod: bool, filtration: usize, max_degree: String) -> Result<String, String> {
    if bigrading {
        let limit = BiGrading::parse(&max_degree)?;
        field_grade_resolve::<F,BiGrading>(name, coalgebra, comodule, fp_comod, filtration, limit)
    } else {
        let limit = i32::parse(&max_degree)?;
        field_grade_resolve::<F,i32>(name, coalgebra, comodule, fp_comod, filtration, limit)
    }
}

pub fn field_grade_resolve<F: Field, G: Grading>(name: String, coalgebra: String, comodule: String, fp_comod: bool, filtration: usize, max_degree: G) -> Result<String, String> {
    let (coalg, translate) = kCoalgebra::<G,F2,FlatMatrix<F2>>::parse(&coalgebra, max_degree)?;

    let coalg = Arc::new(coalg);

    let comod = if fp_comod {
        kComodule::fp_comodule(coalg)
    } else {
        kComodule::<G,F2,FlatMatrix<F2>>::parse(&comodule, coalg, &translate, max_degree)?
    };

    let mut res = Resolution::new(comod);
    res.resolve_to_s(filtration, max_degree);
    let mut sseq = res.generate_sseq(&name);
    sseq.name = name;
    Ok(sseq.to_string())
}