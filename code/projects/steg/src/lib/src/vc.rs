use crate::image_data::{create_image_data, ImageDataExt, RGBA_CHANNELS};
use tinyrand::{Rand, Seeded, StdRand};
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

fn closest_palette_color(v: u8) -> u8 {
    if v < u8::MAX / 2 {
        u8::MIN
    } else {
        u8::MAX
    }
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

fn dither_random(image: &ImageData) -> ImageData {
    let mut rng = StdRand::seed(0);
    image.map_pixels(|(v, _, _)| {
        let v = if v > rng.next_u16() as u8 {
            u8::MAX
        } else {
            u8::MIN
        };
        (v, v, v)
    })
}

fn dither_floyd_steinberg(image: &ImageData) -> ImageData {
    let w = image.width() as usize;
    let h = image.height() as usize;
    let mut data = image.data().0;

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

    for i in 0..(data.len() / RGBA_CHANNELS) {
        let v = pixels[i / w][i % w].clamp(0., 255.) as u8;
        let i = i * RGBA_CHANNELS;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
    }

    create_image_data(&data, w as u32)
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
        VcDithering::Random => dither_random(&grayscale),
        VcDithering::FloydSteinberg => dither_floyd_steinberg(&grayscale),
        _ => panic!("dithering should have an allowed value"),
    }
}
