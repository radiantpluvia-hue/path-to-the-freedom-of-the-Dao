const puppeteer = require('puppeteer');

// Config
const APP_URL = process.env.APP_URL || 'http://127.0.0.1:3000';
const WAIT_FOR_APP_MS = 45000;
const TIMEOUT = 30000;

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

const { URL } = require('url');
const http = require('http');
const https = require('https');

async function waitForApp(urlStr, timeoutMs){
  const start = Date.now();
  let lastErr = null;
  while(Date.now() - start < timeoutMs){
    try{
      const u = new URL(urlStr);
      const opts = {
        method: 'HEAD',
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname || '/',
        timeout: 2000,
      };
      const mod = u.protocol === 'https:' ? https : http;
      const ok = await new Promise((resolve, reject) => {
        const req = mod.request(opts, res => {
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        });
        req.on('error', err => reject(err));
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        req.end();
      });
      if(ok) return true;
    }catch(err){ lastErr = err; }
    await sleep(500);
  }
  console.error('waitForApp giving up. Last error:', lastErr && lastErr.message);
  return false;
}

(async ()=>{
  console.log('E2E training check starting — waiting for app at', APP_URL);
  const ready = await waitForApp(APP_URL, WAIT_FOR_APP_MS);
  if(!ready){
    console.error('App not reachable at', APP_URL);
    process.exit(2);
  }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try{
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(TIMEOUT);
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });

    // Ensure window.gameStore exists — wait up to 10s for app to initialize
    try{
      await page.waitForFunction(() => !!window.gameStore && !!window.gameStore.getState, { timeout: 10000 });
    } catch (e) {
      console.error('window.gameStore not found on page after wait');
      process.exit(3);
    }

    // Read initial stats safely (check both naming variants)
    const before = await page.evaluate(() => {
      const gs = window.gameStore.getState();
      const p = gs.player || {};
      const s = p.stats || {};
      return {
        atk: s.atk ?? s.attack ?? 0,
        def: s.def ?? s.defense ?? 0,
        speed: s.speed ?? s.agility ?? 0,
        hp: p.hp ?? p.maxHp ?? 0,
        qi: p.qi ?? p.maxQi ?? 0,
      };
    });

    console.log('Before training:', before);

    // Trigger a training action via the store. Try to call a well-known method: runTrainingSession or trainBody
    const actionResult = await page.evaluate(async () => {
      const gs = window.gameStore.getState();
      // Prefer direct runTrainingSession if present
      if(typeof gs.runTrainingSession === 'function'){
    // run a longer body training session (240 minutes) to ensure a measurable stat gain
    try{ const res = await gs.runTrainingSession(240, 'body'); return { ok: true, method: 'runTrainingSession', res }; } catch (e){ return { ok: false, err: String(e), method: 'runTrainingSession' }; }
        }
      // Fallbacks
      if(typeof gs.trainBody === 'function'){
        try{ gs.trainBody && gs.trainBody(1); return { ok: true, method: 'trainBody' }; } catch(e){ return { ok: false, err: String(e), method: 'trainBody' }; }
      }
      return { ok: false, err: 'no_training_method' };
    });

    console.log('Triggered training action:', actionResult);

    // Wait a bit for state to settle
    await sleep(1200);

    const after = await page.evaluate(() => {
      const gs = window.gameStore.getState();
      const p = gs.player || {};
      const s = p.stats || {};
      return {
        atk: s.atk ?? s.attack ?? 0,
        def: s.def ?? s.defense ?? 0,
        speed: s.speed ?? s.agility ?? 0,
        hp: p.hp ?? p.maxHp ?? 0,
        qi: p.qi ?? p.maxQi ?? 0,
      };
    });

    console.log('After training:', after);

    const increased = (after.atk > before.atk) || (after.def > before.def) || (after.speed > before.speed) || (after.hp > before.hp) || (after.qi > before.qi);
    if(increased){
      console.log('SUCCESS: At least one derived stat increased after training');
      process.exit(0);
    } else {
      console.error('FAIL: No derived stats increased after training');
      process.exit(4);
    }

  } catch (err){
    console.error('Error during e2e run:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
