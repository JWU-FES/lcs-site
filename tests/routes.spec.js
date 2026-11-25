const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROUTES = 'le-club notre-mission organisation valeurs impact actualites nos-programmes ateliers avantages le-reseau espace-membres learn nos-evenements rejoindre-le-club recrutement integration sponsoring partenaires faq nous-ecrire legal confidentialite conditions'.split(' ');
const REDIRECTS = { 'tables-rondes': 'nos-evenements', 'online-meetings': 'nos-evenements', 'leadershe-talks': 'nos-evenements', conferences: 'nos-evenements', 'the-first-step': 'nos-evenements', 'les-opportunites': 'le-reseau', 'lcs-family': 'le-club', 'nous-suivre': 'actualites' };
const SIZES = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const live = !!process.env.BASE_URL;
const LIVE_ROUTES = ['', 'sponsoring', 'organisation', 'nos-evenements', 'espace-membres'];

// Known third-party noise is not a site error; everything else fails the test.
function trackErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  return errors;
}

for (const [name, size] of Object.entries(SIZES)) {
  test.describe(name, () => {
    test.use({ viewport: size });

    for (const r of (live ? LIVE_ROUTES : ['', ...ROUTES])) {
      test(`route #${r || 'home'}`, async ({ page }) => {
        const errors = trackErrors(page);
        await page.goto('/#' + r);
        await page.waitForLoadState('load');
        await page.waitForTimeout(400);
        await expect(page.locator('h1:visible').first()).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, 'horizontal overflow px').toBeLessThanOrEqual(0);
        expect(errors).toEqual([]);
      });
    }

    if (!live) {
      for (const [from, to] of Object.entries(REDIRECTS)) {
        test(`redirect #${from} -> #${to}`, async ({ page }) => {
          await page.goto('/#' + from);
          await expect.poll(() => page.evaluate(() => location.hash)).toBe('#' + to);
        });
      }

      test('no duplicate ids on any route', async ({ page }) => {
        for (const r of ROUTES) {
          await page.goto('/#' + r);
          await page.waitForTimeout(200);
          const dups = await page.evaluate(() => {
            const seen = {}, d = [];
            document.querySelectorAll('[id]').forEach(e => { seen[e.id] = (seen[e.id] || 0) + 1; });
            for (const k in seen) if (seen[k] > 1) d.push(k);
            return d;
          });
          expect(dups, 'duplicate ids on #' + r).toEqual([]);
        }
      });
    }
  });
}

if (!live) {
  test('links: internal hashes resolve, external hrefs well formed', async ({ page }) => {
    test.setTimeout(180000);
    const hrefs = new Set();
    const all = ['', ...ROUTES];
    for (const r of all) {
      await page.goto('/#' + r);
      await page.waitForTimeout(200);
      (await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href')))).forEach(h => hrefs.add(h));
    }
    const known = new Set([...ROUTES, ...Object.keys(REDIRECTS), '', 'top']);
    const TOPICS = ['leadership', 'reseau', 'carriere', 'parole'];
    console.log('hash links:', [...hrefs].filter(h => h.startsWith('#')).join(' '));
    const bad = [];
    for (const h of hrefs) {
      if (h.startsWith('#')) {
        const id = h.slice(1);
        if (known.has(id)) continue;
        const lm = id.match(/^learn\/([a-z]+)(?:\/(\d+))?$/);
        if (lm && TOPICS.includes(lm[1])) continue;
        const [base] = id.split('/');
        if (id.includes('/') && ROUTES.includes(base)) {
          await page.goto('/#' + id); await page.waitForTimeout(200);
          const ok = await page.locator('h1:visible').count();
          if (ok) continue;
        }
        // in-page anchor: must exist on some route
        let found = false;
        for (const r of all) { await page.goto('/#' + r); if (await page.locator(`[id="${id}"]`).count()) { found = true; break; } }
        if (!found) bad.push(h);
      } else if (/^https?:/.test(h)) {
        try { new URL(h); } catch { bad.push(h); }
      } else if (!/^(mailto:|tel:)/.test(h)) bad.push(h);
    }
    expect(bad, 'broken links').toEqual([]);
    expect([...hrefs].some(h => h.includes('instagram.com/lcs.fegf'))).toBe(true);
    expect([...hrefs].some(h => h.startsWith('https://docs.google.com/forms/'))).toBe(true);
  });

  test('content guard: forbidden content must not appear', async () => {
    const html = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
    const banned = [/\[Amount\]/i, /be a speaker/i, /newsletter/i, /org(anisation)?[ -]?chart/i, /\b\d[\d ,.]*\s?(MAD|DH|Dhs)\b/i, /cotisation/i];
    const hits = banned.filter(r => r.test(html)).map(String);
    expect(hits, 'forbidden content found').toEqual([]);
  });
}

if (!live) {
  test.describe('interactions', () => {
    test('mobile menu opens and closes', async ({ page }) => {
      await page.setViewportSize(SIZES.mobile);
      await page.goto('/');
      const btn = page.locator('#burger');
      await expect(btn).toBeVisible();
      await btn.click();
      await expect(page.locator('html.menu-open')).toHaveCount(1);
      await expect(btn).toHaveAttribute('aria-expanded', 'true');
      await btn.click();
      await expect(page.locator('html.menu-open')).toHaveCount(0);
    });
    test('desktop mega-menu opens and closes', async ({ page }) => {
      await page.setViewportSize(SIZES.desktop);
      await page.goto('/');
      const trig = page.locator('.nav .nd-t').first();
      await expect(trig).toBeVisible();
      await trig.hover();
      await expect(page.locator('#mega.on')).toHaveCount(1);
      await expect(trig).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(page.locator('#mega.on')).toHaveCount(0);
    });
    test('members sign-in shows portal-soon message', async ({ page }) => {
      await page.goto('/#espace-membres');
      await page.fill('#mlE', 'test@example.com');
      await page.fill('#mlP', 'x');
      await page.click('form button[type=submit]');
      await expect(page.locator('#mlN')).toContainText('portal opens soon');
    });
    test('academy lesson: step through and answer a quiz question', async ({ page }) => {
      await page.goto('/#learn/leadership/1');
      const opt = page.locator('.ls-opt').first();
      for (let i = 0; i < 12 && !(await opt.isVisible()); i++) {
        await page.locator('#lsNext').click();
      }
      await expect(opt).toBeVisible();
      await opt.click();
      await expect(page.locator('#lsNext')).toBeVisible();
    });
  });
}
