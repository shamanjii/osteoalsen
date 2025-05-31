const fs = require('fs');
const path = require('path');

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
    alt: meta.alt || '',
    excerpt
  };
});

fs.writeFileSync(path.join(__dirname, 'posts.json'), JSON.stringify(posts, null, 2));
console.log('posts.json wurde aktualisiert.');