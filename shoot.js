// Детерминированная съёмка экранов приложения через Puppeteer.
// Сессия задаётся cookie напрямую (HMAC-схема как в src/lib/auth.ts),
// чтобы не зависеть от формы входа и состояния общего браузера.
const puppeteer = require("/Users/greyw1l/Downloads/Rezograf_Agent/node_modules/puppeteer");
const crypto = require("node:crypto");
const path = require("node:path");

const BASE = "http://localhost:3000";
const SECRET = "remont-service-secret-key-change-in-prod-2026";
const OUT = "/Users/greyw1l/Downloads/Diplom_2026/screenshots";

const sign = (v) => crypto.createHmac("sha256", SECRET).update(v).digest("hex");
const cookieFor = (id) => `${id}.${sign(String(id))}`;

// id: admin=1, master(Иванов)=2, client(Петров)=5
const IDS = { admin: 1, master: 2, client: 5 };

const PAGES = [
  { role: null, url: "/", file: "landing", h: 900 },
  { role: null, url: "/services", file: "services", full: true },
  { role: null, url: "/login", file: "login", h: 900 },
  { role: null, url: "/register", file: "register", h: 900 },
  { role: "client", url: "/orders", file: "client-orders", h: 900 },
  { role: "client", url: "/orders/new", file: "new-order", h: 900 },
  { role: "client", url: "/orders/5", file: "client-order", h: 1480 },
  { role: "client", url: "/notifications", file: "notifications", h: 900 },
  { role: "client", url: "/profile", file: "profile", h: 760 },
  { role: "master", url: "/master", file: "master-orders", h: 900 },
  { role: "master", url: "/master/orders/3", file: "master-workbench", h: 1640 },
  { role: "admin", url: "/admin", file: "admin-dashboard", h: 980 },
  { role: "admin", url: "/admin/orders", file: "admin-orders", h: 980 },
  { role: "admin", url: "/admin/users", file: "admin-users", h: 900 },
  { role: "admin", url: "/admin/services", file: "admin-services", h: 980 },
  { role: "admin", url: "/admin/parts", file: "admin-parts", h: 980 },
  { role: "admin", url: "/admin/categories", file: "admin-categories", h: 820 },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--force-device-scale-factor=2"],
  });

  for (const p of PAGES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1360, height: p.h || 900, deviceScaleFactor: 2 });

    // Сессионная cookie для нужной роли (или её отсутствие для публичных страниц).
    await page.deleteCookie({ name: "rs_session", domain: "localhost" }).catch(() => {});
    if (p.role) {
      await page.setCookie({
        name: "rs_session",
        value: cookieFor(IDS[p.role]),
        domain: "localhost",
        path: "/",
      });
    }

    await page.goto(BASE + p.url, { waitUntil: "networkidle0", timeout: 60000 });
    try { await page.evaluateHandle("document.fonts.ready"); } catch {}
    await new Promise((r) => setTimeout(r, 600));

    const file = path.join(OUT, p.file + ".png");
    await page.screenshot({ path: file, fullPage: !!p.full });
    console.log("OK", p.url, "->", p.file + ".png", p.full ? "(full)" : "(" + (p.h || 900) + ")");
    await page.close();
  }

  await browser.close();
  console.log("DONE");
})().catch((e) => { console.error("FAIL", e.message); process.exit(1); });
