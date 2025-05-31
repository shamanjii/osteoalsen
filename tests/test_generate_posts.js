const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const repoRoot = path.join(__dirname, '..');
const blogDir = path.join(repoRoot, 'blog');
const postsJsonPath = path.join(repoRoot, 'posts.json');

const post1Path = path.join(blogDir, 'temp-test-1.md');
const post2Path = path.join(blogDir, 'temp-test-2.md');

const post1Content = `---
title: Temp Post 1
date: 2022-01-01
image: img1.jpg
---
line1
line2
line3
line4
line5
line6`;

const post2Content = `---
title: Temp Post 2
date: 2022-02-02
image: img2.jpg
---
a
b
c
d
e
f`;

const originalPosts = fs.existsSync(postsJsonPath) ? fs.readFileSync(postsJsonPath, 'utf8') : '[]';

try {
  fs.writeFileSync(post1Path, post1Content);
  fs.writeFileSync(post2Path, post2Content);

  execSync('node generate-posts-json.js', { cwd: repoRoot });

  const posts = JSON.parse(fs.readFileSync(postsJsonPath, 'utf8'));
  const p1 = posts.find(p => p.file === 'blog/temp-test-1.md');
  const p2 = posts.find(p => p.file === 'blog/temp-test-2.md');

  assert(p1, 'Post 1 not found');
  assert.strictEqual(p1.title, 'Temp Post 1');
  assert.strictEqual(p1.date, '2022-01-01');
  assert.strictEqual(p1.image, 'img1.jpg');

  assert(p2, 'Post 2 not found');
  assert.strictEqual(p2.title, 'Temp Post 2');
  assert.strictEqual(p2.date, '2022-02-02');
  assert.strictEqual(p2.image, 'img2.jpg');

  console.log('All tests passed.');
} finally {
  if (fs.existsSync(post1Path)) fs.unlinkSync(post1Path);
  if (fs.existsSync(post2Path)) fs.unlinkSync(post2Path);
  fs.writeFileSync(postsJsonPath, originalPosts);
}
