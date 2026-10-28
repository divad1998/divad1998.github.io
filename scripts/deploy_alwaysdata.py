"""Install a verified public GitHub commit as a static alwaysdata portfolio.

Run on the existing job-radar alwaysdata account:
    python3 deploy_alwaysdata.py --commit FULL_GITHUB_COMMIT_SHA

No credentials are needed for the public repository. Existing releases are backed
up, never removed. The Job Radar application and its environment are untouched.
"""
from pathlib import Path, PurePosixPath
import argparse
import fcntl
import hashlib
import io
import json
import os
import re
import shutil
import tempfile
import urllib.request
import zipfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--commit', required=True, help='Full 40-character public GitHub commit SHA')
parser.add_argument('--account-home', default='/home/job-radar')
args = parser.parse_args()
if not re.fullmatch(r'[0-9a-f]{40}', args.commit):
    parser.error('Use a full lowercase GitHub commit SHA.')
home = Path(args.account_home).resolve()
public = home / 'job-matcher/public'
target = public / 'portfolio'
if not (public / 'index.php').is_file():
    raise SystemExit('Expected the existing Job Radar public directory; stopping.')
if target.is_symlink():
    raise SystemExit('The portfolio path is a symbolic link; stopping.')
marker = home / ('.portfolio-deployed-' + args.commit)
lock = (home / '.portfolio-deploy.lock').open('a')
fcntl.flock(lock.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
if marker.is_file() and (target / 'index.html').is_file():
    print('PORTFOLIO_ALREADY_DEPLOYED ' + args.commit)
    raise SystemExit(0)

url = 'https://codeload.github.com/divad1998/david-dinneya-portfolio/zip/' + args.commit
request = urllib.request.Request(url, headers={'User-Agent': 'DavidDinneya-Portfolio-Deploy/1.0'})
with urllib.request.urlopen(request, timeout=45) as response:
    payload = response.read(2_000_001)
if len(payload) > 2_000_000:
    raise SystemExit('Archive unexpectedly large; stopping.')
archive = zipfile.ZipFile(io.BytesIO(payload))
prefix = 'david-dinneya-portfolio-' + args.commit + '/'
manifest = json.loads(archive.read(prefix + 'scripts/release-manifest.json'))
if not isinstance(manifest, dict) or not 5 <= len(manifest) <= 40:
    raise SystemExit('Unexpected release manifest.')
expected = {'index.html', '.htaccess', 'assets/styles.css', 'assets/site.js', 'assets/favicon.svg'}
if not expected.issubset(manifest):
    raise SystemExit('Essential public files missing from the manifest.')
stage = Path(tempfile.mkdtemp(prefix='.portfolio-stage-', dir=home))
backup = None
try:
    for relative, checksum in manifest.items():
        path = PurePosixPath(relative)
        if path.is_absolute() or '..' in path.parts or not re.fullmatch(r'[0-9a-f]{64}', checksum):
            raise ValueError('Unsafe or malformed manifest entry.')
        data = archive.read(prefix + 'dist/' + relative)
        if hashlib.sha256(data).hexdigest() != checksum:
            raise ValueError('Checksum mismatch: ' + relative)
        destination = stage.joinpath(*path.parts)
        destination.parent.mkdir(parents=True, exist_ok=True, mode=0o755)
        destination.write_bytes(data)
        destination.chmod(0o644)
    stage.chmod(0o755)
    if target.exists():
        backups = home / 'portfolio-backups'
        backups.mkdir(exist_ok=True, mode=0o700)
        backup = backups / ('previous-' + args.commit[:12])
        if backup.exists():
            raise FileExistsError('Backup already exists; stopping before changing the live site.')
        target.rename(backup)
    try:
        stage.rename(target)
    except Exception:
        if backup is not None:
            backup.rename(target)
        raise
    marker.write_text(args.commit + '\n')
    print('PORTFOLIO_READY https://job-radar.alwaysdata.net/portfolio/')
    print('COMMIT ' + args.commit)
    print('VERIFIED_FILES ' + str(len(manifest)))
    print('PUBLIC_BYTES ' + str(sum((target / name).stat().st_size for name in manifest)))
    if backup is not None:
        print('PREVIOUS_RELEASE ' + str(backup))
finally:
    if stage.exists():
        shutil.rmtree(stage)
