/**
 * 美柚 TAPD 需求自动填充脚本
 * 用法: node fill_tapd.mjs --story-id <id> --workspace <id> --data <json_file>
 */

import { chromium } from "playwright";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const TAPD_BASE = "https://www.tapd.meiyou.com";

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--story-id" || args[i] === "-s") opts.storyId = args[++i];
    else if (args[i] === "--workspace" || args[i] === "-w") opts.workspace = args[++i];
    else if (args[i] === "--data" || args[i] === "-d") opts.dataFile = args[++i];
    else if (args[i] === "--headless") opts.headless = true;
    else if (args[i] === "--dry-run") opts.dryRun = true;
  }
  return opts;
}

async function main() {
  const opts = parseArgs();
  
  if (!opts.storyId || !opts.workspace || !opts.dataFile) {
    console.error("用法: node fill_tapd.mjs --story-id <id> --workspace <id> --data <json_file>");
    console.error("可选: --headless (无头模式) --dry-run (仅解析不填充)");
    process.exit(1);
  }

  // 读取数据
  const data = JSON.parse(readFileSync(opts.dataFile, "utf-8"));
  console.log("已加载数据:", data.title || "(无标题)");

  if (opts.dryRun) {
    console.log("Dry-run 模式，退出");
    return;
  }

  // 启动浏览器
  const userDataDir = join(homedir(), "AppData", "Local", "Google", "Chrome", "User Data");
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: opts.headless || false,
    channel: "chrome",
    args: ["--profile-directory=Default"]
  });

  const page = context.pages()[0] || await context.newPage();
  const editUrl = `${TAPD_BASE}/${opts.workspace}/prong/stories/edit/${opts.storyId}`;
  
  console.log("打开编辑页:", editUrl);
  await page.goto(editUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(3000);

  // 检查是否登录
  if (page.url().includes("cloud_logins")) {
    console.error("需要登录！请先手动登录 TAPD。");
    await context.close();
    process.exit(1);
  }

  console.log("开始填充...");

  // ── 1. 填充标题 ──
  if (data.title) {
    const titleInput = page.locator("#StoryName, #story_name").first();
    if (await titleInput.isVisible()) {
      await titleInput.click();
      await titleInput.fill("");
      await titleInput.fill(data.title);
      console.log("  标题已填充");
    }
  }

  // ── 2. 填充描述（TinyMCE） ──
  if (data.description) {
    const editorFrame = page.frameLocator("#StoryDescription_ifr");
    const bodyEl = editorFrame.locator("#tinymce, body").first();
    if (await bodyEl.isVisible()) {
      await bodyEl.click();
      // TinyMCE: set content via JavaScript
      const descHtml = formatDescription(data.description, data);
      await bodyEl.evaluate((el, html) => {
        el.innerHTML = html;
      }, descHtml);
      console.log("  描述已填充");
    } else {
      console.log("  描述编辑器未找到，跳过");
    }
  }

  // ── 3. 设置自定义字段 ──
  const meta = data.meta || {};
  
  // 处理人
  if (meta.handler) {
    const handlerInput = page.locator("#StoryOwnerValue");
    if (await handlerInput.isVisible()) {
      await handlerInput.fill(meta.handler);
      console.log("  处理人已设置:", meta.handler);
    }
  }

  // 预估工时
  if (meta.estimated_hours) {
    const effortInput = page.locator("#StoryEffort");
    if (await effortInput.isVisible()) {
      await effortInput.fill(String(meta.estimated_hours));
      console.log("  工时已设置:", meta.estimated_hours);
    }
  }

  // 优先级 (High/Middle/Low/Nice To Have)
  if (meta.priority) {
    await setRadioOrSelect(page, meta.priority);
  }

  // 需求难度 (S/A/B/C)
  if (meta.difficulty) {
    await setRadioOrSelect(page, meta.difficulty);
  }

  // 需求类型
  if (meta.requirement_type) {
    await setRadioOrSelect(page, meta.requirement_type);
  }

  // 技术等级
  if (meta.tech_level) {
    await setRadioOrSelect(page, meta.tech_level);
  }

  // 成效评价
  if (meta.effectiveness) {
    await setRadioOrSelect(page, meta.effectiveness);
  }

  // ── 4. 检查是否需要提交 ──
  console.log("\n=== 填充完成 ===");
  console.log("请检查页面内容，确认无误后手动点击【提交】按钮。");
  console.log("(如需自动提交，添加 --auto-submit 参数)");

  if (opts.autoSubmit) {
    // 点击提交按钮
    const submitBtn = page.locator('button:has-text("提交")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      console.log("已提交！");
      await page.waitForTimeout(3000);
    }
  }
}

// 辅助：设置 radio/select 类型的字段
async function setRadioOrSelect(page, value) {
  // 尝试找匹配的 radio label 并点击
  const label = page.locator(`label:has-text("${value}")`).first();
  if (await label.isVisible({ timeout: 1000 }).catch(() => false)) {
    await label.click();
    console.log("  已选择:", value);
    return true;
  }
  return false;
}

// 格式化描述为 HTML
function formatDescription(desc, data) {
  if (typeof desc !== "string") desc = "";
  
  // 如果 desc 已经是带模板结构的，直接使用
  // 否则用 data 中的章节组装
  const sections = [];
  
  if (data.bg_big || data.bg_sub || data.status_analysis) {
    sections.push("<h2>一、需求背景（20%）</h2>");
    if (data.bg_big) sections.push("<h3>1.1 业务大背景（5%）</h3><p>" + escapeHtml(data.bg_big) + "</p>");
    if (data.bg_sub) sections.push("<h3>1.2 业务子背景（5%）</h3><p>" + escapeHtml(data.bg_sub) + "</p>");
    if (data.status_analysis) {
      sections.push("<h3>1.3 现状判断及问题（10%）</h3>");
      sections.push(buildTable(["现状", "问题判断", "历史需求或复盘文档", "解决方案"], 
        data.status_analysis.map(r => [r.current||"", r.problem||"", r.history||"", r.solution||""])));
    }
  }
  
  if (data.goal || data.iteration_plan || data.risk) {
    sections.push("<h2>二、项目目标（5%）</h2>");
    if (data.goal) sections.push("<h3>2.1 目标描述（5%）</h3><p>" + escapeHtml(data.goal) + "</p>");
    if (data.iteration_plan) sections.push("<h3>2.2 迭代节奏</h3><p>" + escapeHtml(data.iteration_plan) + "</p>");
    if (data.risk) sections.push("<h3>2.3 风险预判</h3><p>" + escapeHtml(data.risk) + "</p>");
  }
  
  if (data.requirements || data.structure_diagram || data.flow_diagram) {
    sections.push("<h2>三、需求方案（80%）</h2>");
    if (data.glossary) {
      sections.push("<h3>3.1 名词定义</h3>");
      sections.push(buildTable(["名词", "定义"], data.glossary.map(r => [r.term||"", r.definition||""])));
    }
    if (data.structure_diagram) sections.push("<h3>3.3 产品结构图（10%）</h3><p>" + escapeHtml(data.structure_diagram) + "</p>");
    if (data.flow_diagram) sections.push("<h3>3.4 产品流程图（10%）</h3><p>" + escapeHtml(data.flow_diagram) + "</p>");
    if (data.prototype) sections.push("<h3>3.5 原型图</h3><p>" + escapeHtml(data.prototype) + "</p>");
    if (data.requirements) {
      sections.push("<h3>3.6 需求说明（60%）</h3>");
      sections.push(buildTable(["功能模块", "功能点描述", "优先级"],
        data.requirements.map(r => [r.module||"", r.feature||"", r.priority||""])));
      for (const req of data.requirements) {
        if (req.detail) sections.push("<p><strong>" + escapeHtml(req.feature||"") + "：</strong>" + escapeHtml(req.detail) + "</p>");
      }
    }
    if (data.collaboration) sections.push("<h3>3.7 对协同方需求</h3><p>" + escapeHtml(data.collaboration) + "</p>");
  }
  
  return sections.length > 0 ? sections.join("\n") : desc;
}

function buildTable(headers, rows) {
  let html = '<table border="1" style="border-collapse:collapse;width:100%"><thead><tr>';
  for (const h of headers) html += "<th>" + escapeHtml(h) + "</th>";
  html += "</tr></thead><tbody>";
  for (const row of rows) {
    html += "<tr>";
    for (const cell of row) html += "<td>" + escapeHtml(cell||"") + "</td>";
    html += "</tr>";
  }
  html += "</tbody></table><br/>";
  return html;
}

function escapeHtml(str) {
  return String(str||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

main().catch(e => {
  console.error("执行失败:", e.message);
  process.exit(1);
});
