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

There are two forms: the three-step **Book a job** form and the short **Request a call back** form.

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

Any static host works (GitHub Pages, Cloudflare Pages, Netlify). Point it at the repository
root with no build command.

For GitHub Pages: **Settings → Pages → Build and deployment → Deploy from a branch**, choose
`main` and `/ (root)`, then save. The site appears at `https://<owner>.github.io/joshosmarine/`
within a minute or two and redeploys on every push. A custom domain can be added on the same
settings page later; all links in the site are relative, so nothing needs changing when it moves.

## What's where

```
index.html            The whole page
404.html              "Page not found" page
css/styles.css        All styling
js/config.js          Contact details and form settings  <- edit this one
js/main.js            Menu, animations, booking form logic
assets/fonts/         Self-hosted fonts (open licences in assets/fonts/licenses)
assets/img/           Favicon, app icons, share image, chart-line background
```

The boat-and-trailer drawing and the wiring diagram are hand-written SVG inside `index.html`,
so they stay sharp at any size and need no image files.
