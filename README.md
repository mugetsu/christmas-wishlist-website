# 🎄 Christmas Wishlist

A small, festive wishlist site for GitHub Pages + Supabase.

## Features

- Public landing page showing every wishlist
- Each person can submit 1–3 wishes
- Wish description is optional
- Search by person or wish
- Shareable individual wishlist URL
- Simple private admin page
- Admin can edit names, edit wishes, and delete a complete wishlist
- Public users cannot update or delete records
- No backend server required

## 1. Create the Supabase project

Create a free Supabase project.

In **SQL Editor**, paste and run `schema.sql`.

Before running it, replace:

`YOUR-ADMIN-EMAIL@example.com`

with the email address you will use for the admin account.

Then create that admin user in **Authentication → Users → Add user**.

## 2. Configure the frontend

Open:

`js/config.js`

Replace:

- `YOUR-PROJECT` with your Supabase project URL
- `YOUR_SUPABASE_ANON_KEY` with the Supabase anon/public key

The anon key is safe to expose in a browser when Row Level Security is configured correctly. Never put a Supabase service-role key in this repository.

## 3. Test locally

Because the pages use ES modules, serve the folder through a local web server.

For example:

`python3 -m http.server 8000`

Then open:

`http://localhost:8000`

## 4. Publish on GitHub Pages

Create a public GitHub repository and upload the contents of this folder.

Then in:

**Repository → Settings → Pages**

Choose:

- Source: GitHub Actions, or deploy from the `main` branch
- Folder: `/ (root)` if using branch deployment

Your site will get a GitHub Pages URL.

## Admin

Open:

`admin.html`

Sign in with the Supabase Auth admin account.

The database itself decides whether the signed-in account is the configured admin email, so hiding the admin page is not used as security.

## Security model

Public:
- Read all wishlists
- Submit a new wishlist through `create_wishlist`

Admin:
- Read
- Update
- Delete

The public client never receives a service-role key.

## Suggested next additions

- Cloudflare Turnstile / CAPTCHA if spam becomes a problem
- Christmas countdown
- "Gift claimed" status
- Product links
- Drag-and-drop wish ordering
- Admin search/filter
