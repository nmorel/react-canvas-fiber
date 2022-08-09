use wasm_bindgen_test::wasm_bindgen_test_configure;

wasm_bindgen_test_configure!(run_in_browser);

use rust_text_breaker::break_text;
use wasm_bindgen::prelude::*;
use wasm_bindgen_test::*;

#[wasm_bindgen_test]
fn test() {
    let graphemes = break_text(
        "😈👿👹👺🤡💩👻💀Hello World !👽👾🤖🎃😺😹😻😼😽👪",
        16,
        "10px sans-serif",
        2,
    );

    fn assert_grapheme(value: JsValue, grapheme: &str, expected_width: f64) {
        let arr = js_sys::Array::from(&value);
        assert_eq!(arr.at(0), grapheme);
        assert_eq!(arr.at(1), expected_width);
    }

    assert_grapheme(graphemes.at(0), "😈", 13.0);
    assert_grapheme(graphemes.at(1), "👿", 13.0);
    assert_grapheme(graphemes.at(2), "👹", 13.0);
    assert_grapheme(graphemes.at(3), "👺", 13.0);
    assert_grapheme(graphemes.at(4), "🤡", 13.0);
    assert_grapheme(graphemes.at(5), "💩", 13.0);
    assert_grapheme(graphemes.at(6), "👻", 13.0);
    assert_grapheme(graphemes.at(7), "💀", 13.0);
    assert_grapheme(graphemes.at(8), "H", 7.2216796875);
    assert_grapheme(graphemes.at(9), "e", 5.5615234375);
    assert_grapheme(graphemes.at(10), "l", 2.2216796875);
    assert_grapheme(graphemes.at(11), "l", 2.2216796875);
    assert_grapheme(graphemes.at(12), "o", 5.5615234375);
    assert_grapheme(graphemes.at(13), " ", 2.7783203125);
    assert_grapheme(graphemes.at(14), "W", 9.4384765625);
    assert_grapheme(graphemes.at(15), "o", 5.5615234375);
    assert_grapheme(graphemes.at(16), "r", 3.330078125);
    assert_grapheme(graphemes.at(17), "l", 2.2216796875);
    assert_grapheme(graphemes.at(18), "d", 5.5615234375);
    assert_grapheme(graphemes.at(19), " ", 2.7783203125);
    assert_grapheme(graphemes.at(20), "!", 2.7783203125);
    assert_grapheme(graphemes.at(21), "👽", 13.0);
    assert_grapheme(graphemes.at(22), "👾", 13.0);
    assert_grapheme(graphemes.at(23), "🤖", 13.0);
    assert_grapheme(graphemes.at(24), "🎃", 13.0);
    assert_grapheme(graphemes.at(25), "😺", 13.0);
    assert_grapheme(graphemes.at(26), "😹", 13.0);
    assert_grapheme(graphemes.at(27), "😻", 13.0);
    assert_grapheme(graphemes.at(28), "😼", 13.0);
    assert_grapheme(graphemes.at(29), "😽", 13.0);
    assert_grapheme(graphemes.at(30), "👪", 13.0);
}
