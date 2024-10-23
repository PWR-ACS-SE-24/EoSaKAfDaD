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
        let mut index = 0;
        let mut new_data = Vec::with_capacity(old_data.len());
        for i in (0..old_data.len()).step_by(4) {
            for j in 0..3 {
                new_data.push(callback(old_data[i + j], index));
                index += 1;
            }
            new_data.push(255);
        }
        AppImage::new(
            ImageData::new_with_u8_clamped_array(Clamped(&new_data), self.image_data.width())
                .expect("ImageData constructor should succeed"),
        )
    }
}
