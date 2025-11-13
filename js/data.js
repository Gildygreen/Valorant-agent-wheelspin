// Fetch agents from a public Valorant API and populate agent list/colors
async function loadAgentsFromValorantApi() {
  try {
    const res = await fetch('https://valorant-api.com/v1/agents');
    const json = await res.json();
    if (!json || !json.data) return;
    const fetched = json.data.filter(a => a.isPlayableCharacter).map(a => ({
      name: a.displayName,
      img: a.displayIcon || a.bustPortrait || '',
      color: '#888888',
      winSounds: []
    }));

    // Preload images; use colors from the local `agents` list when available, otherwise fall back to a generated color
    const loads = fetched.map(async (f) => {
      const existing = agents.find(x => x.name.toLowerCase() === f.name.toLowerCase());
      if (existing) {
        f.winSounds = existing.winSounds;
        if (existing.color) f.color = existing.color;
      }

      if (f.img) {
        let img = new Image();
        img.crossOrigin = 'Anonymous';
        await new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = f.img;
        });
        f._image = img;
      }

      // Ensure a color exists: prefer listed color, otherwise fallback to name-based generator
      if (!f.color) f.color = nameToColor(f.name);
    });

    await Promise.all(loads);

    // Replace agents and redraw
    agents = fetched;
    // reset pointer-relative tracking so tick detection doesn't fire spuriously
    prevRel = null;
    drawWheel();
    populatePerAgentSettings();
    populateDebugAgentSelect();
  } catch (e) {
    console.warn('Failed to load agents from API', e);
  }
}

// Kick off agent loading
loadAgentsFromValorantApi();
