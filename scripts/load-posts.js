fetch('posts.json')
  .then(res => res.json())
  .then(posts => {
    const container = document.getElementById('posts');
    if (!container) return;
    container.innerHTML = posts.map(post => {
      const url = `post.html?file=${encodeURIComponent(post.file)}`;
      return `
      <a class="post-preview" href="${url}">
        ${post.image ? `<img class="post-image" src="${post.image}" alt="">` : ''}
        <div class="post-content">
          <div class="post-title">${post.title}</div>
          <div class="post-date">${post.date}</div>
          <div class="post-excerpt">${post.excerpt.replace(/^#+\s?/, '').replace(/[*_`#]/g, '')}</div>
        </div>
      </a>
      `;
    }).join('');
  })
  .catch(err => {
    const container = document.getElementById('posts');
    if (container) container.innerHTML = '<p>Beiträge konnten nicht geladen werden.</p>';
    console.error(err);
  });
