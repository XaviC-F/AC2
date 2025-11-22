# Blog System

This blog system generates blog posts from JSON configuration files.

## How It Works

1. **Create a JSON config** in `blog/configs/` with your blog post content
2. **Run the build command**: `npm run build:blog`
3. **Blog posts are generated** automatically and available at `/blog/[slug]`

## JSON Config Format

Create a new JSON file in `blog/configs/` with the following structure:

```json
{
  "slug": "your-post-slug",
  "title": "Your Post Title",
  "date": "January 15, 2025",
  "excerpt": "A short excerpt that appears in the blog listing and on the homepage.",
  "description": "A longer description for SEO and meta tags.",
  "content": "<p>Your HTML content here. You can use HTML tags like <h2>, <p>, <a>, etc.</p>\n\n<h2>Section Title</h2>\n<p>More content...</p>"
}
```

## Example

See the existing configs:
- `labor-organizing.json`
- `political-change.json`
- `speaking-truth-to-power.json`

## Building

The blog is automatically built when you run:
```bash
npm run build
```

Or build just the blog:
```bash
npm run build:blog
```

## Blog Pages

- **Blog listing**: `/blog` - Shows all blog posts
- **Individual post**: `/blog/[slug]` - Shows a specific blog post

## Styling

Blog content uses custom CSS in `globals.css` with the `.blog-content` class. The styling matches the site's dark theme and typography.

