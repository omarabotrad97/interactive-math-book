import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const TARGET_URL = process.argv[2] || 'http://127.0.0.1:4173';
const OUT_ARG_INDEX = process.argv.indexOf('--out');
const SCREENSHOT_DIR =
  OUT_ARG_INDEX !== -1 && process.argv[OUT_ARG_INDEX + 1]
    ? path.resolve(process.argv[OUT_ARG_INDEX + 1])
    : path.join(os.tmpdir(), 'book-mobile-rtl-verify');

const VIEWPORTS = [
  { name: 'compact-320', width: 320, height: 568, mobile: true },
  { name: 'android-360', width: 360, height: 640, mobile: true },
  { name: 'ios-se-375', width: 375, height: 667, mobile: true },
  { name: 'modern-390', width: 390, height: 844, mobile: true },
  { name: 'tablet-768', width: 768, height: 1024, mobile: false },
  { name: 'desktop-1280', width: 1280, height: 800, mobile: false },
];

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  let hasFailure = false;

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
        locale: 'ar-SA',
      });
      const page = await context.newPage();
      const errors = [];

      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(`console.error: ${msg.text()}`);
        }
      });

      await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(300);

      const audit = await page.evaluate(() => {
        const html = document.documentElement;
        const dir = html.getAttribute('dir') || getComputedStyle(html).direction;
        const lang = html.getAttribute('lang') || '';
        const scrollWidth = html.scrollWidth;
        const innerWidth = window.innerWidth;
        const horizontalOverflow = scrollWidth - innerWidth;

        const isVisible = (el) => {
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
            return false;
          }
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        };

        const interactiveSelector =
          'button, a[href], [role="button"], [role="tab"], input:not([type="hidden"]), textarea';
        const smallTargets = [];
        for (const el of document.querySelectorAll(interactiveSelector)) {
          if (!isVisible(el)) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width < 44 || rect.height < 44) {
            smallTargets.push({
              tag: el.tagName.toLowerCase(),
              id: el.id || null,
              className: typeof el.className === 'string' ? el.className.trim().slice(0, 50) : '',
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            });
          }
        }

        const floatingOverlays = [];
        for (const el of document.querySelectorAll('*')) {
          const style = getComputedStyle(el);
          if (
            (style.position === 'fixed' || style.position === 'sticky') &&
            style.pointerEvents !== 'none' &&
            isVisible(el)
          ) {
            floatingOverlays.push({
              el,
              rect: el.getBoundingClientRect(),
              zIndex: Number(style.zIndex) || 0,
              label: el.id || el.className || el.tagName,
            });
          }
        }

        const occludedTargets = [];
        for (const el of document.querySelectorAll(interactiveSelector)) {
          if (!isVisible(el)) continue;
          const rect = el.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
          for (const overlay of floatingOverlays) {
            if (overlay.el === el || overlay.el.contains(el) || el.contains(overlay.el)) continue;
            const overlapX = Math.max(0, Math.min(rect.right, overlay.rect.right) - Math.max(rect.left, overlay.rect.left));
            const overlapY = Math.max(0, Math.min(rect.bottom, overlay.rect.bottom) - Math.max(rect.top, overlay.rect.top));
            if (overlapX > 4 && overlapY > 4) {
              occludedTargets.push({
                target: el.id || el.textContent?.trim().slice(0, 30) || el.tagName,
                overlay: String(overlay.label).slice(0, 40),
              });
            }
          }
        }

        return {
          dir,
          lang,
          scrollWidth,
          innerWidth,
          horizontalOverflow,
          smallTargetsCount: smallTargets.length,
          smallTargetsSample: smallTargets.slice(0, 8),
          occludedCount: occludedTargets.length,
          occludedSample: occludedTargets.slice(0, 8),
        };
      });

      const shotPath = path.join(SCREENSHOT_DIR, `${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });

      const rtlOk = audit.dir.toLowerCase() === 'rtl' && audit.lang.toLowerCase().startsWith('ar');
      const overflowOk = audit.horizontalOverflow <= 1;
      const errorsOk = errors.length === 0;

      if (!rtlOk || !overflowOk || !errorsOk) {
        hasFailure = true;
      }

      console.log(
        JSON.stringify(
          {
            viewport: vp.name,
            size: `${vp.width}x${vp.height}`,
            rtlOk,
            overflowPx: audit.horizontalOverflow,
            smallTargetsCount: audit.smallTargetsCount,
            smallTargetsSample: audit.smallTargetsSample,
            occludedCount: audit.occludedCount,
            occludedSample: audit.occludedSample,
            errors,
            screenshot: shotPath,
          },
          null,
          2
        )
      );

      await context.close();
    }
  } finally {
    await browser.close();
  }

  if (hasFailure) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
