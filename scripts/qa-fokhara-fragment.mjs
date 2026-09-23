import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const outDir = path.resolve("artifacts/fokhara-fragment-qa");
fs.mkdirSync(outDir, { recursive: true });

const report = {
  baseUrl,
  desktop: {},
  mobile: {},
  reducedMotion: {},
  assetResponses: [],
  consoleErrors: [],
  pageErrors: [],
};

function attach(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      report.consoleErrors.push({ label, text: message.text() });
    }
  });

  page.on("pageerror", (error) => {
    report.pageErrors.push({ label, text: error.message });
  });

  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("/exhibition/fokhara/nebula-espresso-cup.webp")) {
      report.assetResponses.push({
        label,
        url: new URL(url).pathname,
        status: response.status(),
      });
    }
  });
}

async function noOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}

async function imageReady(page) {
  return page.locator('img[src="/exhibition/fokhara/nebula-espresso-cup.webp"]').evaluate((image) => {
    const img = image;
    return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
  });
}

async function seedSeraphResidue(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "omar-khair-exhibition-session-v1",
      JSON.stringify({
        soundMode: "off",
        visitedRooms: ["first-contact", "seraph"],
        roomOrder: ["first-contact", "seraph"],
        roomResidues: {
          "first-contact": "warm-seam",
          "seraph": "body-contour",
        },
      }),
    );
  });
}

const browser = await chromium.launch({ headless: true });

try {
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: "light",
    });
    const page = await context.newPage();
    attach(page, "desktop");
    await seedSeraphResidue(page);

    await page.goto(`${baseUrl}/fokhara`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: /The form/i }).waitFor({ timeout: 10000 });
    await page.waitForTimeout(950);

    report.desktop.noOverflow = await noOverflow(page);
    report.desktop.imageReady = await imageReady(page);
    report.desktop.canvasCount = await page.locator("canvas").count();
    report.desktop.sourceThesis = await page.getByText("Form / trace / everyday use", { exact: true }).isVisible();
    report.desktop.product = await page.getByText("Nebula Espresso Cup", { exact: true }).isVisible();
    report.desktop.fullWork = await page.getByRole("link", { name: "OPEN FULL WORK ↗" }).isVisible();
    report.desktop.context = await page.getByRole("button", { name: "CONTEXT" }).isVisible();
    report.desktop.continue = await page.getByRole("button", { name: "CONTINUE" }).isVisible();

    await page.screenshot({
      path: path.join(outDir, "desktop-01-fokhara-home-fragment.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "CONTEXT" }).click();
    report.desktop.contextPanel = await page.getByRole("heading", { name: "THE FORM REMEMBERS" }).isVisible();

    await page.screenshot({
      path: path.join(outDir, "desktop-02-context.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "CLOSE" }).click();

    await page.getByRole("button", { name: "INDEX" }).click();
    report.desktop.indexVisible = await page.getByRole("heading", { name: "SELECTED WORKS" }).isVisible();
    await page.getByRole("button", { name: "CLOSE" }).click();

    await page.getByRole("button", { name: "CONTINUE" }).click();
    await page.waitForTimeout(260);

    await page.screenshot({
      path: path.join(outDir, "desktop-03-material-points-exit.png"),
      fullPage: true,
    });

    await page.waitForURL("**/habba", { timeout: 5000 });
    report.desktop.exitTarget = new URL(page.url()).pathname;

    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      colorScheme: "light",
    });
    const page = await context.newPage();
    attach(page, "mobile");

    await page.goto(`${baseUrl}/fokhara`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: /The form/i }).waitFor({ timeout: 10000 });
    await page.waitForTimeout(700);

    report.mobile.noOverflow = await noOverflow(page);
    report.mobile.imageReady = await imageReady(page);
    report.mobile.product = await page.getByText("Nebula Espresso Cup", { exact: true }).isVisible();

    await page.screenshot({
      path: path.join(outDir, "mobile-01-fokhara-home-fragment.png"),
      fullPage: true,
    });

    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
      colorScheme: "light",
    });
    const page = await context.newPage();
    attach(page, "reduced-motion");

    await page.goto(`${baseUrl}/fokhara`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: /The form/i }).waitFor({ timeout: 10000 });
    await page.waitForTimeout(350);

    report.reducedMotion.noOverflow = await noOverflow(page);
    report.reducedMotion.imageReady = await imageReady(page);

    await page.screenshot({
      path: path.join(outDir, "reduced-motion-01-fokhara.png"),
      fullPage: true,
    });

    await context.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));

const failures = [];
if (!report.desktop.noOverflow || !report.mobile.noOverflow || !report.reducedMotion.noOverflow) failures.push("Horizontal overflow");
if (!report.desktop.imageReady || !report.mobile.imageReady || !report.reducedMotion.imageReady) failures.push("Pinned product image failed");
if (report.desktop.canvasCount !== 0) failures.push("Unexpected canvas/WebGL introduced into Fokhara fragment");
if (!report.desktop.sourceThesis || !report.desktop.product) failures.push("Canonical Home source content missing");
if (!report.desktop.fullWork || !report.desktop.context || !report.desktop.continue) failures.push("Exhibition framing controls missing");
if (!report.desktop.contextPanel) failures.push("Fokhara context panel failed");
if (!report.desktop.indexVisible) failures.push("INDEX not reachable");
if (report.desktop.exitTarget !== "/habba") failures.push("Fokhara exit did not hand off to Habba");
if (!report.assetResponses.some((item) => item.status === 200)) failures.push("Pinned Fokhara media was not served with HTTP 200");
if (report.consoleErrors.length) failures.push(`Console errors: ${report.consoleErrors.length}`);
if (report.pageErrors.length) failures.push(`Page errors: ${report.pageErrors.length}`);

if (failures.length) {
  console.error("FOKHARA_FRAGMENT_QA=FAIL");
  console.error(failures.join("\n"));
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log("FOKHARA_FRAGMENT_QA=PASS");
