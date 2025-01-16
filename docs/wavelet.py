import numpy as np
import pywt
from PIL import Image

WAVELET = "db1"
MULT = 8

def hide_message(source: Image, secret: Image) -> Image:
    source = np.array(source)
    secret = np.array(secret)
    target = np.copy(source)
    for channel in (0, 1, 2):
      cA, (cH, cV, cD) = pywt.dwt2(source[:, :, channel], WAVELET)
      cH = secret[:, :, channel] / 255 * MULT
      target[:, :, channel] = pywt.idwt2((cA, (cH, cV, cD)), WAVELET)
    return Image.fromarray(target, "RGB")

def extract_message(target: Image) -> Image:
    target = np.array(target)
    result = []
    for channel in (0, 1, 2):
      cA, (cH, cV, cD) = pywt.dwt2(target[:, :, channel], WAVELET)
      cH = cH * 255 / MULT
      result.append(Image.fromarray(np.uint8(cH), "L"))
    return Image.merge("RGB", result)

source = Image.open("source.jpg")
secret = Image.open("secret.jpg")
target = hide_message(source, secret)
target.save("target.jpg")
message = extract_message(target)
message.save("message.jpg")
