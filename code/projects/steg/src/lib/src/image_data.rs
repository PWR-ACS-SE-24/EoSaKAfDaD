use web_sys::{js_sys::Uint8ClampedArray, ImageData};

pub fn create_image_data(data: &[u8], width: u32) -> ImageData {
    ImageData::new_with_js_u8_clamped_array(&Uint8ClampedArray::from(data), width)
        .expect("ImageData constructor should succeed")
}
