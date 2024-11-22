use crate::{
    image_data::{create_image_data, ImageDataExt},
    rng::Rng,
};
use wasm_bindgen::prelude::*;
use web_sys::ImageData;

/// RGBA channel count
const C: usize = 4;

#[wasm_bindgen(js_name = toolScale)]
pub fn tool_scale(image: &ImageData, scale: u32) -> ImageData {
    let new_width = image.width() * scale / 100;
    let new_height = image.height() * scale / 100;
    let size = (new_width * new_height) as usize * C;
    let mut data = Vec::with_capacity(size);
    for i in (0..size).step_by(C) {
        let x = (i / C) as u32 % new_width;
        let y = (i / C) as u32 / new_width;
        let old_x = x * 100 / scale;
        let old_y = y * 100 / scale;
        let old_i = image.xy_to_idx(old_x, old_y);
        for j in 0..C {
            data.push(image.data()[old_i + j]);
        }
    }
    create_image_data(&data, new_width)
}

#[wasm_bindgen(js_name = toolNoise)]
pub fn tool_noise(image: &ImageData, amount: u32) -> ImageData {
    let amount = amount.clamp(0, 100);
    let mut rng = Rng::new(amount);
    let mut data = Vec::with_capacity(image.data().len());
    for i in 0..image.data().len() {
        let noise = rng.gen() & 0xFF;
        let value = image.data()[i] as u32;
        let blend = (value * (100 - amount) + noise * amount) / 100;
        data.push(blend as u8);
    }
    create_image_data(&data, image.width())
}
