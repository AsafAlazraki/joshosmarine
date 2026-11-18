#!/usr/bin/env python3
"""Builds the four service pages and sitemap.xml.

Each service page has its own design. Its body is hand-written HTML in
tools/pages/<slug>.html; this script wraps that body with the parts every page
shares (the <head>, header, menu, contact section, footer and icons), which it
copies straight out of index.html so there is only one copy to maintain.

To change a service page, edit its file in tools/pages/ (or PAGES below for the
title, description and questions), then run

    python3 tools/build_pages.py            # all four pages + sitemap.xml
    python3 tools/build_pages.py <slug>     # just one page, sitemap untouched

and commit the result. Do not edit the generated <slug>/index.html files by
hand; the next run overwrites them.

Placeholders available inside a page body:
    {{crumbs}}      the breadcrumb trail
    {{book}}        link to the booking form with this service ticked
    {{book_label}}  wording for that button, e.g. "Book a service"
    {{phone}} {{tel}}   the number as shown / as dialled (from js/config.js)
    {{arrow}}       the arrow icon used on buttons
    {{faq}}         this page's questions and answers, marked up for search
    {{others}}      cards linking to the other three services
    {{contact}}     the contact section from the home page
"""
import datetime
import html
import json
import re
import sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
BODIES = Path(__file__).resolve().parent / 'pages'
SITE = 'https://joshosmarine.com.au'
AREA = 'North Brisbane'

# "book" must match a service option in the booking form on the home page, so
# the right box is pre-ticked. "view", "detail" and "tag" describe the cropped
# drawing on the cards that link to this page from the other service pages.
PAGES = [
    {
        'slug': 'marine-electrical',
        'name': '12V marine electrical',
        'short': 'Marine electrical',
        'title': f'Marine Electrical & Boat Wiring {AREA} | Joshos Marine',
        'description': f'12V marine electrical in {AREA}: dual batteries, switch panels, sounders, GPS, VHF, '
                       'lighting, bilge pumps and full boat rewires. Call {phone}.',
        'summary': f'Clean, fused and labelled 12V work for trailer boats across {AREA}, '
                   'from a single sounder install to a full rewire.',
        'book': '12V & electrical', 'book_label': 'Book an install',
        'view': '215 178 370 190', 'detail': '01', 'tag': 'Battery to console',
        'card_lede': "Wiring that's fused, labelled and easy to trace. Not a bird's nest behind the dash.",
        'faq': [
            ('Can you install electronics I have already bought?', 'Usually, yes. Tell us the make and model when you book so we can check it suits the boat and turn up with the right cable, fuses and fittings.'),
            ('Do I need a second battery?', 'It depends on what you run. A sounder and a few lights are fine on one battery. Add a fridge, bigger screens or long days at anchor and a separate house battery stops the electronics from flattening the one that starts the motor. Tell us what you run and we will tell you straight.'),
            ('Should the old wiring be repaired or replaced?', 'If the cable is sound and the problem is a few bad joins, a repair is fine. If the cable has gone black inside the insulation, or years of add-ons have no fusing, a rewire usually costs less than chasing faults one at a time. We will tell you which way we would go, and why, before any work starts.'),
            ('How long does an install take?', 'A single sounder or a set of lights is a short job. A dual-battery system or a full rewire takes longer. You will get a realistic timeframe with your quote.'),
        ],
    },
    {
        'slug': 'boat-servicing',
        'name': 'Boat & outboard servicing',
        'short': 'Boat servicing',
        'title': f'Boat & Outboard Servicing {AREA} | Joshos Marine',
        'description': f'Boat and outboard servicing in {AREA}: gearbox oil, impellers, fuel systems, anodes, '
                       'steering and pre-purchase inspections. Call {phone}.',
        'summary': f'Routine outboard servicing and the maintenance jobs that keep a trailer boat reliable, '
                   f'for boats across {AREA}.',
        'book': 'Servicing', 'book_label': 'Book a service',
        'view': '60 222 400 205', 'detail': '02', 'tag': 'Outboard & transom',
        'card_lede': 'Routine servicing, plus the jobs that get put off until something goes bang at the ramp.',
        'faq': [
            ('How often should an outboard be serviced?', "Most manufacturers say every 100 hours or once a year, whichever comes first. Boats used in salt water, or left sitting for long stretches, do best on the yearly service even when the hours are low. Your owner's manual has the schedule for your motor."),
            ('Which outboards do you service?', 'Most of the common brands. Put the make, model and year in the booking form and we will confirm before you book it in.'),
            ('What should I tell you when I book?', 'The make, model and year of the motor, roughly how many hours it has done, when it was last serviced and anything it has been doing that seems off. Photos or a short video help a lot.'),
            ('Can you check the trailer at the same time?', 'Yes. Bearings, brakes and lights can be checked in the same booking, and it usually makes sense to do both together.'),
        ],
    },
    {
        'slug': 'boat-trailer-repairs',
        'name': 'Boat trailer repairs',
        'short': 'Boat trailer repairs',
        'title': f'Boat Trailer Repairs {AREA} | Joshos Marine',
        'description': f'Boat trailer repairs in {AREA}: wheel bearings, brakes, LED lights, rewires, rollers, '
                       'winches, couplings, springs and axles. Call {phone}.',
        'summary': f'Bearings, brakes, lights and rollers for boat trailers across {AREA}. '
                   'It is the part of the rig that gets dunked in salt water every trip.',
        'book': 'Trailer work', 'book_label': 'Book trailer work',
        'view': '200 356 330 169', 'detail': '03', 'tag': 'Hub, guard & rollers',
        'card_lede': "It gets dunked in salt water every trip, then forgotten about. We don't forget about it.",
        'faq': [
            ('How often should boat trailer bearings be serviced?', 'As a rule of thumb, once a year for a trailer that goes in salt water, and sooner if a seal has let water in. A warm hub, grease on the wheel or any rumbling means it needs looking at now, not at the next service.'),
            ('Does the boat have to come off the trailer?', 'For most jobs, no. Bearings, brakes, lights and couplings can be done with the boat on. Roller and bunk work can need the boat off, and we will tell you when you book.'),
            ('My trailer lights keep failing. Is it the lights or the wiring?', 'Often both. Bulb-type lights let water in and corrode, and old joins along the frame break down in salt. We test what is there first and quote from that. A sealed LED set and a proper rewire is usually the lasting fix.'),
            ('Can you look at the trailer while the boat is booked in for something else?', 'Yes. It usually makes sense to check bearings, brakes and lights in the same booking as a service or an install.'),
        ],
    },
    {
        'slug': 'custom-boat-fit-outs',
        'name': 'Custom boat fit-outs',
        'short': 'Custom boat fit-outs',
        'title': f'Custom Boat Fit-Outs {AREA} | Joshos Marine',
        'description': f'Custom boat fit-outs in {AREA}: rod storage, bait boards, casting decks, '
                       'electric motor mounts, live bait tanks and console layouts. Call {phone}.',
        'summary': f'Boats laid out around the way you fish, dive or cruise, for owners across {AREA}. '
                   'Gear goes where it makes sense, and the wiring behind it stays tidy.',
        'book': 'Custom fit-out', 'book_label': 'Plan a fit-out',
        'view': '212 72 414 212', 'detail': '04', 'tag': 'Console & T-top',
        'card_lede': 'Lay the boat out the way you fish, dive or cruise it, with gear mounted where it actually makes sense.',
        'faq': [
            ('Can I supply my own gear?', 'Usually, yes. Tell us what you have when you book so we can check it suits the boat and plan around it.'),
            ('Do you do the electrical side as well?', 'Yes. Fit-outs and 12V work go hand in hand, so screens, lights, pumps and electric motors are wired as part of the same job.'),
            ('How do we work out the layout?', 'Start by telling us how you use the boat and what annoys you about it now. Photos help. From there we talk through the options and put a quote together before anything is drilled.'),
            ('How long does a fit-out take?', 'It depends on how much is involved. A few rod holders and a bait board is quick. A full deck and console rework takes longer. You will get a realistic timeframe with your quote.'),
        ],
    },
]

SLUGS = [p['slug'] for p in PAGES]
esc = html.escape
ARROW = '<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>'


def cut(text, start, end):
    """The piece of `text` from `start` to the first `end` after it, inclusive."""
    i = text.index(start)
    return text[i:text.index(end, i) + len(end)]


def relink(fragment, book_url, keep_top=False):
    """Point the home page's own links at the home page from one folder down."""
    def fix(m):
        before, target = m.group(1), m.group(2)
        if target == 'top':
            return m.group(0) if keep_top else f'{before}href="../"'
        if target == 'booking':
            return f'{before}href="{book_url}"'
        return f'{before}href="../#{target}"'
    fragment = re.sub(r'(<a\b[^>]*?)href="#([^"]*)"', fix, fragment)
    for slug in SLUGS:
        fragment = fragment.replace(f'href="{slug}/"', f'href="../{slug}/"')
    return fragment


def indent(block, spaces):
    pad = ' ' * spaces
    return '\n'.join(pad + line if line else line for line in block.split('\n'))


def build(only=None):
    home = (ROOT / 'index.html').read_text(encoding='utf-8')
    config = (ROOT / 'js/config.js').read_text(encoding='utf-8')
    phone = re.search(r'\bphone:\s*"([^"]+)"', config).group(1)
    phone_link = re.search(r'\bphoneLink:\s*"([^"]+)"', config).group(1)

    if only and only not in SLUGS:
        sys.exit(f'No such page: {only}. Pages are: {", ".join(SLUGS)}')
    for slug in SLUGS:
        assert f'href="{slug}/"' in home, f'index.html has no link to {slug}/'

    # Shared pieces, lifted from the home page so there is one copy to maintain.
    defs = cut(home, '<svg class="svg-defs"', '</defs>\n  </svg>')
    header = cut(home, '<header class="site-header" data-header>', '</header>')
    menu = cut(home, '<div class="mobile-menu" id="mobile-menu"', '<main id="main">')[:-len('<main id="main">')].rstrip()
    contact = cut(home, '<section class="section section--signal contact" id="contact">', '</section>')
    footer = cut(home, '<footer class="site-footer">', '</footer>')
    quickbar = cut(home, '<div class="quickbar" data-quickbar>', '</div>')
    https_script = cut(home, '<script>\n    // Visitors who arrive on the insecure', '</script>')
    js_script = cut(home, '<script>\n    // Enables scroll animations', '</script>')

    for page in PAGES:
        slug, name = page['slug'], page['name']
        if only and slug != only:
            continue
        url = f'{SITE}/{slug}/'
        book_url = f'../?book={quote(page["book"])}#booking'
        description = page['description'].format(phone=phone)
        assert len(page['title']) <= 65, (slug, 'title', len(page['title']))
        assert 110 <= len(description) <= 165, (slug, 'description', len(description))
        assert home.count(f'value="{esc(page["book"])}"') == 1, (slug, 'booking option not found', page['book'])

        data = {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'Service',
                    '@id': url + '#service',
                    'name': name,
                    'serviceType': name,
                    'description': page['summary'],
                    'url': url,
                    'areaServed': AREA,
                    'provider': {'@type': 'LocalBusiness', '@id': SITE + '/#business', 'name': 'Joshos Marine', 'url': SITE + '/'},
                },
                {
                    '@type': 'BreadcrumbList',
                    'itemListElement': [
                        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE + '/'},
                        {'@type': 'ListItem', 'position': 2, 'name': name, 'item': url},
                    ],
                },
            ],
        }

        crumbs = f'''<nav class="crumbs" aria-label="Breadcrumb" data-reveal>
            <ol>
              <li><a href="../">Home</a></li>
              <li><a href="../#services">Services</a></li>
              <li aria-current="page">{esc(page['short'])}</li>
            </ol>
          </nav>'''

        faq = '<div class="faq" data-reveal itemscope itemtype="https://schema.org/FAQPage">\n' + '\n'.join(
            f'''          <details class="faq__item" name="faq"{' open' if i == 0 else ''} itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <summary><span itemprop="name">{esc(q)}</span><i aria-hidden="true"></i></summary>
            <div class="faq__a" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><p itemprop="text">{esc(a)}</p></div>
          </details>''' for i, (q, a) in enumerate(page['faq'])) + '\n        </div>'

        others = '<div class="svc-grid svc-grid--three">\n' + '\n'.join(
            f'''          <article class="svc svc--link" data-reveal style="--d:{i * .08:.2f}s">
            <div class="svc__art" aria-hidden="true">
              <div class="svc__view"><svg viewBox="{o['view']}" preserveAspectRatio="xMidYMid slice"><use href="#rig"/></svg></div>
              <p class="svc__tag"><b>Detail {o['detail']}</b><span>{esc(o['tag'])}</span></p>
            </div>
            <div class="svc__body">
              <h3 class="svc__title"><a href="../{o['slug']}/">{esc(o['name'])}</a></h3>
              <p class="svc__lede">{esc(o['card_lede'])}</p>
              <a class="link-arrow" href="../{o['slug']}/">{esc(o['short'])} {ARROW}</a>
            </div>
          </article>''' for i, o in enumerate(p for p in PAGES if p is not page)) + '\n        </div>'

        page_header = relink(header, book_url).replace(
            'aria-label="Joshos Marine — back to top"', 'aria-label="Joshos Marine — home"')
        page_footer = relink(footer, book_url, keep_top=True).replace(
            f'<a href="../{slug}/">', f'<a href="../{slug}/" aria-current="page">')
        page_contact = relink(contact, book_url) \
            .replace('<span class="eyebrow__num">07</span>', '<span class="eyebrow__led"></span>') \
            .replace('data-subject="Callback request"', f'data-subject="Callback request ({esc(name)} page)"')
        assert f'({esc(name)} page)' in page_contact and 'aria-current="page"' in page_footer, slug

        body = (BODIES / f'{slug}.html').read_text(encoding='utf-8').rstrip()
        tokens = {
            'crumbs': crumbs, 'book': book_url, 'book_label': esc(page['book_label']),
            'phone': esc(phone), 'tel': phone_link, 'arrow': ARROW,
            'faq': faq, 'others': others, 'contact': page_contact,
        }
        for key, value in tokens.items():
            body = body.replace('{{' + key + '}}', value)
        left = re.findall(r'\{\{[^}]*\}\}', body)
        assert not left, (slug, 'unknown placeholders', left)
        assert body.count('<h1') == 1, (slug, 'a page needs exactly one <h1>')

        out = f'''<!doctype html>
<!-- Generated by tools/build_pages.py from tools/pages/{slug}.html. Edit those, not this file. -->
<html lang="en-AU">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{esc(page['title'])}</title>
  <meta name="description" content="{esc(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="geo.region" content="AU-QLD">
  <meta name="geo.placename" content="{esc(AREA)}">
  <meta name="theme-color" content="#06182a">
  <meta name="format-detection" content="telephone=no">
  {https_script}
  <link rel="canonical" href="{url}">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Joshos Marine">
  <meta property="og:title" content="{esc(name)} in {esc(AREA)} — Joshos Marine">
  <meta property="og:description" content="{esc(page['summary'])}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{SITE}/assets/img/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Joshos Marine: 12V installs, servicing, trailer work and custom fit-outs">
  <meta property="og:locale" content="en_AU">
  <meta name="twitter:card" content="summary_large_image">

  <script type="application/ld+json" id="page-data">
{indent(json.dumps(data, indent=2, ensure_ascii=False), 2)}
  </script>

  <link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../assets/img/apple-touch-icon.png">
  <link rel="manifest" href="../site.webmanifest">

  <link rel="preload" href="../assets/fonts/big-shoulders-display-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../assets/fonts/instrument-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../css/styles.css">
  <link rel="stylesheet" href="../css/pages.css">

  {js_script}
  <script src="../js/config.js" defer></script>
  <script src="../js/main.js" defer></script>
  <script src="../js/pages.js" defer></script>
</head>
<body class="page page--{slug}">
  <a class="skip-link" href="#main">Skip to content</a>

  {defs}

  {page_header}

  {relink(menu, book_url)}

  <main id="main">

{body}

  </main>

  {page_footer}

  <!-- Mobile quick actions -->
  {relink(quickbar, book_url)}
</body>
</html>
'''
        assert 'href="#booking"' not in out and 'href="#services"' not in out, slug
        folder = ROOT / slug
        folder.mkdir(exist_ok=True)
        (folder / 'index.html').write_text(out, encoding='utf-8')
        print(f'wrote {slug}/index.html  ({len(out) // 1024} KB, title {len(page["title"])}, description {len(description)})')

    if not only:
        today = datetime.date.today().isoformat()
        urls = [SITE + '/'] + [f'{SITE}/{slug}/' for slug in SLUGS]
        sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
            f'  <url>\n    <loc>{u}</loc>\n    <lastmod>{today}</lastmod>\n  </url>\n' for u in urls) + '</urlset>\n'
        (ROOT / 'sitemap.xml').write_text(sitemap, encoding='utf-8')
        print(f'wrote sitemap.xml  ({len(urls)} pages, dated {today})')

        # llms.txt: the same facts as the site, in plain text, for AI assistants
        # and AI search to read. Built from config.js and the pages themselves.
        email = re.search(r'\bemail:\s*"([^"]+)"', config).group(1)
        abn = re.search(r'\babn:\s*"([^"]*)"', config).group(1)
        hours_block = re.search(r'\bhours:\s*\[(.*?)\n\s*\],', config, re.S).group(1)
        hours = re.findall(r'\[\s*"([^"]+)",\s*"([^"]+)"\s*\]', hours_block)
        plain = lambda s: html.unescape(re.sub(r'<[^>]+>', '', s)).strip()
        home_faq = [(plain(q), plain(a)) for q, a in re.findall(
            r'<span itemprop="name">(.*?)</span>.*?<p itemprop="text">(.*?)</p>', home, re.S)]
        assert email and hours and len(home_faq) >= 6, 'could not read the details for llms.txt'
        lines = [
            '# Joshos Marine',
            '',
            f'> Joshos Marine is a marine services business in {AREA}, Queensland, Australia. '
            'It does 12V marine electrical work, boat and outboard servicing, boat trailer repairs '
            'and custom boat fit-outs for trailer boats. A quote is given before any work starts.',
            '',
            '## Contact',
            '',
            f'- Phone (call or text): {phone}',
            f'- Email: {email}',
            f'- Service area: {AREA}, Queensland',
            '- Hours: ' + '; '.join(f'{d} {h}' for d, h in hours),
        ] + ([f'- ABN: {abn}'] if abn else []) + [
            f'- Book a job online: {SITE}/#booking',
            f'- Website: {SITE}/',
            '',
            '## Services',
            '',
        ] + [f'- [{p["name"]}]({SITE}/{p["slug"]}/): {p["summary"]}' for p in PAGES] + [
            '',
            '## Common questions',
            '',
        ]
        for q, a in home_faq + [qa for p in PAGES for qa in p['faq']]:
            lines += [f'### {q}', '', a, '']
        (ROOT / 'llms.txt').write_text('\n'.join(lines).rstrip() + '\n', encoding='utf-8')
        print(f'wrote llms.txt  ({len(home_faq) + sum(len(p["faq"]) for p in PAGES)} questions)')


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else None)
