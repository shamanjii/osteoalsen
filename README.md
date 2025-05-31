# Osteopathie Alsen Website

This repository contains the static files that make up the **Osteopathie Alsen** website. The site consists mainly of HTML files and a small blog written in Markdown.

## Repository Structure

- `blog/` – Markdown posts. Each file starts with a small front matter section describing the post.
- `generate-posts-json.js` – Node.js script that converts the Markdown files in `blog/` into the `posts.json` index used by `blog.html`.
- `posts.json` – Generated file listing all blog posts. This file is overwritten by the script.

## Generating `posts.json`

Run the script after adding or editing any Markdown files in the `blog/` directory:

```bash
node generate-posts-json.js
```

The command looks for all `.md` files inside `blog/` and recreates `posts.json` in the repository root.

## Editing Blog Posts

1. Create or update Markdown files inside `blog/`. A post begins with front matter like:

   ```markdown
   ---
   title: "Mein Titel"
   date: 2025-05-18
   image: "optional-bild.jpg"
   alt: "Kurze Bildbeschreibung"
   ---
   
   Hier folgt der eigentliche Inhalt in Markdown.
   ```

2. After saving your changes, run `node generate-posts-json.js` to refresh `posts.json`.

3. Open `blog.html` to verify that the new post appears in the list.

## Serving the Site Locally

Use any static file server to preview the website. One simple option with Python is:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000/blog.html](http://localhost:8000/blog.html) in your browser. You can also serve the root to access the other pages such as `index.html`.


## Redirects

The repository contains an `.htaccess` file that defines redirects for the old `/impressum` and `/datenschutz` paths. Your server must support Apache-style redirects (or an equivalent configuration) for these rules to function.
