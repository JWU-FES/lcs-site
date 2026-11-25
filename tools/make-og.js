const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const svg = fs.readFileSync('src/favicon.svg', 'utf8').replace('fill="#0b1f1e"', 'fill="#2ED3CC"');
  const html = `<!doctype html><meta charset="utf-8"><style>
  html,body{margin:0}body{width:1200px;height:630px;background:#061211;display:flex;align-items:center;justify-content:center;gap:56px;font-family:Inter,-apple-system,"Segoe UI",system-ui,sans-serif;color:#e9f4f2}
  .l{width:230px;height:236px}.l svg{width:100%;height:100%}
  h1{margin:0;font-size:68px;line-height:1.05;letter-spacing:-.03em;font-weight:700}
  p{margin:18px 0 0;font-size:34px;color:#2ED3CC;font-weight:500}</style>
  <div class="l">${svg}</div><div><h1>Les Créateurs<br>Sociaux</h1><p>FEG Fès</p></div>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(html); await p.screenshot({ path: 'src/og.png' }); await b.close();
})();
