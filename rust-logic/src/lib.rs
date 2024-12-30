use std::sync::Arc;

// The wasm-pack uses wasm-bindgen to build and generate JavaScript binding file.
// Import the wasm-bindgen crate.
use wasm_bindgen::prelude::*;
use comodules::{comodule::{self, kcoalgebra::kCoalgebra, kcomodule::kComodule, kmorphism::kComoduleMorphism, traits::{Comodule, ComoduleMorphism}}, linalg::{field::{Field, Fp, F2}, flat_matrix::FlatMatrix, grading::Grading, matrix::Matrix, row_matrix::RowMatrix}, resolution::Resolution};


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



    res.generate_page().to_string()
}

#[wasm_bindgen]
pub fn resolve(coalgebra: String, comodule: String, fp: usize, bigrading: bool, fp_comod: bool, polynomial_coalg: bool, polynomial_comod: bool, filtration: usize, max_degree: String) -> String {
    match fp {
        2 => {
            if bigrading {
                unimplemented!()
            } else {
                let limit = i32::parse(&max_degree).unwrap();
                let (coalg, translate) = if polynomial_coalg { 
                    kCoalgebra::<i32,F2,FlatMatrix<F2>>::parse_polynomial_hopf_algebra(&coalgebra, limit).unwrap() 
                } else {
                    kCoalgebra::<i32,F2,FlatMatrix<F2>>::parse_direct(&coalgebra).unwrap()
                };
        
                let coalg = Arc::new(coalg);

                log(&format!("{:?}", coalg.space));
                
                let comod = if fp_comod {
                    kComodule::fp_comodule(coalg)
                } else {
                    unimplemented!()
                };
                log(&format!("{:?}", comod.space));
                
                let mut res = Resolution::new(comod);
                res.resolve_to_s(filtration, limit);
                res.generate_page().to_string()
            }
        },
        _ => {
            todo!()
        }
    }
    
}