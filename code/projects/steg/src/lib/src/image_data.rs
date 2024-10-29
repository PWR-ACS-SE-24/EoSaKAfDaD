use wasm_bindgen::Clamped;
use web_sys::ImageData;

pub fn create_image_data(data: &[u8], width: u32) -> ImageData {
    ImageData::new_with_u8_clamped_array(Clamped(data), width)
        .expect("ImageData constructor should succeed")
}
