use web_sys::{js_sys::Uint8ClampedArray, ImageData};

pub type Rgb = (u8, u8, u8);

pub const RGBA_CHANNELS: usize = 4;

pub fn create_image_data(data: &[u8], width: u32) -> ImageData {
    ImageData::new_with_js_u8_clamped_array(&Uint8ClampedArray::from(data), width)
        .expect("ImageData constructor should succeed")
}

pub trait ImageDataExt {
    fn xy_to_i(&self, x: u32, y: u32) -> usize;
    fn map_pixels(&self, f: impl FnMut(Rgb) -> Rgb) -> ImageData;

    fn map_bytes(&self, mut f: impl FnMut(u8) -> u8) -> ImageData {
        self.map_pixels(|(r, g, b)| (f(r), f(g), f(b)))
    }
    fn difference(&self, other: &ImageData) -> ImageData;
}

impl ImageDataExt for ImageData {
    fn xy_to_i(&self, x: u32, y: u32) -> usize {
        let x = x.clamp(0, self.width() - 1);
        let y = y.clamp(0, self.height() - 1);
        (y * self.width() + x) as usize * RGBA_CHANNELS
    }

    fn map_pixels(&self, mut f: impl FnMut(Rgb) -> Rgb) -> ImageData {
        let mut d = self.data().0;
        for i in (0..d.len()).step_by(RGBA_CHANNELS) {
            (d[i], d[i + 1], d[i + 2]) = f((d[i], d[i + 1], d[i + 2]));
            d[i + 3] = u8::MAX;
        }
        create_image_data(&d, self.width())
    }

    fn difference(&self, other: &ImageData) -> ImageData {
        assert_eq!(self.width(), other.width());
        assert_eq!(self.height(), other.height());
        let mut d = self.data().0;
        let o = other.data().0;
        for i in 0..d.len() {
            d[i] = d[i].abs_diff(o[i]);
        }
        create_image_data(&d, self.width())
    }
}
