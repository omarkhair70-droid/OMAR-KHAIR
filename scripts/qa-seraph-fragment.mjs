import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const outDir = path.resolve("artifacts/seraph-fragment-qa");
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
    if (
      url.includes("/assets/serara-canonical.glb") ||
      url.includes("/assets/serara-cinematic/audio/")
    ) {
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

async function primeFirstContactResidue(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "omar-khair-exhibition-session-v1",
      JSON.stringify({
        soundMode: "off",
        visitedRooms: ["first-contact"],
        roomOrder: ["first-contact"],
        roomResidues: { "first-contact": "warm-seam" },
      }),
    );
  });
}

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});

try {
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: "dark",
    });
    const page = await context.newPage();
    attach(page, "desktop");
    await primeFirstContactResidue(page);

    await page.goto(`${baseUrl}/seraph`, { waitUntil: "domcontentloaded" });
    await page.locator("canvas").waitFor({ timeout: 10000 });
    await page.waitForTimeout(1800);

    report.desktop.canvas = await page.locator("canvas").count();
    report.desktop.sourceHeader = await page.getByText("SERARA://01", { exact: true }).isVisible();
    report.desktop.sourceTitle = await page.getByText("THE BODY · CINEMATIC CHAMBER", { exact: true }).isVisible();
    report.desktop.exhibitionLabel = await page.getByText("SERAPH", { exact: true }).isVisible();
    report.desktop.context = await page.getByRole("button", { name: "CONTEXT" }).isVisible();
    report.desktop.continue = await page.getByRole("button", { name: "CONTINUE" }).isVisible();
    report.desktop.noOverflow = await noOverflow(page);

    await page.screenshot({
      path: path.join(outDir, "desktop-01-canonical-body.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "CONTEXT" }).click();
    report.desktop.contextPanel = await page.getByRole("heading", { name: "THE BODY" }).isVisible();
    await page.screenshot({
      path: path.join(outDir, "desktop-02-context.png"),
      fullPage: true,
    });
    await page.getByRole("button", { name: "CLOSE" }).click();

    await page.getByRole("button", { name: "INDEX" }).click();
    report.desktop.indexVisible = await page.getByRole("heading", { name: "SELECTED WORKS" }).isVisible();
    await page.getByRole("button", { name: "CLOSE" }).click();

    await page.getByRole("button", { name: "CONTINUE" }).click();
    await page.waitForTimeout(320);
    await page.screenshot({
      path: path.join(outDir, "desktop-03-exit-contour.png"),
      fullPage: true,
    });
    await page.waitForURL("**/fokhara", { timeout: 5000 });
    report.desktop.exitTarget = new URL(page.url()).pathname;

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
    attach(page, "mobile");

    await page.goto(`${baseUrl}/seraph`, { waitUntil: "domcontentloaded" });
    await page.locator("canvas").waitFor({ timeout: 10000 });
    await page.waitForTimeout(1800);

    report.mobile.canvas = await page.locator("canvas").count();
    report.mobile.sourceHeader = await page.getByText("SERARA://01", { exact: true }).isVisible();
    report.mobile.noOverflow = await noOverflow(page);

    await page.screenshot({
      path: path.join(outDir, "mobile-01-canonical-body.png"),
      fullPage: true,
    });

    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
      colorScheme: "dark",
    });
    const page = await context.newPage();
    attach(page, "reduced-motion");

    await page.goto(`${baseUrl}/seraph`, { waitUntil: "domcontentloaded" });
    await page.locator("canvas").waitFor({ timeout: 10000 });
    await page.waitForTimeout(1600);

    report.reducedMotion.canvas = await page.locator("canvas").count();
    report.reducedMotion.noOverflow = await noOverflow(page);

    await page.screenshot({
      path: path.join(outDir, "reduced-motion-01-canonical-body.png"),
      fullPage: true,
    });

    await context.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));

const failures = [];
if (!report.desktop.canvas) failures.push("Desktop SERAPH canvas missing");
if (!report.mobile.canvas) failures.push("Mobile SERAPH canvas missing");
if (!report.reducedMotion.canvas) failures.push("Reduced-motion SERAPH canvas missing");
if (!report.desktop.sourceHeader || !report.desktop.sourceTitle) failures.push("Canonical source labels missing");
if (!report.desktop.exhibitionLabel) failures.push("Exhibition SERAPH label missing");
if (!report.desktop.context || !report.desktop.continue) failures.push("Exhibition controls missing");
if (!report.desktop.contextPanel) failures.push("SERAPH context panel failed");
if (!report.desktop.indexVisible) failures.push("INDEX not reachable");
if (report.desktop.exitTarget !== "/fokhara") failures.push("SERAPH exit did not hand off to Fokhara");
if (!report.desktop.noOverflow || !report.mobile.noOverflow || !report.reducedMotion.noOverflow) failures.push("Horizontal overflow");
if (!report.assetResponses.some((item) => item.url.includes("serara-canonical.glb") && item.status === 200)) failures.push("Canonical GLB was not loaded successfully");
if (report.consoleErrors.length) failures.push(`Console errors: ${report.consoleErrors.length}`);
if (report.pageErrors.length) failures.push(`Page errors: ${report.pageErrors.length}`);

if (failures.length) {
  console.error("SERAPH_FRAGMENT_QA=FAIL");
  console.error(failures.join("\n"));
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log("SERAPH_FRAGMENT_QA=PASS");
