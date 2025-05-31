const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const blogDir = path.join(repoRoot, 'blog');
const templatePath = path.join(repoRoot, 'templates', 'post.html');
const distDir = path.join(repoRoot, 'dist', 'blog');

function parseFrontmatter(content) {
  const lines = content.split(/\r?\n/);
  const meta = {};
  let bodyStart = 0;
  if (lines[0].trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        const metaLines = lines.slice(1, i);
        metaLines.forEach(line => {
          const [key, ...rest] = line.split(':');
          if (key && rest.length) meta[key.trim()] = rest.join(':').trim().replace(/^"|"$/g, '');
        });
        bodyStart = i + 1;
        break;
      }
    }
  }
  return { meta, body: lines.slice(bodyStart).join('\n') };
}

function inline(text) {
  return text
    .replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>');
}

function renderTable(lines) {
  const header = lines[0].trim().replace(/^\||\|$/g, '').split('|').map(c => inline(c.trim()));
  let idx = 1;
  if (lines[1] && /^\|?[-| :]+\|?$/.test(lines[1])) idx = 2;
  const rows = lines.slice(idx).map(l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => inline(c.trim())));
  let html = '<table><thead><tr>' + header.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
  rows.forEach(row => {
    html += '<tr>' + row.map(c => `<td>${c}</td>`).join('') + '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function markdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let listType = null;
  let listItems = [];
  let tableLines = [];
  function flushList() {
    if (listType) {
      out.push(`<${listType}>` + listItems.join('') + `</${listType}>`);
      listType = null;
      listItems = [];
    }
  }
  function flushTable() {
    if (tableLines.length) {
      out.push(renderTable(tableLines));
      tableLines = [];
    }
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*$/.test(line)) {
      flushList();
      flushTable();
      continue;
    }
    if (line.startsWith('|')) {
      tableLines.push(line);
      continue;
    } else if (tableLines.length) {
      flushTable();
    }
    let m;
    if ((m = line.match(/^(#{1,6})\s+(.*)/))) {
      flushList();
      out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
    } else if ((m = line.match(/^\d+\.\s+(.*)/))) {
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = line.match(/^[*-]\s+(.*)/))) {
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(`<li>${inline(m[1])}</li>`);
    } else {
      flushList();
      out.push(`<p>${inline(line.trim())}</p>`);
    }
  }
  flushList();
  flushTable();
  return out.join('\n');
}

fs.mkdirSync(distDir, { recursive: true });
// copy stylesheet so generated posts can reference it
const cssSource = path.join(repoRoot, 'styles.css');
if (fs.existsSync(cssSource)) {
  fs.copyFileSync(cssSource, path.join(distDir, 'styles.css'));
}
const template = fs.readFileSync(templatePath, 'utf8');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
  const { meta, body } = parseFrontmatter(content);
  const htmlContent = markdownToHtml(body);

  let html = template
    .replace(/{{\s*title\s*}}/g, meta.title || '')
    .replace(/{{\s*date\s*}}/g, meta.date || '')
    .replace(/{{\s*content\s*}}/g, htmlContent);

  const imageBlockMatch = html.match(/{{#if image}}([\s\S]*?){{\/if}}/);
  if (imageBlockMatch) {
    if (meta.image) {
      const block = imageBlockMatch[1].replace(/{{\s*image\s*}}/g, meta.image);
      html = html.replace(imageBlockMatch[0], block);
    } else {
      html = html.replace(imageBlockMatch[0], '');
    }
  }

  const outPath = path.join(distDir, file.replace(/\.md$/, '.html'));
  fs.writeFileSync(outPath, html);
  console.log(`Generated ${outPath}`);
}
