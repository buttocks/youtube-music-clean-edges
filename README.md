# YouTube Music Clean Edges

A lightweight userscript that cleans up YouTube Music's desktop layout and adds a few practical playback controls without replacing the site.

## Features

- Compact layout
- Slim, quieter scrollbars
- **Audio Only** toggle in the player bar
  - Red `AUDIO` = off
  - Green `AUDIO ON` = on
  - Uses YouTube Music's native **Song / Video** mode when available
- Automatic handling of the **still listening / continue watching** prompt
- Persistent **STOPS** counter showing how many prompts were automatically dismissed
- Optional promo-banner hiding
- Persistent preferences
- Playback logic designed to avoid interfering with Shuffle or the queue

## Player controls

### AUDIO

Turns Audio Only mode on or off.

When Audio Only is enabled, the script switches tracks to YouTube Music's native **Song** mode when that option is available. When disabled, it switches back to **Video** mode when available.

### STOPS

Shows how many still-listening prompts the script has automatically dismissed.

Click `STOPS` to reset the counter to zero.

## Optional toggles

Open your userscript manager's menu while on YouTube Music to toggle:

- Compact layout
- Slim scrollbars
- Audio Only
- Auto-continue listening
- STOPS counter visibility
- Promo-banner hiding
- Reset STOPS counter

## Install

1. Install a userscript manager such as Tampermonkey or Violentmonkey.
2. Open `YouTube_Music_Clean_Edges.user.js`.
3. Install the script.
4. Reload `https://music.youtube.com/`.

## Performance

Clean Edges is intentionally small. It uses event-driven page monitoring plus a lightweight current-track check. It does not include an ad blocker or large third-party libraries.

## Privacy

Settings and counters are stored locally in your browser. The script does not send data anywhere.

## Compatibility

Designed for the desktop web version of YouTube Music.

Because YouTube Music changes its interface over time, occasional script updates may be required.

## License

MIT
