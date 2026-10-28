"""Build an archive containing public files only; never packages the source checkout."""
from pathlib import Path
import hashlib
import gzip
import json
import sys
import tarfile

root = Path(__file__).resolve().parents[1]
dist = root / "dist"
output = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root.parent / "david-dinneya-portfolio-release.tar.gz"
manifest = {str(p.relative_to(dist)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(dist.rglob("*")) if p.is_file()}
with output.open("wb") as destination, gzip.GzipFile(filename="", mode="wb", fileobj=destination, mtime=0) as compressed, tarfile.open(fileobj=compressed, mode="w") as archive:
    for relative in manifest:
        path = dist / relative
        info = archive.gettarinfo(path, arcname=relative)
        info.uid = info.gid = info.mtime = 0
        info.uname = info.gname = ""
        info.mode = 0o644
        info.pax_headers = {}
        with path.open("rb") as source:
            archive.addfile(info, source)
print(json.dumps({"archive": str(output), "sha256": hashlib.sha256(output.read_bytes()).hexdigest(), "files": len(manifest), "bytes": output.stat().st_size, "manifest": manifest}, indent=2))
