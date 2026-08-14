# YouTube Music Clean Edges

A lightweight userscript for the desktop YouTube Music site. It cleans up the layout and adds practical playback controls while leaving YouTube Music's normal queue and Shuffle behavior alone.

**Current release: v3.5.0**

## Install

1. Install a userscript manager such as Tampermonkey or Violentmonkey.
2. Open the direct userscript link below.
3. Approve the install in your userscript manager.
4. Reload YouTube Music.

**[Install YouTube Music Clean Edges](https://raw.githubusercontent.com/buttocks/youtube-music-clean-edges/main/YouTube_Music_Clean_Edges.user.js)**

Source file: [`YouTube_Music_Clean_Edges.user.js`](YouTube_Music_Clean_Edges.user.js)

## Features

- Compact desktop layout
- Slim, quieter scrollbars
- **Audio Only** toggle in the player bar
  - Red `AUDIO` = off
  - Green `AUDIO ON` = on
  - Uses YouTube Music's native **Song / Video** mode when available
- Automatically handles the **still listening / continue watching** prompt
- Persistent **STOPS** counter showing how many prompts were automatically dismissed
- Optional promo-banner hiding
- Persistent preferences
- Lightweight per-track playback logic designed not to interfere with Shuffle or the queue

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

## Performance

Clean Edges is intentionally small. It uses event-driven page monitoring plus a lightweight current-track check. It does not include an ad blocker or large third-party libraries.

The Audio Only feature uses YouTube Music's own Song/Video mode rather than simply covering the video with CSS.

## Privacy

Settings and counters are stored locally in your browser. The script does not send data anywhere.

## Compatibility

Designed for the desktop web version of YouTube Music.

YouTube Music changes its interface over time, so occasional script updates may be required.

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md).

## License

MIT — see [`LICENSE`](LICENSE).
