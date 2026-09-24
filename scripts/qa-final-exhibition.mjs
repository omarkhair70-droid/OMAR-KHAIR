import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const outDir = path.resolve("artifacts/final-exhibition-qa");
fs.mkdirSync(outDir, { recursive: true });

const report = {
  baseUrl,
  desktop: {},
  mobile: {},
  reducedMotion: {},
  assets: [],
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
    if (url.includes("/assets/serara-canonical.glb")) {
      report.assets.push({
        label,
        path: new URL(url).pathname,
        status: response.status(),
      });
    }
  });
}

async function noOverflow(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
}

async function holdSignal(page) {
  const action = page.getByRole("button", { name: "HOLD THE SIGNAL" });
  await action.dispatchEvent("pointerdown", { pointerType: "mouse", button: 0 });
  await page.waitForTimeout(1450);
  if (await action.count()) {
    await action.dispatchEvent("pointerup", { pointerType: "mouse", button: 0 });
  }
  await page.getByText("SOMETHING THIRD", { exact: true }).waitFor({
    timeout: 5000,
  });
}

async function completeFirstContact(page) {
  await page.getByRole("button", { name: "TOUCH TO WAKE" }).click();
  await page.getByRole("button", { name: "CONTINUE" }).click();
  await page.getByRole("button", { name: "CHANGE THE ANGLE" }).click();
  await page.waitForTimeout(350);
  await page.getByRole("button", { name: "CONTINUE" }).click();
  await holdSignal(page);
  await page.getByRole("button", { name: "TOUCH THE SPACE BETWEEN" }).click();
  await page.waitForTimeout(420);
  await page.getByRole("button", { name: "FOLLOW THE SEAM" }).click();
  await page.waitForURL("**/seraph", { timeout: 6000 });
}

async function primeAfterimage(page) {
  await page.addInitScript(() => {
    sessionStorage.setItem(
      "omar-khair-exhibition-session-v1",
      JSON.stringify({
        soundMode: "off",
        visitedRooms: ["first-contact", "seraph"],
        roomOrder: ["first-contact", "seraph"],
        roomResidues: {
          "first-contact": "warm-seam",
          seraph: "body-contour",
          "seraph-memory": JSON.stringify({
            phase: "aftermath",
            grace: 0.18,
            tension: 0.22,
            fall: 0.68,
            recognition: 0.62,
            stillness: 0.78,
            afterimage: 0.74,
            residue: 0.56,
            heat: 0.31,
            attentionX: 0.18,
            attentionY: -0.08,
          }),
        },
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
    attach(page, "desktop-full-sequence");

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    report.desktop.entranceEyes = await page.locator("[data-eye]").count();
    report.desktop.entranceIdentity = await page
      .getByRole("heading", { name: "OMAR KHAIR" })
      .isVisible();
    report.desktop.entranceNoOverflow = await noOverflow(page);
    await page.screenshot({
      path: path.join(outDir, "desktop-01-entrance.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "ENTER IN SILENCE" }).click();
    await page.waitForURL("**/first-contact", { timeout: 5000 });
    report.desktop.firstContactRoute = new URL(page.url()).pathname;
    report.desktop.firstContactNoOverflow = await noOverflow(page);

    await completeFirstContact(page);
    report.desktop.seraphRoute = new URL(page.url()).pathname;
    await page.locator("canvas").waitFor({ timeout: 10000 });
    await page.waitForTimeout(1800);
    report.desktop.seraphCanvas = await page.locator("canvas").count();
    report.desktop.seraphNoOverflow = await noOverflow(page);
    await page.screenshot({
      path: path.join(outDir, "desktop-02-seraph.png"),
      fullPage: true,
    });

    await page.mouse.move(930, 430);
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "CONTINUE" }).click();
    await page.waitForURL("**/afterimage", { timeout: 5000 });
    report.desktop.afterimageRoute = new URL(page.url()).pathname;
    await page.locator("canvas").waitFor({ timeout: 10000 });
    await page.waitForTimeout(850);
    report.desktop.afterimageCanvas = await page.locator("canvas").count();
    report.desktop.afterimageNoOverflow = await noOverflow(page);
    report.desktop.afterimageIdentityHiddenInitially =
      (await page.getByText("SELECTED WORKS / 2026", { exact: true }).count()) === 0;

    await page.screenshot({
      path: path.join(outDir, "desktop-03-afterimage-body.png"),
      fullPage: true,
    });

    await page.waitForTimeout(8100);
    report.desktop.endIdentity = await page
      .getByText("SELECTED WORKS / 2026", { exact: true })
      .isVisible();
    report.desktop.endIndex = await page
      .getByRole("button", { name: "INDEX" })
      .isVisible();
    report.desktop.endReenter = await page
      .getByRole("button", { name: "RE-ENTER" })
      .isVisible();

    await page.screenshot({
      path: path.join(outDir, "desktop-04-end-state.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "INDEX" }).click();
    const indexText = await page.locator("body").innerText();
    report.desktop.indexHasFirstContact = indexText.includes("FIRST CONTACT");
    report.desktop.indexHasSeraph = indexText.includes("SERAPH");
    report.desktop.indexLeaksFokhara = indexText.includes("FOKHARA");
    await page.getByRole("button", { name: "CLOSE" }).click();

    await page.getByRole("button", { name: "RE-ENTER" }).click();
    await page.waitForURL(baseUrl + "/", { timeout: 5000 });
    report.desktop.reenterRoute = new URL(page.url()).pathname;

    const retiredRoutePage = await context.newPage();
    const fokhara = await retiredRoutePage.goto(baseUrl + "/fokhara", {
      waitUntil: "domcontentloaded",
    });
    report.desktop.fokharaStatus = fokhara?.status() ?? 0;
    await retiredRoutePage.close();

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

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    report.mobile.entranceEyes = await page.locator("[data-eye]").count();
    report.mobile.entranceNoOverflow = await noOverflow(page);
    await page.screenshot({
      path: path.join(outDir, "mobile-01-entrance.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "ENTER WITH SOUND" }).click();
    await page.waitForURL("**/first-contact", { timeout: 5000 });
    report.mobile.soundState = await page
      .getByRole("button", { name: /SOUND ON/i })
      .isVisible();
    report.mobile.firstContactNoOverflow = await noOverflow(page);

    await page.goto(baseUrl + "/seraph", { waitUntil: "domcontentloaded" });
    await page.locator("canvas").waitFor({ timeout: 10000 });
    await page.waitForTimeout(1600);
    report.mobile.seraphCanvas = await page.locator("canvas").count();
    report.mobile.seraphNoOverflow = await noOverflow(page);
    await page.screenshot({
      path: path.join(outDir, "mobile-02-seraph.png"),
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
    await primeAfterimage(page);

    await page.goto(baseUrl + "/afterimage", { waitUntil: "domcontentloaded" });
    await page.locator("canvas").waitFor({ timeout: 10000 });
    report.reducedMotion.afterimageCanvas = await page.locator("canvas").count();
    report.reducedMotion.noOverflow = await noOverflow(page);
    await page.waitForTimeout(2100);
    report.reducedMotion.endIdentity = await page
      .getByText("SELECTED WORKS / 2026", { exact: true })
      .isVisible();
    await page.screenshot({
      path: path.join(outDir, "reduced-motion-01-end-state.png"),
      fullPage: true,
    });

    await context.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(
  path.join(outDir, "report.json"),
  JSON.stringify(report, null, 2),
);

const failures = [];

if ((report.desktop.entranceEyes ?? 0) < 6) failures.push("Desktop entrance eye field missing");
if ((report.mobile.entranceEyes ?? 0) < 6) failures.push("Mobile entrance eye field missing");
if (!report.desktop.entranceIdentity) failures.push("Entrance identity missing");
if (report.desktop.firstContactRoute !== "/first-contact") failures.push("Entrance → First Contact failed");
if (report.desktop.seraphRoute !== "/seraph") failures.push("First Contact → SERAPH failed");
if (report.desktop.afterimageRoute !== "/afterimage") failures.push("SERAPH → Afterimage failed");
if (!report.desktop.seraphCanvas || !report.mobile.seraphCanvas) failures.push("SERAPH canvas missing");
if (!report.desktop.afterimageCanvas) failures.push("Afterimage body canvas missing");
if (!report.desktop.afterimageIdentityHiddenInitially) failures.push("End identity appears before afterimage settles");
if (!report.desktop.endIdentity || !report.desktop.endIndex || !report.desktop.endReenter) failures.push("Final end state incomplete");
if (!report.desktop.indexHasFirstContact || !report.desktop.indexHasSeraph) failures.push("Final INDEX missing current works");
if (report.desktop.indexLeaksFokhara) failures.push("Fokhara leaked into final INDEX");
if (report.desktop.reenterRoute !== "/") failures.push("RE-ENTER failed");
if (report.desktop.fokharaStatus !== 404) failures.push(`/fokhara is still publicly reachable (status ${report.desktop.fokharaStatus})`);
if (!report.mobile.soundState) failures.push("Sound choice did not persist on mobile");
if (!report.reducedMotion.afterimageCanvas || !report.reducedMotion.endIdentity) failures.push("Reduced-motion ending incomplete");

for (const [label, ok] of Object.entries({
  entranceDesktop: report.desktop.entranceNoOverflow,
  firstContactDesktop: report.desktop.firstContactNoOverflow,
  seraphDesktop: report.desktop.seraphNoOverflow,
  afterimageDesktop: report.desktop.afterimageNoOverflow,
  entranceMobile: report.mobile.entranceNoOverflow,
  firstContactMobile: report.mobile.firstContactNoOverflow,
  seraphMobile: report.mobile.seraphNoOverflow,
  reducedMotion: report.reducedMotion.noOverflow,
})) {
  if (!ok) failures.push(`Horizontal overflow: ${label}`);
}

if (!report.assets.some((asset) => asset.path.includes("serara-canonical.glb") && asset.status === 200)) {
  failures.push("Canonical SERAPH GLB did not load with HTTP 200");
}
if (report.consoleErrors.length) failures.push(`Console errors: ${report.consoleErrors.length}`);
if (report.pageErrors.length) failures.push(`Page errors: ${report.pageErrors.length}`);

if (failures.length) {
  console.error("FINAL_EXHIBITION_QA=FAIL");
  console.error(failures.join("\n"));
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log("FINAL_EXHIBITION_QA=PASS");
