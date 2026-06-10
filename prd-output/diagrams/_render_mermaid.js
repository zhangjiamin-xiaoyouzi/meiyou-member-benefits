const { chromium } = require("/workspace/projects/meiyouhoutaiprd/scripts/node_modules/playwright");
const path = require("path"), fs = require("fs");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto("file:///workspace/projects/prd-output/diagrams/mermaid_render.html", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.mermaidReady === true, { timeout: 90000 });
  await page.waitForTimeout(1500);
  const fileNames = ["E-R\u56fe.png", "\u4ea7\u54c1\u7ed3\u6784\u56fe.png", "\u4ea7\u54c1\u6d41\u7a0b\u56fe-\u6cf3\u9053\u56fe.png"];
  const outputDir = "/workspace/projects/prd-output/diagrams";
  const diagrams = await page.locator(".diagram").all();
  const results = [];
  for (let i = 0; i < diagrams.length; i++) {
    const svg = diagrams[i].locator(".mermaid svg");
    if (await svg.count() > 0) {
      const box = await svg.first().boundingBox();
      if (box) {
        const fp = path.join(outputDir, fileNames[i] || ("diagram-"+(i+1)+".png"));
        await svg.first().screenshot({ path: fp, omitBackground: false });
        const st = fs.statSync(fp);
        results.push({ index: i, name: fileNames[i], path: fp, size: st.size });
        console.log("OK: " + fileNames[i] + " (" + st.size + " bytes)");
      }
    }
  }
  await browser.close();
  console.log("RENDER_RESULTS=" + JSON.stringify(results));
})();