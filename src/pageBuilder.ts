import path from "path";
import { getConfig } from "./config";
import { Page } from "./types/Page";
import {
  getDirectoriesInDirectory,
  getFilesInDirectory,
} from "./utils/gallery_utils";
import { rootDirectory } from "./path";
import { ExifData, ExifImage } from "exif";

const getExifData = async (filePath: string): Promise<ExifData | undefined> =>
  new Promise<ExifData | undefined>((resolve, reject) => {
    try {
      new ExifImage({ image: filePath }, (error, data) => {
        if (error) {
          console.error("Error reading EXIF data: ", error);
          resolve(undefined);
        } else {
          resolve(data);
        }
      });
    } catch (err) {
      console.error("Exception while reading EXIF: ", err);
      resolve(undefined);
    }
  });

export const buildPage = async (dir: string): Promise<Page> => {
  const [files, directories] = await Promise.all([
    getFilesInDirectory(dir),
    getDirectoriesInDirectory(dir),
  ]);

  const subPages = await Promise.all(
    directories.map((d) => buildPage(d.parentPath + "/" + d.name))
  );
  const config = await getConfig(dir);
  const images = await Promise.all(
    files
      .filter((file) => file.name.match(/\.(jpg|jpeg|png|gif)$/i))
      .map(async (file) => {
        const exifData = await getExifData(file.parentPath + "/" + file.name);
        return {
          path: path.relative(
            rootDirectory + "/" + config.url,
            file.parentPath + "/" + file.name
          ),
          exif: exifData,
        };
      })
  );

  return {
    config,
    images,
    subPages,
  };
};
