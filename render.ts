import fs from "fs";
import { Templ } from "./src/templ";

export default async function renderTemplates(
  outDir: string,
  templatesDir?: string
) {
  const parser = new Templ();

  const emailConfirmation = await parser.render("email-confirmation.html", {
    companyName: "Logic++",
    name: "Celleb",
    logo: "logo.png",
    baseUri: "https://static.mrcelleb.com/swiftpost/",
  });

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(`${outDir}/email-confirmation.html`, emailConfirmation);
}
renderTemplates("./html-dist").catch(console.error);
