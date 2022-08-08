use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

extern crate unicode_segmentation;
use unicode_segmentation::UnicodeSegmentation;

use unicode_linebreak::{
    linebreaks, BreakOpportunity,
    BreakOpportunity::{Allowed, Mandatory},
};

#[wasm_bindgen]
pub fn breakText(text: &str, max_width: u16, font_style: &str, max_lines: u16) -> f64 {
    let document = web_sys::window().unwrap().document().unwrap();
    let canvas = document.create_element("canvas").unwrap();
    let canvas: web_sys::HtmlCanvasElement = canvas
        .dyn_into::<web_sys::HtmlCanvasElement>()
        .map_err(|_| ())
        .unwrap();
    canvas.set_width(200);
    canvas.set_height(200);

    let context = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<web_sys::CanvasRenderingContext2d>()
        .unwrap();
    context.set_font(font_style);

    let breaks: Vec<(usize, BreakOpportunity)> = linebreaks(text).collect();
    println!("breaks : {:#?}", breaks);
    let graphemes: Vec<(usize, &str)> = UnicodeSegmentation::grapheme_indices(text, true).collect();
    println!("graphemes : {:#?}", graphemes);

    return context.measure_text(text).unwrap().width();
}
