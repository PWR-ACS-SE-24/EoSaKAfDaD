use crate::app_image::AppImage;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = highlightLsb)]
pub fn highlight_lsb(image: &AppImage) -> AppImage {
    image.map_bytes(|byte, _| if byte & 1 == 1 { u8::MAX } else { u8::MIN })
}

#[wasm_bindgen(js_name = embedText)]
pub fn embed_text(image: &AppImage, text: &str) -> AppImage {
    let mut bits = Vec::with_capacity(text.len() * 7);
    for c in text.chars() {
        let mut value = c as u8 & 0x7F;
        for _ in 0..7 {
            bits.push(value & 1);
            value >>= 1;
        }
    }

    image.map_bytes(|byte, index| (byte & 0xFE) | bits.get(index).copied().unwrap_or_default())
}

#[wasm_bindgen(js_name = extractText)]
pub fn extract_text(image: &AppImage) -> String {
    let mut bytes = image
        .image_data()
        .data()
        .iter()
        .enumerate()
        .filter(|(i, _)| i % 4 != 3)
        .map(|(_, byte)| byte & 1)
        .collect::<Vec<u8>>()
        .chunks(7)
        .map(|chunk| chunk.iter().fold(0u8, |acc, bit| (acc << 1) | bit))
        .collect::<Vec<u8>>();
    while let Some(&0) = bytes.last() {
        bytes.pop();
    }
    String::from_utf8(bytes).expect("extracted text should be ASCII")
}
