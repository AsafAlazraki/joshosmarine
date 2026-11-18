# Joshos Marine

Website for Joshos Marine, North Brisbane: 12V installs, servicing, trailer work and custom
fit-outs.

It is a plain static site. Nothing needs installing and the files in this repository are
exactly what gets served: a home page, plus one page for each of the four services.

## Settings

Everything below lives in [`js/config.js`](js/config.js). Change it there and the whole site updates.

| Setting | What it does |
| --- | --- |
| `phone` / `phoneLink` | The number shown and dialled |
| `email` | The address shown on the site, and the fallback for the forms |
| `hours`, `hoursForSearch` | Opening hours as displayed, and in the form search engines read |
| `abn` | Shown in the footer |
| `area` | The service area shown in the contact section and footer (see the note below) |
| `facebook`, `instagram` | Optional; anything left empty is hidden |
| `formEndpoint`, `formExtraFields` | Where the forms send to (see below) |

The service area is the one setting that lives in more than one place, because search engines
need to read it in the page titles and text. To change it, update `area` in `js/config.js`,
`AREA` at the top of `tools/build_pages.py`, and the mentions of "North Brisbane" in
`index.html`, then rebuild the service pages (below).

The wording on the pages (services, FAQ answers, the "Why Joshos" section, the service pages)
is draft copy. Read it through and change anything that doesn't match how the business
actually runs.

## Service pages

Each service has its own page so that it can be found for its own searches:

| Page | Address |
| --- | --- |
| 12V marine electrical | `/marine-electrical/` |
| Boat & outboard servicing | `/boat-servicing/` |
| Boat trailer repairs | `/boat-trailer-repairs/` |
| Custom boat fit-outs | `/custom-boat-fit-outs/` |

Each page is designed around its own subject:

- **Marine electrical** has a fault-finding chart and a voltage-drop tool (pick a load, a
  cable run and a cable size to see how much voltage is lost).
- **Boat servicing** has a labelled outboard, a service sheet and a guide to how often
  things are due.
- **Boat trailer repairs** has a labelled trailer, an exploded view of a wheel hub and a
  pre-tow check to tick off.
- **Custom boat fit-outs** is built around a top-down deck plan, zone by zone.

The body of each page is hand-written HTML in [`tools/pages/`](tools/pages). The script
[`tools/build_pages.py`](tools/build_pages.py) wraps each body with the parts every page
shares (the header, menu, contact section, footer and icons), which it copies straight out of
`index.html`, so there is only one copy of those to maintain. Page titles, descriptions and
the questions and answers are in the `PAGES` list at the top of the script. The same run
rewrites `sitemap.xml` and `llms.txt`.

To change a service page, or after changing any shared part of `index.html`:

```sh
python3 tools/build_pages.py
```

then commit the result. Don't edit the generated `index.html` files inside those four folders
by hand, because the next run overwrites them. Their styles are in `css/pages.css` and the
two small tools (voltage drop, pre-tow check) are in `js/pages.js`.

A "Book" button on a service page opens the booking form on the home page with that service
already ticked (`/?book=Trailer%20work#booking`).

## Booking forms

There are two forms: the **Booking request** form, which runs in three short steps (the job,
the details, your contact details) and is where every "Book a job" button lands, and the short
**Request a call back** form.

Both post to [FormSubmit](https://formsubmit.co), a free form-to-email service that needs no
account, which emails each request to the address at the end of `formEndpoint`. The first
request sent to a new address makes FormSubmit email that address an **Activate Form** link;
nothing is delivered until it is clicked once.

If the service is unreachable or refuses a request, the form falls back to opening the
customer's own email app with the details already written out, so a request is never lost.

## Getting found in search

What the site already does for search engines:

- The page titles, descriptions and headings name the business, its services and its area
  (North Brisbane) in the words people search for.
- Each service has its own page, linked from the home page and from each other.
- A block near the top of `index.html` (`<script type="application/ld+json">`) describes the
  business: name, phone, hours, ABN and services. `js/main.js` refreshes the contact details
  in it from `js/config.js`, so `config.js` stays the one place to edit.
- The FAQ questions and answers are marked up so search engines can read them as an FAQ.
- `robots.txt` and `sitemap.xml` tell search engines which pages exist. `sitemap.xml` is
  rewritten, with today's date, each time `tools/build_pages.py` runs.
- For AI assistants and AI search (ChatGPT, Claude, Perplexity, Google's AI answers):
  `robots.txt` names their crawlers and lets them read everything, and `llms.txt` gives them
  the business's details, services and common questions as plain text. `llms.txt` is
  generated from `js/config.js` and the pages, so it stays in step with the site. The pages
  also carry their key facts (phone, hours, area, ABN) as ordinary text, so nothing depends
  on scripts running.
- The `.txt` file with a long random name in the repository root is an
  [IndexNow](https://www.indexnow.org) key. It lets the site tell Bing (which also feeds
  DuckDuckGo and Yahoo) that the page has changed. Leave it in place.

What has to be done from the business's own Google account, because nobody else can:

1. **Google Search Console** (<https://search.google.com/search-console>): add
   `https://joshosmarine.com.au` as a "URL prefix" property and choose the **HTML tag**
   method. Paste the tag it gives you into the `<head>` of `index.html`, publish, then press
   Verify. After that, submit `sitemap.xml` under Sitemaps and use URL inspection →
   **Request indexing** on the home page.
2. **Google Business Profile** (<https://business.google.com>): create the listing for
   Joshos Marine with the phone number, hours, service area and this website. This is what
   puts the business on Google Maps and in the panel beside the results for its name.

Listing the business on Facebook, Instagram and local directories, each with a link back to
this site and the same name and phone number, also helps Google trust and rank it.

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
index.html            The home page
marine-electrical/    \
boat-servicing/        | The four service pages (generated; see "Service pages")
boat-trailer-repairs/  |
custom-boat-fit-outs/ /
tools/pages/          The hand-written body of each service page
tools/build_pages.py  Builds the service pages, sitemap.xml and llms.txt
404.html              "Page not found" page
css/styles.css        Styling shared by every page
css/pages.css         Styling for the service pages only
js/config.js          Contact details and form settings  <- edit this one
js/main.js            Menu, animations, booking form logic
js/pages.js           The voltage-drop tool and the pre-tow check
assets/fonts/         Self-hosted fonts (open licences in assets/fonts/licenses)
assets/img/           Favicon, app icons, share image, chart-line background
CNAME                 The custom domain for GitHub Pages
sitemap.xml           Page list for search engines
robots.txt            Tells search engines and AI crawlers they may read the site
llms.txt              Plain-text summary for AI assistants (generated)
<long name>.txt       IndexNow key (see "Getting found in search")
```

The boat-and-trailer drawing and the wiring diagram are hand-written SVG inside `index.html`,
so they stay sharp at any size and need no image files.
