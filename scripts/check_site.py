"""Validate release files, local references, anchors, and published contact links."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.refs, self.links, self.scripts = [], [], [], []
        self.inline_script = None
    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs: self.ids.append(attrs["id"])
        for key in ("href", "src"):
            if key in attrs: self.refs.append(attrs[key])
        if tag == "a": self.links.append(attrs)
        if tag == "script" and attrs.get("type") == "application/ld+json": self.inline_script = ""
    def handle_data(self, data):
        if self.inline_script is not None: self.inline_script += data
    def handle_endtag(self, tag):
        if tag == "script" and self.inline_script is not None:
            self.scripts.append(json.loads(self.inline_script)); self.inline_script = None

page = Page()
page.feed((DIST / "index.html").read_text())
assert len(page.ids) == len(set(page.ids)), "Duplicate element IDs"
for ref in page.refs:
    parsed = urlparse(ref)
    if parsed.scheme or parsed.netloc: continue
    if parsed.fragment and not parsed.path:
        assert parsed.fragment in page.ids, f"Missing anchor: {ref}"
    elif parsed.path:
        assert (DIST / unquote(parsed.path)).resolve().is_relative_to(DIST.resolve()), f"Outside dist: {ref}"
        assert (DIST / unquote(parsed.path)).is_file(), f"Missing asset: {ref}"
for link in page.links:
    if link.get("target") == "_blank":
        assert "noopener" in link.get("rel", ""), f"Unsafe external link: {link}"
assert any(link.get("href") == "https://job-radar.alwaysdata.net/" for link in page.links)
assert any(link.get("href") == "https://github.com/divad1998" for link in page.links)
assert page.scripts[0]["name"] == "David Dinneya"
css = (DIST / "assets/styles.css").read_text()
css_references = re.sub(r'url\("data:[^\"]*"\)', '', css)
for match in re.finditer(r"url\(['\"]?([^)'\"]+)", css_references):
    ref = match.group(1)
    if ref.startswith("data:"): continue
    assert (DIST / "assets" / ref).is_file(), f"Missing CSS asset: {ref}"
assert "prefers-reduced-motion" in css
for path in DIST.rglob("*"):
    if path.is_file():
        assert not path.name.startswith(".env"), f"Secret file: {path}"
assert sum(p.stat().st_size for p in DIST.rglob("*") if p.is_file()) < 1_000_000
print(f"Release OK: {len(page.ids)} unique IDs; all local assets, links, and anchors valid.")
print(f"Static release: {sum(p.stat().st_size for p in DIST.rglob('*') if p.is_file()):,} bytes.")
