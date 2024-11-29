use crate::image_data::{create_image_data, RGBA_CHANNELS};
use wasm_bindgen::prelude::*;
use web_sys::ImageData;

#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub enum VcGrayscale {
    Average = "average",
    Luminosity = "luminosity",
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub enum VcDithering {
    Threshold = "threshold",
    Random = "random",
    FloydSteinberg = "floyd-steinberg",
}

#[wasm_bindgen(js_name = vcMakeMonochrome)]
pub fn vc_make_monochrome(
    image: &ImageData,
    grayscale: VcGrayscale,
    dithering: VcDithering,
) -> ImageData {
    let mut data = Vec::with_capacity(image.data().len());
    for i in (0..image.data().len()).step_by(RGBA_CHANNELS) {
        let r = image.data()[i] as f64;
        let g = image.data()[i + 1] as f64;
        let b = image.data()[i + 2] as f64;

        let gray = match grayscale {
            VcGrayscale::Average => 0.333 * r + 0.333 * g + 0.333 * b,
            VcGrayscale::Luminosity => 0.299 * r + 0.587 * g + 0.114 * b,
            _ => unreachable!(),
        } as u8;

        data.extend_from_slice(&[gray, gray, gray, u8::MAX]);
    }
    create_image_data(&data, image.width())
}
