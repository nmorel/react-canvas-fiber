use wasm_bindgen_test::wasm_bindgen_test_configure;

wasm_bindgen_test_configure!(run_in_browser);

use rust_text_breaker::breakText;
use wasm_bindgen_test::*;

#[wasm_bindgen_test]
fn test() {
    let width = breakText(
        "😈👿👹👺🤡💩👻💀Hello World !👽👾🤖🎃😺😹😻😼😽👪",
        16,
        "sans-serif",
        2,
    );
    assert_eq!(width, 291.0556640625);
}
