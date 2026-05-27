// Пересъёмка диаграмм (Mermaid) в высоком разрешении для вставки в документ.
const puppeteer = require("/Users/greyw1l/Downloads/Rezograf_Agent/node_modules/puppeteer");
const path = require("node:path");

const BASE = "http://localhost:3000/diagrams";
const OUT = "/Users/greyw1l/Downloads/Diplom_2026/diagrams";
const PAGES = [
  ["usecase.html", "diagram-usecase"],
  ["architecture.html", "diagram-architecture"],
  ["er.html", "diagram-er"],
];

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  for (const [url, file] of PAGES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1700, height: 1500, deviceScaleFactor: 3 });
    await page.goto(BASE + "/" + url, { waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector(".mermaid svg", { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    const el = await page.$("#wrap");
    await el.screenshot({ path: path.join(OUT, file + ".png") });
    console.log("OK", file);
    await page.close();
  }
  await browser.close();
  console.log("DONE");
})().catch((e) => { console.error("FAIL", e.message); process.exit(1); });
