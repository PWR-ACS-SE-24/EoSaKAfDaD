use web_sys::{js_sys::Uint8ClampedArray, ImageData};

pub const RGBA_CHANNELS: usize = 4;

pub fn create_image_data(data: &[u8], width: u32) -> ImageData {
    ImageData::new_with_js_u8_clamped_array(&Uint8ClampedArray::from(data), width)
        .expect("ImageData constructor should succeed")
}

pub trait ImageDataExt {
    fn xy_to_idx(&self, x: u32, y: u32) -> usize;
    fn map_rgb(&self, f: impl FnMut(u8) -> u8) -> ImageData;
}

impl ImageDataExt for ImageData {
    fn xy_to_idx(&self, x: u32, y: u32) -> usize {
        let x = x.clamp(0, self.width() - 1);
        let y = y.clamp(0, self.height() - 1);
        ((y * self.width() + x) * 4) as usize
    }

    fn map_rgb(&self, mut f: impl FnMut(u8) -> u8) -> ImageData {
        let mut data = Vec::with_capacity(self.data().len());
        for i in (0..self.data().len()).step_by(RGBA_CHANNELS) {
            data.push(f(self.data()[i]));
            data.push(f(self.data()[i + 1]));
            data.push(f(self.data()[i + 2]));
            data.push(self.data()[i + 3]);
        }
        create_image_data(&data, self.width())
    }
}
