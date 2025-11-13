from pathlib import Path
import re
import json

BASE_DIR = Path(__file__).resolve().parents[1]
SOUNDS_DIR = BASE_DIR / 'assets' / 'sounds'
OUT_FILE = BASE_DIR / 'data' / 'agent-sound-manifest.js'

IGNORE = {'spin', 'drumroll'}
manifest = {}
for mp3 in sorted(SOUNDS_DIR.glob('*.mp3')):
    stem = mp3.stem.lower()
    if stem in IGNORE:
        continue
    prefix = re.sub(r'\d+$', '', stem)
    suffix = stem[len(prefix):]
    order = int(suffix) if suffix.isdigit() else 1
    manifest.setdefault(prefix, []).append((order, f"assets/sounds/{mp3.name}"))

final = {pre: [path for _, path in sorted(entries)] for pre, entries in sorted(manifest.items())}
OUT_FILE.write_text('window.AGENT_SOUND_MANIFEST = ' + json.dumps(final, indent=2) + ' ;\n')
print(f'Wrote manifest for {len(final)} agents -> {OUT_FILE}')
