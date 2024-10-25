use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;
use web_sys::ImageData;

#[wasm_bindgen]
pub struct AppImage {
    image_data: ImageData,
}

#[wasm_bindgen]
impl AppImage {
    #[wasm_bindgen(constructor)]
    pub fn new(image_data: ImageData) -> Self {
        Self { image_data }
    }

    #[wasm_bindgen(getter, js_name = imageData)]
    pub fn image_data(&self) -> ImageData {
        self.image_data.clone()
    }
}

impl AppImage {
    pub fn map_bytes<F: Fn(u8, usize) -> u8>(&self, callback: F) -> AppImage {
        let old_data = self.image_data.data();
        let mut new_data = Vec::with_capacity(old_data.len());

        for (i, bytes) in old_data.chunks(4).enumerate() {
            for (j, byte) in bytes[..3].iter().enumerate() {
                new_data.push(callback(*byte, i * 3 + j));
            }
            new_data.push(255);
        }

        AppImage::new(
            ImageData::new_with_u8_clamped_array(Clamped(&new_data), self.image_data.width())
                .expect("ImageData constructor should succeed"),
        )
    }
}
