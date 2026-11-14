# Joshos Marine

Website for Joshos Marine: 12V installs, servicing, trailer work and custom fit-outs.

It is a plain static site. There is no build step and nothing to install: the files in this
repository are exactly what gets served.

## Settings

Everything below lives in [`js/config.js`](js/config.js). Change it there and the whole site updates.

| Setting | What it does |
| --- | --- |
| `phone` / `phoneLink` | The number shown and dialled |
| `email` | The address shown on the site, and the fallback for the forms |
| `hours`, `hoursForSearch` | Opening hours as displayed, and in the form search engines read |
| `abn` | Shown in the footer |
| `area`, `facebook`, `instagram` | Optional; anything left empty is hidden |
| `formEndpoint`, `formExtraFields` | Where the forms send to (see below) |

The wording on the page (services, FAQ answers, the "Why Joshos" section) is draft copy.
Read it through and change anything that doesn't match how the business actually runs.

## Booking forms

There are two forms: the **Booking request** form (every "Book a job" button jumps straight to it)
and the short **Request a call back** form.

Both post to [FormSubmit](https://formsubmit.co), a free form-to-email service that needs no
account, which emails each request to the address at the end of `formEndpoint`. The first
request sent to a new address makes FormSubmit email that address an **Activate Form** link;
nothing is delivered until it is clicked once.

If the service is unreachable or refuses a request, the form falls back to opening the
customer's own email app with the details already written out, so a request is never lost.

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
