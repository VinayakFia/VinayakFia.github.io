import { Image } from "./Image";
import { PageConfig } from "./PageConfig";

export interface Page {
  config: PageConfig;
  images: Image[];
  subPages: Page[];
}
