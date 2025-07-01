import { readFile } from "fs/promises";
import { PageConfig, PageConfigFile } from "./types/PageConfig";

const configFileName = "config.json";

export const getConfig = async (directory: string): Promise<PageConfig> => {
    const configRaw = JSON.parse(await readFile(`${directory}/${configFileName}`, 'utf8')) as PageConfigFile;
    return {
        ...configRaw,
        url: directory.split("/").at(-1)!,
    }
}