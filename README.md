# David Dinneya — portfolio

A personal engineering portfolio with a dark editorial design, lime accents, an interactive backend-flow sketch, an animated Job Radar feature, expandable project notes, responsive navigation, and a live Nigeria clock.

**Website:** https://divad1998.github.io/

**Repository:** https://github.com/divad1998/divad1998.github.io

**Featured project:** [Job Radar](https://job-radar.alwaysdata.net/)

## Run locally

No installation or build step is required. Serve `dist/` with any static web server:

```sh
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. The website has no runtime dependencies, backend, analytics, external font requests, or account system.

## Check a release

```sh
node --check dist/assets/site.js
python3 scripts/check_site.py
```

## Edit

- `dist/index.html` — copy, project descriptions, contact links, metadata, and layout.
- `dist/assets/styles.css` — responsive styles and animations.
- `dist/assets/site.js` — interactive tabs, mobile navigation, motion preference, clock, and email copy button.
- `dist/assets/` — locally served fonts, branding, and sharing image. Font licenses are included alongside the fonts.

The API/queue/cache sketch illustrates engineering concepts; it does not expose a live endpoint or claim production measurements. Only Job Radar is linked as a public project. Other project descriptions refer to selected engineering experience.

## Accessibility and privacy

There is a persistent pause/resume control for animation. The system reduced-motion preference is respected. Tabs support arrow, Home, and End keys; project notes use native `details`; every section remains readable without JavaScript. The only localStorage item is `david-portfolio-motion` (`paused` or `playing`). The contact button opens the visitor's email application; it does not submit personal information to a server.

## Publish on GitHub Pages

GitHub Pages serves this portfolio independently of Job Radar. In this repository's **Settings → Pages**, select **GitHub Actions** as the source.

The workflow in `.github/workflows/pages.yml` validates and publishes `dist/` on every push to `main`. It can also be started manually from the Actions tab. Only the static HTML, assets, and sitemap are published; source scripts and the optional Apache configuration are excluded. No deployment secrets, paid hosting, database, scheduler, or npm installation is required.

To update the site, edit the files in `dist/` and push to `main`. Wait for the **Publish portfolio** workflow to complete. The portfolio's canonical URL, sharing image URL, structured data, and sitemap all use `https://divad1998.github.io/`.

The previous alwaysdata installation is not used by this publishing workflow. Its one-time installer is retired; the original implementation remains in Git history at commit `41500f9`. Job Radar remains at its existing alwaysdata address.

If the public URL changes, update the canonical URL, Open Graph URL/image, JSON-LD URL, and sitemap in `dist/`.

## Fonts

Manrope and DM Mono are distributed under the SIL Open Font License. Original copyright and license notices are included in `dist/assets/*-OFL.txt`.

Portfolio content and design © David Dinneya. No license is granted for the site's original content unless separately agreed.
