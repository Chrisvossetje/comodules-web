use std::sync::Arc;

// The wasm-pack uses wasm-bindgen to build and generate JavaScript binding file.
// Import the wasm-bindgen crate.
use wasm_bindgen::prelude::*;
use comodules::{comodule::{self, kcoalgebra::kCoalgebra, kcomodule::kComodule, traits::Comodule}, linalg::{field::{Field, Fp, F2}, flat_matrix::FlatMatrix, grading::Grading, row_matrix::RowMatrix}, resolution::Resolution};


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
pub fn resolve(coalgebra: String, _comodule: String, fp: usize, bigrading: bool, fp_comod: bool, polynomial_coalg: bool, _polynomial_comod: bool, filtration: usize, max_degree: String) -> String {
    match fp {
        2 => {
            type F = F2;
            parse_resolve::<F>(coalgebra, _comodule, bigrading, fp_comod, polynomial_coalg, _polynomial_comod, filtration, max_degree)
        },
        3 => {
            type F = Fp<3>;
            parse_resolve::<F>(coalgebra, _comodule, bigrading, fp_comod, polynomial_coalg, _polynomial_comod, filtration, max_degree)
        },
        5 => {
            type F = Fp<5>;
            parse_resolve::<F>(coalgebra, _comodule, bigrading, fp_comod, polynomial_coalg, _polynomial_comod, filtration, max_degree)
        },
        7 => {
            type F = Fp<7>;
            parse_resolve::<F>(coalgebra, _comodule, bigrading, fp_comod, polynomial_coalg, _polynomial_comod, filtration, max_degree)
        }
        _ => {
            alert("only primes 2,3,5,7 are implemented for now.");
            todo!()
        }

    }
    
}

pub fn parse_resolve<F: Field>(coalgebra: String, _comodule: String, bigrading: bool, fp_comod: bool, polynomial_coalg: bool, _polynomial_comod: bool, filtration: usize, max_degree: String) -> String {
    if bigrading {
        unimplemented!()
    } else {
        let limit = i32::parse(&max_degree).unwrap();
        let (coalg, _translate) = if polynomial_coalg { 
            kCoalgebra::<i32,F2,FlatMatrix<F2>>::parse_polynomial_hopf_algebra(&coalgebra, limit).unwrap() 
        } else {
            kCoalgebra::<i32,F2,FlatMatrix<F2>>::parse_direct(&coalgebra).unwrap()
        };

        let coalg = Arc::new(coalg);

        let comod = if fp_comod {
            kComodule::fp_comodule(coalg)
        } else {
            unimplemented!()
        };

        let mut res = Resolution::new(comod);
        res.resolve_to_s(filtration, limit);
        res.generate_page().to_string()
    }
}