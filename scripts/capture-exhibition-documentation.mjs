import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const outDir = path.resolve("public/documentation/selected-works");
const tempVideoDir = path.resolve("artifacts/documentation-video");

fs.rmSync(outDir, { recursive: true, force: true });
fs.rmSync(tempVideoDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(tempVideoDir, { recursive: true });

async function holdSignal(page) {
  const action = page.getByRole("button", { name: "HOLD THE SIGNAL" });
  await action.dispatchEvent("pointerdown", { pointerType: "mouse", button: 0 });
  await page.waitForTimeout(1550);
  if (await action.count()) {
    await action.dispatchEvent("pointerup", { pointerType: "mouse", button: 0 });
  }
  await page.getByText("SOMETHING THIRD", { exact: true }).waitFor({
    timeout: 5000,
  });
}

async function completeFirstContact(page) {
  await page.getByRole("button", { name: "TOUCH TO WAKE" }).click();
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "CONTINUE" }).click();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "CHANGE THE ANGLE" }).click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "CONTINUE" }).click();
  await page.waitForTimeout(850);
  await holdSignal(page);
  await page.waitForTimeout(1100);
  await page.getByRole("button", { name: "TOUCH THE SPACE BETWEEN" }).click();
  await page.waitForTimeout(1400);
}

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});

try {
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      screen: { width: 1440, height: 900 },
      colorScheme: "dark",
      recordVideo: {
        dir: tempVideoDir,
        size: { width: 1440, height: 900 },
      },
    });

    const page = await context.newPage();
    const video = page.video();

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(1400);
    await page.mouse.move(1110, 260, { steps: 24 });
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: path.join(outDir, "01-wall-of-eyes.png"),
      fullPage: true,
    });

    await page.mouse.move(320, 660, { steps: 20 });
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "ENTER IN SILENCE" }).click();
    await page.waitForURL("**/first-contact", { timeout: 5000 });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(outDir, "02-first-contact-object.png"),
      fullPage: true,
    });

    await completeFirstContact(page);
    await page.screenshot({
      path: path.join(outDir, "03-first-contact-third.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "FOLLOW THE SEAM" }).click();
    await page.waitForURL("**/seraph", { timeout: 6000 });
    await page.locator("canvas").waitFor({ timeout: 10000 });
    await page.waitForTimeout(2600);
    await page.mouse.move(930, 430, { steps: 30 });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(outDir, "04-seraph-the-body.png"),
      fullPage: true,
    });

    await page.mouse.move(760, 330, { steps: 20 });
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "CONTINUE" }).click();
    await page.waitForURL("**/afterimage", { timeout: 5000 });
    await page.locator("canvas").waitFor({ timeout: 10000 });
    await page.waitForTimeout(1100);
    await page.screenshot({
      path: path.join(outDir, "05-afterimage.png"),
      fullPage: true,
    });

    await page.waitForTimeout(7800);
    await page.screenshot({
      path: path.join(outDir, "06-end-state.png"),
      fullPage: true,
    });
    await page.waitForTimeout(1400);

    await context.close();

    if (video) {
      const source = await video.path();
      fs.copyFileSync(
        source,
        path.join(outDir, "selected-works-walkthrough.webm"),
      );
    }
  }

  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      screen: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      colorScheme: "dark",
    });
    const page = await context.newPage();

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(1100);
    await page.screenshot({
      path: path.join(outDir, "07-mobile-wall-of-eyes.png"),
      fullPage: true,
    });

    await page.goto(baseUrl + "/seraph", { waitUntil: "domcontentloaded" });
    await page.locator("canvas").waitFor({ timeout: 10000 });
    await page.waitForTimeout(2400);
    await page.screenshot({
      path: path.join(outDir, "08-mobile-seraph.png"),
      fullPage: true,
    });

    await context.close();
  }
} finally {
  await browser.close();
}

const manifest = {
  title: "OMAR KHAIR — SELECTED WORKS",
  year: 2026,
  sourceCommit: process.env.GITHUB_SHA ?? null,
  productionUrl: "https://omar-khair.vercel.app/",
  files: [
    {
      file: "01-wall-of-eyes.png",
      caption: "WALL OF EYES — exhibition entrance / procedural witness field.",
      recommendedUse: "cover / lead image",
    },
    {
      file: "02-first-contact-object.png",
      caption: "FIRST CONTACT — the encounter begins with object, distance and signal.",
      recommendedUse: "process / sequence",
    },
    {
      file: "03-first-contact-third.png",
      caption: "FIRST CONTACT — the third state formed through interaction.",
      recommendedUse: "sequence / detail",
    },
    {
      file: "04-seraph-the-body.png",
      caption: "SERAPH / THE BODY — canonical responsive digital body inside the exhibition.",
      recommendedUse: "hero / key artwork image",
    },
    {
      file: "05-afterimage.png",
      caption: "FINAL TRACE — the remembered SERAPH body persists after disappearance.",
      recommendedUse: "hero / ending",
    },
    {
      file: "06-end-state.png",
      caption: "OMAR KHAIR — SELECTED WORKS / final exhibition state.",
      recommendedUse: "closing image",
    },
    {
      file: "07-mobile-wall-of-eyes.png",
      caption: "WALL OF EYES — mobile exhibition view.",
      recommendedUse: "responsive documentation",
    },
    {
      file: "08-mobile-seraph.png",
      caption: "SERAPH / THE BODY — mobile exhibition view.",
      recommendedUse: "responsive documentation",
    },
    {
      file: "selected-works-walkthrough.webm",
      caption: "Silent documentation walkthrough of the final exhibition sequence.",
      recommendedUse: "submission / documentation video",
    },
  ],
};

fs.writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);

console.log("DOCUMENTATION_CAPTURE=PASS");
console.log(outDir);
