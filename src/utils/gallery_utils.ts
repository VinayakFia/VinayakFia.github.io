import { readdir } from "fs/promises";

export const getFilesInDirectory = async (directory: string) =>
  (await readdir(directory, { withFileTypes: true })).filter((f) => f.isFile());

export const getDirectoriesInDirectory = async (directory: string) =>
  (await readdir(directory, { withFileTypes: true })).filter((f) =>
    f.isDirectory()
  );
