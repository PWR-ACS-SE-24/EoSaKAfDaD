use crate::image_data::create_image_data;
use wasm_bindgen::prelude::*;
use web_sys::ImageData;

fn bit_at(bytes: &[u8], i: usize) -> u8 {
    bytes[i >> 3] >> (7 - (i & 7)) & 1
}

fn byte_value(bits: &[u8]) -> u8 {
    bits.iter().fold(0u8, |acc, bit| (acc << 1) | bit)
}

#[wasm_bindgen(js_name = lsb2embedText)]
pub fn lsb2_embed_text(image: &ImageData, text: &str) -> ImageData {
    let text = text.as_bytes();
    let data = image
        .data()
        .iter()
        .enumerate()
        .map(|(i, byte)| {
            byte & !1
                | if i < text.len() * 8 {
                    bit_at(text, i)
                } else {
                    u8::MIN
                }
        })
        .collect::<Vec<u8>>();
    create_image_data(&data, image.width())
}

#[wasm_bindgen(js_name = lsb2extractText)]
pub fn lsb2_extract_text(image: &ImageData) -> String {
    let bits = image
        .data()
        .iter()
        .map(|byte| byte & 1)
        .collect::<Vec<u8>>();
    let mut data = Vec::new();
    for byte in bits.chunks(8) {
        let value = byte_value(byte);
        if value == u8::MIN {
            break;
        }
        data.push(value);
    }
    String::from_utf8_lossy(&data).into()
}
