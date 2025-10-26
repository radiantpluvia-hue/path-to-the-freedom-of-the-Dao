const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OUT_DIR = path.resolve(__dirname, '..', 'logs');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const preferred = process.env.URL ? [process.env.URL] : [];
  const urlCandidates = [...preferred, 'http://127.0.0.1:3000', 'http://localhost:3000', 'http://192.168.1.9:3000', 'http://192.168.1.5:3000'];
  let url = urlCandidates[0];
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const logs = [];

  page.on('console', msg => {
    try {
      const txt = `${msg.type().toUpperCase()}: ${msg.text()}`;
      logs.push(txt);
      console.log(txt);
    } catch (e) { /* ignore */ }
  });

  page.on('pageerror', err => {
    const txt = `PAGE_ERROR: ${err.stack || err.message || err}`;
    logs.push(txt);
    console.error(txt);
  });

  // wait for site to be up (try multiple hosts)
  let up = false;
  let lastError = null;
  for (const candidate of urlCandidates) {
    for (let i=0;i<20;i++) {
      try {
        const res = await page.goto(candidate, { waitUntil: 'domcontentloaded', timeout: 8000 });
        if (res && res.status && res.status() < 400) { url = candidate; up = true; break; }
      } catch (e) { lastError = e; }
      await new Promise(r => setTimeout(r, 500));
    }
    if (up) break;
  }
  if (!up) {
    console.error('Site unreachable at any candidate URL. Last error:', lastError && lastError.message);
    await browser.close();
    process.exit(2);
  }

  // Take initial screenshot
  await page.screenshot({ path: path.join(OUT_DIR, 'before.png'), fullPage: true });

  // Try to click Inventory button. Try several selectors.
  const inventorySelectors = [
    '[data-testid="inventory-button"]',
    'button#inventory',
    'button[title="Inventory"]',
    'button:contains("Inventory")',
    'button:has-text("Inventory")',
    'button',
  ];

  let clickedInventory = false;

  // prefer data-testid or button with text "Inventory". Use page.$$ to inspect.
  try {
    // attempt to find by text matching
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = (await page.evaluate(el => el.innerText || el.textContent, b) || '').trim();
      if (/inventory/i.test(text)) {
        await b.click();
        clickedInventory = true;
        break;
      }
    }
  } catch (e) { /* ignore */ }

  if (!clickedInventory) {
    // fallback: click the first button (risky)
    try {
      const b = (await page.$$('button'))[0];
      if (b) { await b.click(); clickedInventory = true; }
    } catch (e) { /* ignore */ }
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'after_inventory_open.png'), fullPage: true });

  // capture event log container
  let eventLogText = '';
  try {
    const container = await page.$('[data-testid="event-log-container"]');
    if (container) {
      eventLogText = await page.evaluate(el => el.innerText, container);
      fs.writeFileSync(path.join(OUT_DIR, 'eventlog.txt'), eventLogText, 'utf8');
    } else {
      // try common alternatives
      const el = await page.$('.event-log, #event-log');
      if (el) {
        eventLogText = await page.evaluate(el => el.innerText, el);
        fs.writeFileSync(path.join(OUT_DIR, 'eventlog.txt'), eventLogText, 'utf8');
      }
    }
  } catch (e) { logs.push('EVENTLOG_CAPTURE_ERROR: ' + e.message); }

  // Try to interact with the first inventory item: click Use/Equip/Drop buttons inside inventory panel
  try {
    // find inventory item rows
    const itemRows = await page.$$('[data-testid="inventory-item-row"], .inventory-item, .inventory-row');
    if (itemRows && itemRows.length > 0) {
      const first = itemRows[0];
      // try to find Use/Equip/Drop buttons inside
      const btnTexts = ['Use', 'Equip', 'Drop', 'Discard', 'Remove'];
      const buttons = await first.$$('button');
      let acted = false;
      for (const b of buttons) {
        const text = (await page.evaluate(el => el.innerText || el.textContent, b) || '').trim();
        if (btnTexts.some(t => new RegExp('^' + t + '$', 'i').test(text))) {
          await b.click(); acted = true; break;
        }
      }
      if (!acted && buttons.length>0) { await buttons[0].click(); }
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(OUT_DIR, 'after_item_action.png'), fullPage: true });
    } else {
      logs.push('NO_INVENTORY_ITEMS_FOUND');
    }
  } catch (e) { logs.push('INVENTORY_INTERACTION_ERROR:' + e.stack || e.message); }

  // Save console logs
  fs.writeFileSync(path.join(OUT_DIR, 'console.logs.txt'), logs.join('\n'), 'utf8');

  // save page HTML
  const html = await page.content();
  fs.writeFileSync(path.join(OUT_DIR, 'page.html'), html, 'utf8');

  await browser.close();
  console.log('Done. Logs/screenshot saved to', OUT_DIR);
})();
