import { readFile } from "fs/promises";
import { cssPath, rootDirectory } from "./path";
import { Image } from "./types/Image";
import { Page } from "./types/Page";
import path from "path";
import showdown from "showdown";

export type PageRenderResult = {
  directory: string;
  html: string;
  subPages: PageRenderResult[];
};

const tags = {
  page: {
    PAGE_TITLE: "PAGE_TITLE",
    PAGE_DESCRIPTION: "PAGE_DESCRIPTION",
    PAGE_LINKS: "PAGE_LINKS",
    IMAGES: "IMAGES",
    NAV_LINKS: "NAV_LINK",
    CSS_PATH: "CSS_PATH",
  },
  image: {
    TITLE: "IMAGE_TITLE",
    DESCRIPTION: "IMAGE_DESCRIPTION",
    SRC: "IMAGE_SRC",
    IMAGE_EXIF: "IMAGE_EXIF",
    ROW: "ROW",
  },
};

const templateFiles = {
  image: rootDirectory + "/src/image_template.html",
  page: rootDirectory + "/src/page_template.html",
};

const replaceInHtml = (html: string, tag: string, text: string): string =>
  html.replace(`{{ ${tag} }}`, text);

const replaceManyInHtml = (
  html: string,
  replaces: { tag: string; text: string }[]
): string => {
  replaces.forEach(
    (replace) => (html = replaceInHtml(html, replace.tag, replace.text))
  );
  return html;
};

const displayedExif = [
  "ExposureTime",
  "FNumber",
  "ISO",
  "DateTimeOriginal",
  "ShutterSpeedValue",
  "FocalLength",
];
export const renderImages = async (images: Image[]): Promise<string> => {
  const imageTemplate = await readFile(templateFiles.image, "utf8");
  const converter = new showdown.Converter();
  return images
    .map((image) => {
      let imageHtml = `${imageTemplate}`;
      return replaceManyInHtml(imageHtml, [
        { tag: tags.image.SRC, text: image.path },
        {
          tag: tags.image.IMAGE_EXIF,
          text: image.exif?.exif
            ? JSON.stringify(image.exif?.exif, null, 2)
            : "",
        },
        { tag: tags.image.TITLE, text: image.path.split("\\").pop() ?? "null" },
        {
          tag: tags.image.DESCRIPTION,
          text: image.description
            ? converter.makeHtml(image.description)
            : "Desc: null",
        },
        {
          tag: tags.image.ROW,
          text: Object.entries(image.exif?.exif ?? {})
            .filter(([key]) => displayedExif.includes(key))
            .map(
              ([key, value]) => `
                <tr>
                  <th>${key}</th>
                  <td>${value}</td>
                </tr>
              `
            )
            .join("\n"),
        },
      ]);
    })
    .join("\n");
};

const buildPageLinks = (subPages: Page[]): string => {
  return subPages
    .map(
      (subPage) =>
        `<li><a href="/${subPage.config.url}">${subPage.config.title}</a></li>`
    )
    .join("\n");
};

export const renderPage = async (
  page: Page,
  pageLinks: string | undefined = undefined
): Promise<PageRenderResult> => {
  pageLinks ??= buildPageLinks(page.subPages);
  const pageTemplate = await readFile(templateFiles.page, "utf8");
  return {
    directory: page.config.url,
    html: replaceManyInHtml(pageTemplate, [
      { tag: tags.page.IMAGES, text: await renderImages(page.images) },
      { tag: tags.page.PAGE_DESCRIPTION, text: page.config.description },
      { tag: tags.page.PAGE_TITLE, text: page.config.title },
      {
        tag: tags.page.CSS_PATH,
        text: path.relative(
          rootDirectory + "/" + page.config.url,
          rootDirectory + "/" + cssPath
        ),
      },
      {
        tag: tags.page.PAGE_LINKS,
        text: pageLinks,
      },
    ]),
    subPages: await Promise.all(
      page.subPages.map((subPage) => renderPage(subPage, pageLinks))
    ),
  };
};
