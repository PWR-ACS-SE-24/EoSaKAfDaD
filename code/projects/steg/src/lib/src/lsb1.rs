use crate::app_image::AppImage;
use wasm_bindgen::prelude::*;

const ASCII_CHAR_BITS: usize = 7;
const ASCII_CHAR_MASK: u8 = 0b01111111;

#[wasm_bindgen(js_name = lsbHighlight)]
pub fn lsb_highlight(image: &AppImage) -> AppImage {
    image.map_bytes(|byte, _| if byte & 1 == 1 { u8::MAX } else { u8::MIN })
}

#[wasm_bindgen(js_name = lsb1embedText)]
pub fn lsb1_embed_text(image: &AppImage, text: &str) -> AppImage {
    let mut bits = Vec::with_capacity(text.len() * ASCII_CHAR_BITS);
    for c in text.chars() {
        let mut value = c as u8 & ASCII_CHAR_MASK;
        for _ in 0..ASCII_CHAR_BITS {
            bits.push(value & 1);
            value >>= 1;
        }
    }

    image.map_bytes(|byte, index| (byte & !1) | bits.get(index).copied().unwrap_or_default())
}

#[wasm_bindgen(js_name = lsb1extractText)]
pub fn lsb1_extract_text(image: &AppImage) -> String {
    let mut bytes = image
        .image_data()
        .data()
        .iter()
        .enumerate()
        .filter(|(i, _)| i % 4 != 3)
        .map(|(_, byte)| byte & 1)
        .collect::<Vec<u8>>()
        .chunks(ASCII_CHAR_BITS)
        .map(|chunk| chunk.iter().fold(0u8, |acc, bit| (acc << 1) | bit))
        .collect::<Vec<u8>>();
    while let Some(&0) = bytes.last() {
        bytes.pop();
    }
    String::from_utf8(bytes).expect("extracted text should be ASCII")
}
