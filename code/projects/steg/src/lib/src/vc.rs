use crate::image_data::{create_image_data, ImageDataExt, RGBA_CHANNELS};
use tinyrand::{Rand, Seeded, StdRand};
use wasm_bindgen::prelude::*;
use web_sys::ImageData;

const BLACK: u8 = u8::MIN;
const WHITE: u8 = u8::MAX;

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

fn closest_palette_color(v: u8) -> u8 {
    if v < u8::MAX / 2 {
        BLACK
    } else {
        WHITE
    }
}

fn pixels_to_image(pixels: Vec<Vec<u8>>) -> ImageData {
    let w = pixels.first().map(|p| p.len()).unwrap_or_default();
    let h = pixels.len();
    let mut data = vec![u8::MAX; w * h * RGBA_CHANNELS];
    for i in 0..(data.len() / RGBA_CHANNELS) {
        let v = pixels[i / w][i % w];
        let i = i * RGBA_CHANNELS;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
    }
    create_image_data(&data, w as u32)
}

fn desaturate(image: &ImageData, grayscale: VcGrayscale) -> ImageData {
    image.map_pixels(|(r, g, b)| {
        let v = match grayscale {
            VcGrayscale::Average => 0.333 * r as f64 + 0.333 * g as f64 + 0.333 * b as f64,
            VcGrayscale::Luminosity => 0.299 * r as f64 + 0.587 * g as f64 + 0.114 * b as f64,
            _ => panic!("grayscale should have an allowed value"),
        } as u8;
        (v, v, v)
    })
}

fn dither_threshold(image: &ImageData) -> ImageData {
    image.map_bytes(closest_palette_color)
}

fn dither_random(image: &ImageData, seed: u64) -> ImageData {
    let mut rng = StdRand::seed(seed);
    image.map_pixels(|(v, _, _)| {
        let v = if v < rng.next_u16() as u8 {
            BLACK
        } else {
            WHITE
        };
        (v, v, v)
    })
}

fn dither_floyd_steinberg(image: &ImageData) -> ImageData {
    let w = image.width() as usize;
    let h = image.height() as usize;
    let data = image.data().0;

    let mut pixels = vec![vec![0.; w]; h];
    for i in 0..(data.len() / RGBA_CHANNELS) {
        pixels[i / w][i % w] = data[i * RGBA_CHANNELS] as f64;
    }

    for y in 0..h {
        for x in 0..w {
            let old_pixel = pixels[y][x];
            let new_pixel = closest_palette_color(old_pixel as u8) as f64;
            pixels[y][x] = new_pixel;
            let qe = old_pixel - new_pixel;
            if x + 1 < w {
                pixels[y][x + 1] += qe * 7. / 16.;
            }
            if x >= 1 && y + 1 < h {
                pixels[y + 1][x - 1] += qe * 3. / 16.;
            }
            if y + 1 < h {
                pixels[y + 1][x] += qe * 5. / 16.;
            }
            if x + 1 < w && y + 1 < h {
                pixels[y + 1][x + 1] += qe * 1. / 16.;
            }
        }
    }

    let pixels = pixels
        .iter()
        .map(|r| r.iter().map(|v| v.clamp(0., 255.) as u8).collect())
        .collect();

    pixels_to_image(pixels)
}

#[wasm_bindgen(js_name = vcMakeMonochrome)]
pub fn vc_make_monochrome(
    image: &ImageData,
    grayscale: VcGrayscale,
    dithering: VcDithering,
) -> ImageData {
    let grayscale = desaturate(image, grayscale);

    match dithering {
        VcDithering::Threshold => dither_threshold(&grayscale),
        VcDithering::Random => dither_random(&grayscale, 0),
        VcDithering::FloydSteinberg => dither_floyd_steinberg(&grayscale),
        _ => panic!("dithering should have an allowed value"),
    }
}

#[wasm_bindgen(js_name = vcIsMonochrome)]
pub fn vc_is_monochrome(image: &ImageData) -> bool {
    let data = image.data().0;
    for p in data.chunks_exact(RGBA_CHANNELS) {
        if p[0] != p[1] || p[1] != p[2] || (p[0] != BLACK && p[0] != WHITE) || p[3] != u8::MAX {
            return false;
        }
    }
    true
}

#[wasm_bindgen(getter_with_clone)]
pub struct VcSplit(pub ImageData, pub ImageData);

#[wasm_bindgen(js_name = vcSplit)]
pub fn vc_split(image: &ImageData, seed: Option<u32>) -> VcSplit {
    let data = image.data().0;
    let w = image.width() as usize;
    let h = image.height() as usize;

    let mut rng = StdRand::seed(seed.unwrap_or_default() as u64);

    let mut pl = vec![vec![0; w * 2]; h * 2];
    let mut pr = vec![vec![0; w * 2]; h * 2];

    for i in 0..(data.len() / RGBA_CHANNELS) {
        let x = (i % w) * 2;
        let y = (i / w) * 2;
        let pattern = rng.next_u32() % 2 == 1;

        match pattern {
            false => {
                pl[y][x] = BLACK;
                pl[y][x + 1] = WHITE;
                pl[y + 1][x] = WHITE;
                pl[y + 1][x + 1] = BLACK;
            }
            true => {
                pl[y][x] = WHITE;
                pl[y][x + 1] = BLACK;
                pl[y + 1][x] = BLACK;
                pl[y + 1][x + 1] = WHITE;
            }
        }

        let v = data[i * RGBA_CHANNELS];

        match (v, pattern) {
            (BLACK, false) | (WHITE, true) => {
                pr[y][x] = WHITE;
                pr[y][x + 1] = BLACK;
                pr[y + 1][x] = BLACK;
                pr[y + 1][x + 1] = WHITE;
            }
            (BLACK, true) | (WHITE, false) => {
                pr[y][x] = BLACK;
                pr[y][x + 1] = WHITE;
                pr[y + 1][x] = WHITE;
                pr[y + 1][x + 1] = BLACK;
            }
            _ => panic!("image should be monochrome"),
        }
    }

    VcSplit(pixels_to_image(pl), pixels_to_image(pr))
}

#[wasm_bindgen(js_name = vcMakeMask)]
pub fn vc_make_mask(image: &ImageData) -> ImageData {
    let mut data = image.data().0;
    for i in (0..data.len()).step_by(RGBA_CHANNELS) {
        data[i + 3] = u8::MAX - data[i];
    }
    create_image_data(&data, image.width())
}
