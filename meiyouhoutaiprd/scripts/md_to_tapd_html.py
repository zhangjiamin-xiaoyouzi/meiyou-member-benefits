import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BT = chr(96)
MD_START = BT + BT + BT + 'mermaid'
MD_END1 = BT + BT + BT
MD_END2 = '+' + BT + BT + BT

def escape(s):
    return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def convert(md_text):
    lines = md_text.split(chr(10))
    result = []
    i = 0
    img_counter = [0]
    img_names = ['E-R图', '产品结构图', '用户流程图', '状态流转图']

    def placeholder():
        img_counter[0] += 1
        idx = img_counter[0] - 1
        name = img_names[idx] if idx < len(img_names) else '图表' + str(img_counter[0])
        return '<p style=\"text-align:center;background:#fff3cd;padding:20px;border:2px dashed #ffc107;border-radius:8px;margin:12px 0\"><strong style=\"color:#856404;font-size:16px\">【 ' + name + ' 】</strong><br/><span style=\"color:#856404\">请在此处插入图片</span></p>'

    while i < len(lines):
        s = lines[i].strip()
        if s == MD_START:
            i += 1
            while i < len(lines):
                t = lines[i].strip()
                if t == MD_END1 or t == MD_END2:
                    i += 1
                    break
                i += 1
            result.append(placeholder())
            continue
        if s.startswith('|') and s.endswith('|') and '---' not in s:
            rows = []
            while i < len(lines):
                t = lines[i].strip()
                if not (t.startswith('|') and t.endswith('|')):
                    break
                if '---' in t and all(c in '|-: ' for c in t):
                    i += 1
                    continue
                rows.append(t)
                i += 1
            if rows:
                h = '<table border=\"1\" style=\"border-collapse:collapse;width:100%;margin:8px 0\">'
                cells0 = [c.strip() for c in rows[0].split('|')[1:-1]]
                h += '<thead><tr>'
                for c in cells0:
                    h += '<th style=\"background:#d9e2f3;padding:4px 8px;text-align:left;font-size:13px\">' + escape(c) + '</th>'
                h += '</tr></thead><tbody>'
                for row in rows[1:]:
                    cells = [c.strip() for c in row.split('|')[1:-1]]
                    h += '<tr>'
                    for c in cells:
                        h += '<td style=\"padding:4px 8px;font-size:13px\">' + escape(c) + '</td>'
                    h += '</tr>'
                h += '</tbody></table>'
                result.append(h)
            continue
        if s.startswith('# '):
            result.append('<h2 style=\"margin:16px 0 8px 0\">' + escape(s[2:]) + '</h2>')
            i += 1; continue
        if s.startswith('## '):
            result.append('<h3 style=\"margin:12px 0 6px 0\">' + escape(s[3:]) + '</h3>')
            i += 1; continue
        if s.startswith('### '):
            result.append('<h4 style=\"margin:10px 0 4px 0\">' + escape(s[4:]) + '</h4>')
            i += 1; continue
        if s.startswith('#### '):
            result.append('<p style=\"margin:8px 0 4px 0\"><strong>' + escape(s[5:]) + '</strong></p>')
            i += 1; continue
        if s == '---':
            result.append('<hr style=\"border:none;border-top:1px solid #ddd;margin:12px 0\"/>')
            i += 1; continue
        if s.startswith('- ') or s.startswith('* '):
            items = []
            while i < len(lines):
                t = lines[i].strip()
                if not (t.startswith('- ') or t.startswith('* ')):
                    break
                text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t[2:])
                items.append('<li style=\"margin:2px 0\">' + text + '</li>')
                i += 1
            if items:
                result.append('<ul style=\"margin:4px 0 4px 20px;padding:0\">' + ''.join(items) + '</ul>')
            continue
        if re.match(r'^\d+\.\s', s):
            items = []
            while i < len(lines):
                t = lines[i].strip()
                m = re.match(r'^(\d+)\.\s+(.+)', t)
                if not m:
                    break
                text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', m.group(2))
                items.append('<li style=\"margin:2px 0\">' + text + '</li>')
                i += 1
            if items:
                result.append('<ol style=\"margin:4px 0 4px 20px;padding:0\">' + ''.join(items) + '</ol>')
            continue
        if s.startswith('> '):
            text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s[2:])
            result.append('<blockquote style=\"margin:4px 0;padding:4px 12px;background:#f5f5f5;border-left:3px solid #ccc\">' + text + '</blockquote>')
            i += 1; continue
        if s == '':
            i += 1; continue
        text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
        result.append('<p style=\"margin:4px 0\">' + text + '</p>')
        i += 1
    return chr(10).join(result)


def embed_images(html, images_dir):
    """Replace yellow dashed placeholders with <img> tags pointing to PNGs."""
    from pathlib import Path

    img_dir = Path(images_dir)
    if not img_dir.is_dir():
        return html

    mapping = [
        ("E-R图", "E-R图.png"),
        ("产品结构图", "产品结构图.png"),
        ("用户流程图", "产品流程图-泳道图.png"),
        ("状态流转图", "状态流转图.png"),
    ]

    for label, filename in mapping:
        img_path = img_dir / filename
        if not img_path.exists():
            continue

        relative_path = img_dir.name + "/" + filename if img_dir.name == "diagrams" else str(img_path)
        img_tag = '<p style="text-align:center;margin:12px 0"><img src="' + relative_path + '" style="max-width:100%;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)" alt="' + label + '" /></p>'

        # Find the placeholder by looking for the label text, then replace the whole <p> block
        search = "【 " + label + " 】</strong><br/><span"
        idx = html.find(search)
        if idx >= 0:
            # Find the opening <p> tag before this
            start = html.rfind("<p style=", 0, idx)
            if start >= 0:
                # Find the closing </p> after
                end = html.find("</p>", idx)
                if end >= 0:
                    html = html[:start] + img_tag + html[end+4:]

    return html


if __name__ == '__main__':
    import argparse
    from pathlib import Path

    parser = argparse.ArgumentParser(description='PRD Markdown -> TAPD HTML converter')
    parser.add_argument('--input', '-i', required=True, help='Input PRD Markdown file')
    parser.add_argument('--output', '-o', help='Output HTML file (default: input.tapd.html)')
    parser.add_argument('--start-marker', default='一、需求背景', help='Starting section marker')
    parser.add_argument('--images-dir', default=None, help='Directory with rendered PNG images to auto-embed')
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print('Error: file not found - ' + str(input_path))
        sys.exit(1)

    output_path = Path(args.output) if args.output else input_path.with_suffix('.tapd.html')

    with open(input_path, 'r', encoding='utf-8') as f:
        md = f.read()

    body_start = md.find('# ' + args.start_marker)
    if body_start < 0:
        body_start = md.find(args.start_marker)
    if body_start < 0:
        body_start = 0

    html = convert(md[body_start:])

    # Auto-embed images if --images-dir is provided
    if args.images_dir:
        html = embed_images(html, args.images_dir)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print('Done: ' + str(output_path))
    print('  Size: ' + str(len(html)) + ' chars')
    print('  Tables: ' + str(html.count(chr(60)+chr(116)+chr(97)+chr(98)+chr(108)+chr(101))))
    placeholder_count = html.count('\u8bf7\u5728\u6b64\u5904\u63d2\u5165\u56fe\u7247')
    img_count = html.count('<img src=')
    print('  Placeholders remaining: ' + str(placeholder_count))
    print('  Embedded images: ' + str(img_count))
