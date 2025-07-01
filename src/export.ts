import { existsSync, mkdirSync, writeFileSync } from "fs";
import { PageRenderResult } from "./renderer";

export const exportFiles = async (
  pageRenderResult: PageRenderResult,
  dir: string
): Promise<void> => {
  await Promise.all([
    writeFileSync(`${dir}/index.html`, pageRenderResult.html, "utf8"),
    await exportSubPages(pageRenderResult.subPages, dir),
  ]);
};

const exportSubPages = async (
  subPages: PageRenderResult[],
  dir: string
): Promise<void> => {
  await Promise.all(
    subPages.map(async (subPage) => {
      const newDir = `${dir}/${subPage.directory}`;
      try {
        mkdirSync(newDir);
      } catch {}
      await exportFiles(subPage, newDir);
    })
  );
};
