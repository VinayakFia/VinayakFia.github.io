import { ExifData } from "exif";

export interface Image {
  path: string;
  title: string;
  description?: string;
  exif: ExifData | undefined;
}
