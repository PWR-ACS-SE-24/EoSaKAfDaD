use crate::image_data::create_image_data;
use wasm_bindgen::prelude::*;
use web_sys::ImageData;

const ASCII_CHAR_BITS: usize = 7;
const ASCII_CHAR_MASK: u8 = 0b01111111;
const RGBA_CHANNELS: usize = 4;

#[wasm_bindgen(js_name = lsbHighlight)]
pub fn lsb_highlight(image: &ImageData) -> ImageData {
    let mut data = Vec::with_capacity(image.data().len());
    for i in 0..image.data().len() {
        let scale = u8::MAX / if i % RGBA_CHANNELS == 3 { 2 } else { 1 };
        data.push((u8::MAX - scale) + (image.data()[i] & 1) * scale);
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

    let mut data = Vec::with_capacity(image.data().len());
    for (i, bytes) in image.data().chunks(RGBA_CHANNELS).enumerate() {
        for (j, byte) in bytes[..3].iter().enumerate() {
            data.push(byte & !1 | bits.get(i * 3 + j).copied().unwrap_or_default());
        }
        data.push(u8::MAX);
    }
    create_image_data(&data, image.width())
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
