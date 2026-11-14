# Joshos Marine

Website for Joshos Marine: 12V installs, servicing, trailer work and custom fit-outs.

It is a plain static site. There is no build step and nothing to install: the files in this
repository are exactly what gets served.

## Before going live

Everything below lives in [`js/config.js`](js/config.js). Change it there and the whole site updates.

| Setting | Currently | What to do |
| --- | --- | --- |
| `phone` / `phoneLink` | set | Change here if the number changes |
| `email` | set | Change here if the address changes |
| `formEndpoint` | empty | Connect a form service (see below) |
| `area`, `hours`, `abn`, `facebook`, `instagram` | empty or generic | Fill in; anything left empty is hidden |

The wording on the page (services, FAQ answers, the "Why Joshos" section) is draft copy.
Read it through and change anything that doesn't match how the business actually runs.

## Booking forms

There are two forms: the **Booking request** form (every "Book a job" button jumps straight to it)
and the short **Request a call back** form.

- **With `formEndpoint` set**, requests are posted to that address as JSON and the customer
  sees a confirmation on the page. [Formspree](https://formspree.io) and
  [Web3Forms](https://web3forms.com) both work; each gives you an address to paste in, and
  Web3Forms also needs its key in `formExtraFields`.
- **With `formEndpoint` empty**, the forms open the customer's own email app with the
  details already written out. It works with no setup, but it relies on the customer
  pressing send, so connecting a form service is worth the two minutes.

## Previewing

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 4173
```

then visit <http://localhost:4173>.

## Hosting

The site is served by GitHub Pages from the `gh-pages` branch at
<https://joshosmarine.com.au>. Pushing to `gh-pages` redeploys it within a minute or two.

The `CNAME` file in the repository root is what ties the site to the domain; leave it in place.
At the domain registrar (GoDaddy) the DNS records are:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `asafalazraki.github.io` |

Any other static host works too (Cloudflare Pages, Netlify): point it at the repository root
with no build command.

## What's where

```
index.html            The whole page
404.html              "Page not found" page
css/styles.css        All styling
js/config.js          Contact details and form settings  <- edit this one
js/main.js            Menu, animations, booking form logic
assets/fonts/         Self-hosted fonts (open licences in assets/fonts/licenses)
assets/img/           Favicon, app icons, share image, chart-line background
CNAME                 The custom domain for GitHub Pages
sitemap.xml           Page list for search engines
```

The boat-and-trailer drawing and the wiring diagram are hand-written SVG inside `index.html`,
so they stay sharp at any size and need no image files.
