const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

const OUT_DIR = path.resolve(__dirname, '..', 'logs');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function waitForVite() {
  return new Promise((resolve, reject) => {
  // Use shell spawn to avoid EINVAL on Windows in some environments
  const proc = spawn('npm run dev -- --host', { cwd: path.resolve(__dirname, '..'), shell: true });
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => {
      proc.kill();
      reject(new Error('Vite start timeout'));
    }, 20000);

    proc.stdout.on('data', d => {
      const s = d.toString();
      stdout += s;
      fs.appendFileSync(path.join(OUT_DIR, 'vite.stdout.log'), s);
      // look for Local or Network URL
      const m = s.match(/http:\/\/[^\s]+:3000\//);
      if (m) {
        clearTimeout(timeout);
        resolve({ proc, url: m[0] });
      }
      // also check for 'Local:   http://localhost:3000/' line
      const lines = s.split(/\r?\n/);
      for (const line of lines) {
        const lm = line.match(/http:\/\/[^\s]+:3000\//);
        if (lm) {
          clearTimeout(timeout);
          resolve({ proc, url: lm[0] });
          return;
        }
      }
    });

    proc.stderr.on('data', d => {
      const s = d.toString(); stderr += s; fs.appendFileSync(path.join(OUT_DIR, 'vite.stderr.log'), s);
    });

    proc.on('exit', code => {
      clearTimeout(timeout);
      if (!stdout) reject(new Error('Vite exited early with code ' + code + '\n' + stderr));
    });
  });
}

async function runPuppeteerAgainst(url) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => { try { const txt = `${msg.type().toUpperCase()}: ${msg.text()}`; logs.push(txt); console.log(txt); } catch {} });
  page.on('pageerror', err => { const txt = `PAGE_ERROR: ${err.stack || err.message || err}`; logs.push(txt); console.error(txt); });

  // navigate
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  } catch (e) {
    console.error('Navigation failed', e.message);
  }

  await page.screenshot({ path: path.join(OUT_DIR, 'before.png'), fullPage: true });

  // click Inventory button by text
  try {
    const buttons = await page.$$('button');
    let clicked = false;
    for (const b of buttons) {
      const text = (await page.evaluate(el => el.innerText || el.textContent, b) || '').trim();
      if (/inventory/i.test(text)) { await b.click(); clicked = true; break; }
    }
    if (!clicked && buttons.length>0) { await buttons[0].click(); }
  } catch (e) { console.error('Click inventory failed', e.message); }

  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT_DIR, 'after_inventory_open.png'), fullPage: true });

  // capture event log
  try {
    const container = await page.$('[data-testid="event-log-container"]');
    if (container) {
      const txt = await page.evaluate(el => el.innerText, container);
      fs.writeFileSync(path.join(OUT_DIR, 'eventlog.txt'), txt, 'utf8');
    }
  } catch (e) { console.error('Capture eventlog failed', e.message); }

  // interact with first inventory item
  try {
    const itemRows = await page.$$('[data-testid="inventory-item-row"], .inventory-item, .inventory-row');
    if (itemRows && itemRows.length>0) {
      const first = itemRows[0];
      const buttons = await first.$$('button');
      let acted=false;
      for (const b of buttons) {
        const text = (await page.evaluate(el => el.innerText || el.textContent, b) || '').trim();
        if (/^Use$|^Equip$|^Drop$|^Discard|^Remove/i.test(text)) { await b.click(); acted=true; break; }
      }
      if (!acted && buttons.length>0) { await buttons[0].click(); }
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(OUT_DIR, 'after_item_action.png'), fullPage: true });
    } else {
      console.log('No inventory items found');
    }
  } catch (e) { console.error('Inventory interaction failed', e.message); }

  fs.writeFileSync(path.join(OUT_DIR, 'console.logs.txt'), logs.join('\n'), 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'page.html'), await page.content(), 'utf8');
  await browser.close();
}

(async () => {
  try {
    const { proc, url } = await waitForVite();
    console.log('Vite URL detected:', url);
    await runPuppeteerAgainst(url);
    console.log('Done puppeteer. Killing Vite.');
    proc.kill();
  } catch (e) {
    console.error('Error during repro:', e.stack || e.message || e);
    process.exit(2);
  }
})();
