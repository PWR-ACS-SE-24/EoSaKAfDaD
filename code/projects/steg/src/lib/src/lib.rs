use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = helloWorld)]
pub fn hello_world() -> String {
    "Hello, world!".into()
}
