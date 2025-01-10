import { vcIsMonochrome } from "steg";

/** @returns `string` with error message or `null` if file is valid */
export type Validator = (args: {
  image: ImageData;
  file: File;
  mime: string;
}) => string | null;

export function mimeValidator(
  supportedTypes = ["image/jpeg", "image/png", "image/webp"],
): Validator {
  return ({ mime }) =>
    supportedTypes.includes(mime)
      ? null
      : `Niewspierany format pliku "${mime}"!`;
}

export const monochromeValidator: Validator = ({ image }) =>
  vcIsMonochrome(image) ? null : "Obraz musi być monochromatyczny!";
