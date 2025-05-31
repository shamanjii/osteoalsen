const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(__dirname, 'sitemap.xml');

const blogDir = path.join(__dirname, 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

const posts = files.map(filename => {
  const content = fs.readFileSync(path.join(blogDir, filename), 'utf8');
  const lines = content.split(/\n/);

  // Extract front matter
  const meta = {};
  let bodyStartIndex = 0;
  if (lines[0].trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        const metaLines = lines.slice(1, i);
        metaLines.forEach(line => {
          const [key, ...rest] = line.split(':');
          if (key && rest.length) {
            meta[key.trim()] = rest.join(':').trim().replace(/^"|"$/g, '');
          }
        });
        bodyStartIndex = i + 1;
        break;
      }
    }
  }

  // Skip initial empty lines in body
  let bodyLines = lines.slice(bodyStartIndex).filter(line => line.trim() !== '');
  const excerpt = bodyLines.slice(0, 5).join(' ');

  return {
    title: meta.title || filename,
    date: meta.date || '',
    file: `blog/${filename}`,
    image: meta.image || '',
    excerpt
  };
});

fs.writeFileSync(path.join(__dirname, 'posts.json'), JSON.stringify(posts, null, 2));
console.log('posts.json wurde aktualisiert.');

// --- Update sitemap.xml with blog posts ---
let sitemap = fs.existsSync(sitemapPath)
  ? fs.readFileSync(sitemapPath, 'utf8')
  : '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';

const existingEntries = [];
const urlsetMatch = sitemap.match(/<urlset[^>]*>([\s\S]*?)<\/urlset>/);
if (urlsetMatch) {
  const urlRegex = /<url>([\s\S]*?)<\/url>/g;
  let m;
  while ((m = urlRegex.exec(urlsetMatch[1])) !== null) {
    const block = m[1];
    const loc = /<loc>(.*?)<\/loc>/.exec(block);
    const lastmod = /<lastmod>(.*?)<\/lastmod>/.exec(block);
    const priority = /<priority>(.*?)<\/priority>/.exec(block);
    const changefreq = /<changefreq>(.*?)<\/changefreq>/.exec(block);
    existingEntries.push({
      loc: loc ? loc[1] : '',
      lastmod: lastmod ? lastmod[1] : '',
      priority: priority ? priority[1] : '',
      changefreq: changefreq ? changefreq[1] : ''
    });
  }
}

const blogLocs = new Set();
const blogEntries = posts.map(p => {
  const slug = path.basename(p.file, '.md');
  const loc = `https://www.osteoalsen.de/blog/${slug}.html`;
  blogLocs.add(loc);
  return {
    loc,
    lastmod: p.date
  };
});

const filteredExisting = existingEntries.filter(e => {
  if (e.loc.startsWith('https://www.osteoalsen.de/blog/')) {
    return blogLocs.has(e.loc);
  }
  return true;
});

const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
];

function pushUrl(entry) {
  lines.push('  <url>');
  lines.push(`    <loc>${entry.loc}</loc>`);
  if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  if (entry.priority) lines.push(`    <priority>${entry.priority}</priority>`);
  if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  lines.push('  </url>');
}

existingEntries.forEach(e => pushUrl(e));
blogEntries.forEach(e => {
  const exists = existingEntries.some(en => en.loc === e.loc);
  if (!exists) pushUrl(e);
});

lines.push('</urlset>');
lines.push('');

fs.writeFileSync(sitemapPath, lines.join('\n'));
console.log('sitemap.xml wurde aktualisiert.');
