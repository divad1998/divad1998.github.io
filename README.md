# David Dinneya — portfolio

A personal engineering portfolio with a dark editorial design, lime accents, an interactive backend-flow sketch, an animated Job Radar feature, expandable project notes, responsive navigation, and a live Nigeria clock.

**Website:** https://job-radar.alwaysdata.net/portfolio/

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

## Deploy on alwaysdata

Deploy **the contents of `dist/` only** to `/home/job-radar/job-matcher/public/portfolio/`. This adds a static directory beneath the existing Job Radar document root, so the existing Job Radar application and its URL continue to work. Relative asset links support the `/portfolio/` path. This site requires no PHP process, database, scheduler, or npm build.

Use SFTP/SSH with your existing alwaysdata access. Do not commit credentials, SSH keys, the Laravel `.env`, or the whole Laravel application here. Copy to a new staging directory first, verify the files, and rename into place. When updating an existing release, retain its previous directory as a backup. The deployment preparation script `scripts/package_release.py` writes a deterministic archive and manifest for the static files.

If the public URL changes, update the canonical URL, Open Graph URL/image, JSON-LD URL, and sitemap in `dist/`.

## Fonts

Manrope and DM Mono are distributed under the SIL Open Font License. Original copyright and license notices are included in `dist/assets/*-OFL.txt`.

Portfolio content and design © David Dinneya. No license is granted for the site's original content unless separately agreed.
