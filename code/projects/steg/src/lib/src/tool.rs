use crate::image_data::{create_image_data, ImageDataExt};
use tinyrand::{Rand, Seeded, StdRand};
use wasm_bindgen::prelude::*;
use web_sys::ImageData;

const RGBA_CHANNELS: usize = 4;

#[wasm_bindgen(js_name = toolScale)]
pub fn tool_scale(image: &ImageData, scale: u32) -> ImageData {
    let new_width = image.width() * scale / 100;
    let new_height = image.height() * scale / 100;
    let size = (new_width * new_height) as usize * RGBA_CHANNELS;
    let mut data = Vec::with_capacity(size);
    for i in (0..size).step_by(RGBA_CHANNELS) {
        let x = (i / RGBA_CHANNELS) as u32 % new_width;
        let y = (i / RGBA_CHANNELS) as u32 / new_width;
        let old_x = x * 100 / scale;
        let old_y = y * 100 / scale;
        let old_i = image.xy_to_idx(old_x, old_y);
        for j in 0..RGBA_CHANNELS {
            data.push(image.data()[old_i + j]);
        }
    }
    create_image_data(&data, new_width)
}

#[wasm_bindgen(js_name = toolNoise)]
pub fn tool_noise(image: &ImageData, amount: u32) -> ImageData {
    let amount = amount.clamp(0, 100);
    let mut rng = StdRand::seed(amount as u64);
    let mut data = Vec::with_capacity(image.data().len());
    for i in 0..image.data().len() {
        let noise = rng.next_u32() & 0xFF;
        let value = image.data()[i] as u32;
        let blend = (value * (100 - amount) + noise * amount) / 100;
        data.push(blend as u8);
    }
    create_image_data(&data, image.width())
}

#[wasm_bindgen(js_name = toolBrightness)]
pub fn tool_brightness(image: &ImageData, change: i32) -> ImageData {
    let change = change.clamp(-255, 255);
    let mut data = Vec::with_capacity(image.data().len());
    for i in (0..image.data().len()).step_by(RGBA_CHANNELS) {
        for j in 0..3 {
            let value = image.data()[i + j] as i32;
            let new_value = (value + change) as u8;
            data.push(new_value);
        }
        data.push(image.data()[i + 3]);
    }
    create_image_data(&data, image.width())
}

#[wasm_bindgen(js_name = toolContrast)]
pub fn tool_contrast(image: &ImageData, change: i32) -> ImageData {
    let change = change.clamp(-255, 255);
    let factor = (259. * (change as f64 + 255.)) / (255. * (259. - change as f64));
    let mut data = Vec::with_capacity(image.data().len());
    for i in (0..image.data().len()).step_by(RGBA_CHANNELS) {
        for j in 0..3 {
            let value = image.data()[i + j] as f64;
            let new_value = (factor * (value - 128.) + 128.).clamp(0., 255.) as u8;
            data.push(new_value);
        }
        data.push(image.data()[i + 3]);
    }
    create_image_data(&data, image.width())
}
