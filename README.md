# Spotlight

Spotlight is a [Tailwind Plus](https://tailwindcss.com/plus) site template built using [Tailwind CSS](https://tailwindcss.com) and [Next.js](https://nextjs.org).

## Getting started

To get started with this template, first install the npm dependencies:

```bash
npm install
```

Next, create a `.env.local` file in the root of your project and set the `NEXT_PUBLIC_SITE_URL` variable to your site's public URL:

```
NEXT_PUBLIC_SITE_URL=https://example.com
```

Next, run the development server:

```bash
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Customizing

You can start editing this template by modifying the files in the `/src` folder. The site will auto-update as you edit these files.

## Cross-posting Articles

This blog supports cross-posting articles to Dev.to and LinkedIn. To set up cross-posting:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:
   - Get your Dev.to API key from https://dev.to/settings/account
   - Create a LinkedIn app and get credentials from https://www.linkedin.com/developers/apps

3. Cross-post an article using the CLI:
   ```bash
   npm run cross-post <article-url>
   ```

   Example:
   ```bash
   npm run cross-post http://localhost:3000/articles/my-article
   ```

The article will be cross-posted to all configured platforms (Dev.to and LinkedIn). Each platform needs its corresponding API keys set in the `.env` file.

## License

This site template is a commercial product and is licensed under the [Tailwind Plus license](https://tailwindcss.com/plus/license).

## Learn more

To learn more about the technologies used in this site template, see the following resources:

- [Tailwind CSS](https://tailwindcss.com/docs) - the official Tailwind CSS documentation
- [Next.js](https://nextjs.org/docs) - the official Next.js documentation
- [Headless UI](https://headlessui.dev) - the official Headless UI documentation
- [MDX](https://mdxjs.com) - the MDX documentation
