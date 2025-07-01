import { exportFiles } from "./export";
import { buildPage } from "./pageBuilder";
import { rootDirectory } from "./path";
import { renderPage } from "./renderer";

const main = async () => {
  const page = await buildPage(`${rootDirectory}/gallery`);
  const rendered = await renderPage(page);
  await exportFiles(rendered, `${rootDirectory}`);
  console.log("done");
};

main();
