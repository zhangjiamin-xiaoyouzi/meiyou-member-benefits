#!/usr/bin/env python3
"""render_mermaid_images.py - Render Mermaid diagrams in Markdown to PNG."""
import re, sys, json, subprocess, argparse
from pathlib import Path

BT = chr(96)
MD_START = BT*3 + "mermaid"
MD_END1 = BT*3
MD_END2 = "+" + BT*3

TYPE_TO_NAME = {
    "erDiagram": "E-R图", "mindmap": "产品结构图",
    "graph": "产品流程图-泳道图", "flowchart": "产品流程图-泳道图",
    "stateDiagram": "状态流转图", "stateDiagram-v2": "状态流转图",
}
FALLBACK = ["E-R图", "产品结构图", "产品流程图-泳道图", "状态流转图"]

def extract_blocks(md_text):
    blocks, lines_arr, i, heading = [], md_text.split("\n"), 0, ""
    while i < len(lines_arr):
        line = lines_arr[i].strip()
        if line.startswith("#") and line != MD_START and line != MD_END1 and line != MD_END2:
            h = re.sub(r"\d+\.\d*\s*", "", line.lstrip("#").strip())
            h = re.sub(r"[\u4e00-\u9fa5]+\s*、\s*", "", h)
            heading = h; i += 1; continue
        if line == MD_START:
            bl = []; i += 1
            while i < len(lines_arr):
                if lines_arr[i].strip() in (MD_END1, MD_END2): break
                bl.append(lines_arr[i].rstrip()); i += 1
            code = "\n".join(bl).strip()
            if code:
                name = heading
                if not name:
                    first = bl[0].strip() if bl else ""
                    for prefix, dn in TYPE_TO_NAME.items():
                        if first.startswith(prefix): name = dn; break
                blocks.append(dict(name=name, code=code))
            i += 1; continue
        i += 1
    return blocks

def build_html_page(blocks, theme="default"):
    parts = []
    for idx, b in enumerate(blocks):
        name = b.get("name", "Diagram " + str(idx+1))
        parts.append("<h2>" + str(idx+1) + ". " + name + "</h2>")
        parts.append('<div class="diagram" id="diagram-' + str(idx) + '"><div class="mermaid">')
        parts.append(b["code"])
        parts.append("</div></div>")
    body = "\n".join(parts)
    html = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">'
    html += '<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>'
    html += '<script>mermaid.initialize({startOnLoad:true,theme:"' + theme + '",securityLevel:"loose"});'
    html += 'window.mermaidReady=false;window.addEventListener("load",function(){setTimeout(function(){window.mermaidReady=true;},3000);});</script>'
    html += "<style>body{font-family:sans-serif;margin:20px;background:#fff}.diagram{margin:20px 0;padding:16px;border:1px solid #e0e0e0;border-radius:8px;background:#fafafa}h2{color:#333;font-size:16px;margin:24px 0 8px 0}.mermaid svg{max-width:100%}</style>"
    html += "</head><body>" + body + "</body></html>"
    return html

def render_to_pngs(blocks, output_dir, timeout_ms=90000):
    scripts_dir = Path(__file__).resolve().parent
    node_mod = scripts_dir / "node_modules" / "playwright"

    html_path = output_dir / "mermaid_render.html"
    html_path.write_text(build_html_page(blocks), encoding="utf-8")

    file_names = []
    for block in blocks:
        code = block["code"]; name = block.get("name","")
        if "erDiagram" in code[:30] or "E-R" in name:   file_names.append("E-R图.png")
        elif "mindmap" in code[:30] or "结构" in name:     file_names.append("产品结构图.png")
        elif "graph" in code[:30] or "flowchart" in code[:30].lower() or "流程" in name or "泳道" in name:
            file_names.append("产品流程图-泳道图.png")
        elif "stateDiagram" in code[:30] or "状态" in name or "流转" in name:
            file_names.append("状态流转图.png")
        else:
            idx = len(file_names)
            file_names.append((FALLBACK[idx] if idx < len(FALLBACK) else "图表"+str(idx+1)) + ".png")

    html_url = str(html_path.resolve()).replace("\\", "/")
    out_dir = str(output_dir.resolve()).replace("\\", "/")

    js_code = """const { chromium } = require("%s");
const path = require("path"), fs = require("fs");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto("file://%s", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.mermaidReady === true, { timeout: %d });
  await page.waitForTimeout(1500);
  const fileNames = %s;
  const outputDir = "%s";
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
})();""" % (node_mod.as_posix(), html_url, timeout_ms, json.dumps(file_names), out_dir)

    js_path = output_dir / "_render_mermaid.js"
    js_path.write_text(js_code, encoding="utf-8")

    result = subprocess.run(["node", str(js_path)], capture_output=True, text=True, encoding="utf-8", timeout=120, cwd=str(scripts_dir), shell=True)
    try: js_path.unlink()
    except: pass

    if result.returncode != 0:
        print("Playwright error: " + result.stderr, file=sys.stderr)
        return []

    rendered = []
    for line in (result.stdout or "").strip().split("\n"):
        if line.startswith("RENDER_RESULTS="):
            try: rendered = json.loads(line[len("RENDER_RESULTS="):])
            except: pass
        elif line.startswith("OK:"): print(line)
    return rendered

def main():
    parser = argparse.ArgumentParser(description="Render Mermaid diagrams to PNG")
    parser.add_argument("--input","-i",required=True,help="Input PRD Markdown")
    parser.add_argument("--output-dir","-o",default=None,help="Output directory for PNGs")
    parser.add_argument("--theme",default="default",help="Mermaid theme")
    parser.add_argument("--timeout",type=int,default=90000,help="Timeout ms")
    args = parser.parse_args()
    input_path = Path(args.input)
    if not input_path.exists():
        print("Error: file not found - " + str(input_path)); sys.exit(1)
    output_dir = Path(args.output_dir) if args.output_dir else input_path.parent / "diagrams"
    output_dir.mkdir(parents=True, exist_ok=True)
    blocks = extract_blocks(input_path.read_text(encoding="utf-8"))
    if not blocks:
        print("No mermaid blocks found."); return
    print("Found " + str(len(blocks)) + " mermaid block(s):")
    for b in blocks:
        print("  - " + (b["name"] or "(unnamed)") + " (" + str(len(b["code"])) + " chars)")
    print()
    results = render_to_pngs(blocks, output_dir, timeout_ms=args.timeout)
    if results:
        print("Rendered " + str(len(results)) + " image(s):")
        for r in results:
            print("  " + r["name"] + " (" + str(r["size"]) + " bytes)")
    else:
        print("No images rendered.", file=sys.stderr)
    hp = output_dir / "mermaid_render.html"
    if hp.exists():
        print("Preview HTML: " + str(hp))

if __name__ == "__main__":
    main()