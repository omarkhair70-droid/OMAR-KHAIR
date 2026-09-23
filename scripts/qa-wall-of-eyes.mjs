import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const outDir = path.resolve("artifacts/wall-of-eyes-qa");
fs.mkdirSync(outDir, { recursive: true });

const report = {
  baseUrl,
  desktop: {},
  mobile: {},
  reducedMotion: {},
  consoleErrors: [],
  pageErrors: [],
};

function attachErrors(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      report.consoleErrors.push({ label, text: message.text() });
    }
  });
  page.on("pageerror", (error) => {
    report.pageErrors.push({ label, text: error.message });
  });
}

async function noHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}

async function countEyes(page) {
  return page.locator('[data-eye]').count();
}

const browser = await chromium.launch({ headless: true });

try {
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: "dark",
    });
    const page = await context.newPage();
    attachErrors(page, "desktop");

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(650);

    report.desktop.eyeCount = await countEyes(page);
    report.desktop.noOverflow = await noHorizontalOverflow(page);
    report.desktop.identity = await page.getByRole("heading", { name: "OMAR KHAIR" }).isVisible();
    report.desktop.soundChoice = await page.getByRole("button", { name: "ENTER WITH SOUND" }).isVisible();
    report.desktop.silenceChoice = await page.getByRole("button", { name: "ENTER IN SILENCE" }).isVisible();

    await page.mouse.move(1120, 260);
    await page.waitForTimeout(260);
    await page.screenshot({ path: path.join(outDir, "desktop-01-wall-looking-right.png"), fullPage: true });

    await page.mouse.move(260, 650);
    await page.waitForTimeout(260);
    await page.screenshot({ path: path.join(outDir, "desktop-02-wall-looking-left.png"), fullPage: true });

    await page.getByRole("button", { name: "INDEX" }).click();
    report.desktop.indexVisible = await page.getByRole("heading", { name: "SELECTED WORKS" }).isVisible();
    await page.screenshot({ path: path.join(outDir, "desktop-03-index.png"), fullPage: true });
    await page.getByRole("button", { name: "CLOSE" }).click();

    await page.getByRole("button", { name: "ENTER IN SILENCE" }).click();
    await page.waitForTimeout(520);
    await page.screenshot({ path: path.join(outDir, "desktop-04-departure.png"), fullPage: true });
    await page.waitForURL("**/first-contact", { timeout: 5000 });
    report.desktop.silenceTarget = new URL(page.url()).pathname;

    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      colorScheme: "dark",
    });
    const page = await context.newPage();
    attachErrors(page, "mobile");

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(650);

    report.mobile.eyeCount = await countEyes(page);
    report.mobile.noOverflow = await noHorizontalOverflow(page);
    report.mobile.identity = await page.getByRole("heading", { name: "OMAR KHAIR" }).isVisible();

    await page.screenshot({ path: path.join(outDir, "mobile-01-wall.png"), fullPage: true });

    await page.getByRole("button", { name: "ENTER WITH SOUND" }).click();
    await page.waitForURL("**/first-contact", { timeout: 5000 });
    report.mobile.soundTarget = new URL(page.url()).pathname;
    report.mobile.soundStateVisible = await page.getByRole("button", { name: /SOUND ON/i }).isVisible();

    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
      colorScheme: "dark",
    });
    const page = await context.newPage();
    attachErrors(page, "reduced-motion");

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);

    report.reducedMotion.eyeCount = await countEyes(page);
    report.reducedMotion.noOverflow = await noHorizontalOverflow(page);
    await page.screenshot({ path: path.join(outDir, "reduced-motion-01-wall.png"), fullPage: true });

    await page.getByRole("button", { name: "ENTER IN SILENCE" }).click();
    await page.waitForURL("**/first-contact", { timeout: 2500 });
    report.reducedMotion.target = new URL(page.url()).pathname;

    await context.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));

const failures = [];
if ((report.desktop.eyeCount ?? 0) < 6) failures.push("Desktop eye field too small");
if ((report.mobile.eyeCount ?? 0) < 6) failures.push("Mobile eye field too small");
if ((report.reducedMotion.eyeCount ?? 0) < 6) failures.push("Reduced-motion eye field missing");
if (!report.desktop.identity || !report.mobile.identity) failures.push("Opening identity missing");
if (!report.desktop.soundChoice || !report.desktop.silenceChoice) failures.push("Entry choices missing");
if (!report.desktop.indexVisible) failures.push("Index not reachable from opening");
if (!report.desktop.noOverflow || !report.mobile.noOverflow || !report.reducedMotion.noOverflow) failures.push("Horizontal overflow");
if (report.desktop.silenceTarget !== "/first-contact") failures.push("Silence entry handoff failed");
if (report.mobile.soundTarget !== "/first-contact") failures.push("Sound entry handoff failed");
if (!report.mobile.soundStateVisible) failures.push("Sound state did not persist into First Contact");
if (report.reducedMotion.target !== "/first-contact") failures.push("Reduced-motion handoff failed");
if (report.consoleErrors.length) failures.push(`Console errors: ${report.consoleErrors.length}`);
if (report.pageErrors.length) failures.push(`Page errors: ${report.pageErrors.length}`);

if (failures.length) {
  console.error("WALL_OF_EYES_QA=FAIL");
  console.error(failures.join("\n"));
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log("WALL_OF_EYES_QA=PASS");
