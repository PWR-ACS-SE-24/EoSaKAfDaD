use crate::image_data::{create_image_data, RGBA_CHANNELS};
use wasm_bindgen::prelude::*;
use web_sys::ImageData;

const ASCII_CHAR_BITS: usize = 7;
const ASCII_CHAR_MASK: u8 = 0b01111111;

#[wasm_bindgen(js_name = lsbHighlight)]
pub fn lsb_highlight(image: &ImageData) -> ImageData {
    let mut data = image.data().0;
    for (i, byte) in data.iter_mut().enumerate() {
        let scale = u8::MAX / if i % RGBA_CHANNELS == 3 { 2 } else { 1 };
        *byte = (u8::MAX - scale) + (*byte & 1) * scale;
    }
    create_image_data(&data, image.width())
}

#[wasm_bindgen(js_name = lsb1embedText)]
pub fn lsb1_embed_text(image: &ImageData, text: &str) -> ImageData {
    let mut bits = Vec::with_capacity(text.len() * ASCII_CHAR_BITS);
    for c in text.chars() {
        let mut value = c as u8 & ASCII_CHAR_MASK;
        for _ in 0..ASCII_CHAR_BITS {
            bits.push(value >> (ASCII_CHAR_BITS - 1));
            value <<= 1;
        }
    }

    let old_data = image.data().0;
    let mut new_data = Vec::with_capacity(old_data.len());
    for (i, bytes) in old_data.chunks(RGBA_CHANNELS).enumerate() {
        for (j, byte) in bytes[..3].iter().enumerate() {
            new_data.push(byte & !1 | bits.get(i * 3 + j).copied().unwrap_or_default());
        }
        new_data.push(u8::MAX);
    }
    create_image_data(&new_data, image.width())
}

#[wasm_bindgen(js_name = lsb1extractText)]
pub fn lsb1_extract_text(image: &ImageData) -> String {
    let mut bytes = image
        .data()
        .iter()
        .enumerate()
        .filter(|(i, _)| i % RGBA_CHANNELS != 3)
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
