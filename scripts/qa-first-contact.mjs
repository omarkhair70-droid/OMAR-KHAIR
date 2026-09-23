import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const outDir = path.resolve("artifacts/first-contact-qa");
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

async function holdSignal(page) {
  const action = page.getByRole("button", { name: "HOLD THE SIGNAL" });
  await action.dispatchEvent("pointerdown", { pointerType: "mouse", button: 0 });
  await page.waitForTimeout(1450);
  await action.dispatchEvent("pointerup", { pointerType: "mouse", button: 0 });
  await page.getByText("SOMETHING THIRD", { exact: true }).waitFor({ timeout: 5000 });
}

async function advanceToSignal(page) {
  await page.getByRole("button", { name: "TOUCH TO WAKE" }).click();
  await page.getByRole("button", { name: "CONTINUE" }).click();
  await page.getByRole("button", { name: "CHANGE THE ANGLE" }).click();
  await page.waitForTimeout(450);
  await page.getByRole("button", { name: "CONTINUE" }).click();
  await page.getByRole("button", { name: "HOLD THE SIGNAL" }).waitFor();
}

const browser = await chromium.launch({ headless: true });

try {
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: { dir: path.join(outDir, "video"), size: { width: 1440, height: 900 } },
    });
    const page = await context.newPage();
    attachErrors(page, "desktop");

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    report.desktop.entranceTitle = await page.getByText("OMAR KHAIR", { exact: true }).count();
    await page.getByRole("button", { name: "ENTER IN SILENCE" }).click();
    await page.waitForURL("**/first-contact");
    await page.waitForTimeout(650);

    report.desktop.canvas = await page.locator("canvas").count();
    report.desktop.noOverflowObject = await noHorizontalOverflow(page);
    await page.screenshot({ path: path.join(outDir, "desktop-01-object.png"), fullPage: true });

    await page.getByRole("button", { name: "TOUCH TO WAKE" }).click();
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(outDir, "desktop-02-gap.png"), fullPage: true });

    await page.getByRole("button", { name: "CONTINUE" }).click();
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(outDir, "desktop-03-angle-misaligned.png"), fullPage: true });

    await page.getByRole("button", { name: "CHANGE THE ANGLE" }).click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(outDir, "desktop-04-angle-aligned.png"), fullPage: true });

    await page.getByRole("button", { name: "CONTINUE" }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, "desktop-05-signal-stalled.png"), fullPage: true });

    await holdSignal(page);
    await page.waitForTimeout(650);
    await page.screenshot({ path: path.join(outDir, "desktop-06-third-cold.png"), fullPage: true });

    await page.getByRole("button", { name: "TOUCH THE SPACE BETWEEN" }).click();
    await page.waitForTimeout(650);
    await page.screenshot({ path: path.join(outDir, "desktop-07-third-warm.png"), fullPage: true });

    await page.getByRole("button", { name: "CONTEXT" }).click();
    report.desktop.contextVisible = await page.getByText("SOURCE WORK / FIRST CONTACT", { exact: true }).isVisible();
    await page.screenshot({ path: path.join(outDir, "desktop-08-context.png"), fullPage: true });
    await page.getByRole("button", { name: "CLOSE" }).click();

    await page.getByRole("button", { name: "INDEX" }).click();
    report.desktop.indexVisible = await page.getByRole("heading", { name: "SELECTED WORKS" }).isVisible();
    await page.getByRole("button", { name: "CLOSE" }).click();

    await page.getByRole("button", { name: "FOLLOW THE SEAM" }).click();
    await page.waitForTimeout(180);
    await page.screenshot({ path: path.join(outDir, "desktop-09-residue.png"), fullPage: true });
    await page.waitForURL("**/seraph", { timeout: 5000 });
    report.desktop.transitionTarget = new URL(page.url()).pathname;
    report.desktop.noOverflowEnd = await noHorizontalOverflow(page);

    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    attachErrors(page, "mobile");

    await page.goto(`${baseUrl}/first-contact`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    report.mobile.canvas = await page.locator("canvas").count();
    report.mobile.noOverflowObject = await noHorizontalOverflow(page);
    await page.screenshot({ path: path.join(outDir, "mobile-01-object.png"), fullPage: true });

    await advanceToSignal(page);
    await holdSignal(page);
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "TOUCH THE SPACE BETWEEN" }).click();
    await page.waitForTimeout(500);
    report.mobile.noOverflowWarm = await noHorizontalOverflow(page);
    await page.screenshot({ path: path.join(outDir, "mobile-02-third-warm.png"), fullPage: true });

    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    attachErrors(page, "reduced-motion");

    await page.goto(`${baseUrl}/first-contact`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    report.reducedMotion.noOverflow = await noHorizontalOverflow(page);
    report.reducedMotion.canvas = await page.locator("canvas").count();
    await page.screenshot({ path: path.join(outDir, "reduced-motion-object.png"), fullPage: true });

    await context.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));

const failures = [];
if (!report.desktop.entranceTitle) failures.push("Entrance identity missing");
if (!report.desktop.canvas) failures.push("Desktop canvas missing");
if (!report.mobile.canvas) failures.push("Mobile canvas missing");
if (!report.reducedMotion.canvas) failures.push("Reduced-motion canvas missing");
if (!report.desktop.noOverflowObject || !report.desktop.noOverflowEnd) failures.push("Desktop horizontal overflow");
if (!report.mobile.noOverflowObject || !report.mobile.noOverflowWarm) failures.push("Mobile horizontal overflow");
if (!report.reducedMotion.noOverflow) failures.push("Reduced-motion horizontal overflow");
if (!report.desktop.contextVisible) failures.push("Context layer failed");
if (!report.desktop.indexVisible) failures.push("Index failed");
if (report.desktop.transitionTarget !== "/seraph") failures.push("First Contact did not hand off to /seraph");
if (report.consoleErrors.length) failures.push(`Console errors: ${report.consoleErrors.length}`);
if (report.pageErrors.length) failures.push(`Page errors: ${report.pageErrors.length}`);

if (failures.length) {
  console.error("FIRST_CONTACT_QA=FAIL");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("FIRST_CONTACT_QA=PASS");
