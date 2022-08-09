use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

extern crate unicode_segmentation;
use unicode_segmentation::UnicodeSegmentation;

use unicode_linebreak::{
    linebreaks, BreakOpportunity,
    BreakOpportunity::{Allowed, Mandatory},
};

#[wasm_bindgen]
pub fn break_text(text: &str, max_width: u16, font_style: &str, max_lines: u16) -> js_sys::Array {
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
    let graphemes: Vec<(usize, &str)> = UnicodeSegmentation::grapheme_indices(text, true).collect();
    let result: js_sys::Array = js_sys::Array::new();
    for grapheme in graphemes {
        let arr: js_sys::Array = js_sys::Array::new();
        arr.push(&JsValue::from_str(grapheme.1));
        arr.push(&JsValue::from_f64(
            context.measure_text(&grapheme.1).unwrap().width() as f64,
        ));
        result.push(&arr);
    }
    return result;
}
