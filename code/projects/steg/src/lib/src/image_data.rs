use web_sys::{js_sys::Uint8ClampedArray, ImageData};

pub fn create_image_data(data: &[u8], width: u32) -> ImageData {
    ImageData::new_with_js_u8_clamped_array(&Uint8ClampedArray::from(data), width)
        .expect("ImageData constructor should succeed")
}

pub trait ImageDataExt {
    fn xy_to_idx(&self, x: u32, y: u32) -> usize;
}

impl ImageDataExt for ImageData {
    fn xy_to_idx(&self, x: u32, y: u32) -> usize {
        let x = x.clamp(0, self.width() - 1);
        let y = y.clamp(0, self.height() - 1);
        ((y * self.width() + x) * 4) as usize
    }
}
