import { ExifData } from "exif";

export interface Image {
  path: string;
  exif: ExifData | undefined;
}
