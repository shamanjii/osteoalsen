const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

const posts = files.map(filename => {
  const content = fs.readFileSync(path.join(blogDir, filename), 'utf8');
  const meta = {};
  const metaMatch = content.match(/---\s*([\s\S]*?)---/);
  if (metaMatch) {
    metaMatch[1].split('\n').forEach(line => {
      const [key, ...rest] = line.split(':');
      if (key && rest.length) meta[key.trim()] = rest.join(':').trim().replace(/^"|"$/g, '');
    });
  }
  return {
    title: meta.title || filename,
    date: meta.date || '',
    file: `blog/${filename}`,
    image: meta.image || '',
    excerpt: content.split('\n').slice(5, 10).join(' ')
  };
});

fs.writeFileSync(path.join(__dirname, 'posts.json'), JSON.stringify(posts, null, 2));
console.log('posts.json wurde aktualisiert.');