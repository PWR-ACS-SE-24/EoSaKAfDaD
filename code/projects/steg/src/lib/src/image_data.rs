use web_sys::{js_sys::Uint8ClampedArray, ImageData};

pub const RGBA_CHANNELS: usize = 4;

pub fn create_image_data(data: &[u8], width: u32) -> ImageData {
    ImageData::new_with_js_u8_clamped_array(&Uint8ClampedArray::from(data), width)
        .expect("ImageData constructor should succeed")
}

pub trait ImageDataExt {
    fn xy_to_i(&self, x: u32, y: u32) -> usize;
    fn map_bytes(&self, f: impl FnMut(u8) -> u8) -> ImageData;
}

impl ImageDataExt for ImageData {
    fn xy_to_i(&self, x: u32, y: u32) -> usize {
        let x = x.clamp(0, self.width() - 1);
        let y = y.clamp(0, self.height() - 1);
        (y * self.width() + x) as usize * RGBA_CHANNELS
    }

    fn map_bytes(&self, mut f: impl FnMut(u8) -> u8) -> ImageData {
        let mut data = self.data().0;
        for i in (0..data.len()).step_by(RGBA_CHANNELS) {
            for j in 0..3 {
                data[i + j] = f(data[i + j]);
            }
        }
        create_image_data(&data, self.width())
    }
}
