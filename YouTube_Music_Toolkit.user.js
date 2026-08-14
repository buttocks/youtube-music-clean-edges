// ==UserScript==
// @name         YouTube Music Toolkit
// @namespace    ytmusic-clean-edges
// @version      3.5.0
// @description  YouTube Music toolkit with compact layout controls, Audio Only mode, automatic still-listening handling, and lightweight playback tweaks.
// @match        https://music.youtube.com/*
// @run-at       document-start
// @license      MIT
// @grant        GM_registerMenuCommand
// ==/UserScript==

(() => {
  'use strict';

  const AUDIO_KEY = 'ytm-clean-edges-audio-only';
  const STOP_COUNT_KEY = 'ytm-clean-edges-still-listening-stops';
  const ANTI_PAUSE_KEY = 'ytm-clean-edges-anti-pause';
  const COMPACT_KEY = 'ytm-clean-edges-compact-layout';
  const SCROLLBAR_KEY = 'ytm-clean-edges-slim-scrollbars';
  const COUNTER_VIS_KEY = 'ytm-clean-edges-show-counter';
  const PROMO_KEY = 'ytm-clean-edges-hide-promos';

  const STYLE_ID = 'ytm-clean-edges-style-v350';
  const CONTROLS_ID = 'ytm-clean-lite-controls';
  const AUDIO_BUTTON_ID = 'ytm-clean-lite-audio';
  const STOP_COUNTER_ID = 'ytm-clean-lite-stops';

  let audioOnly = localStorage.getItem(AUDIO_KEY) === '1';
  let antiPause = localStorage.getItem(ANTI_PAUSE_KEY) !== '0';
  let compactLayout = localStorage.getItem(COMPACT_KEY) !== '0';
  let slimScrollbars = localStorage.getItem(SCROLLBAR_KEY) !== '0';
  let showCounter = localStorage.getItem(COUNTER_VIS_KEY) !== '0';
  let hidePromos = localStorage.getItem(PROMO_KEY) === '1';

  let stopCount = Number.parseInt(localStorage.getItem(STOP_COUNT_KEY) || '0', 10);
  if (!Number.isFinite(stopCount) || stopCount < 0) stopCount = 0;

  let lastAudioTrackKey = '';
  let lastVideoRestoreKey = '';
  let mediaHooked = null;

  const css = `
    :root {
      --ytm-clean-sidebar-width: 190px;
      --ytm-clean-search-width: 405px;
      --ytm-clean-player-gap: 18px;
    }

    html[data-ytm-ce-compact="1"] ytmusic-guide-renderer {
      width: var(--ytm-clean-sidebar-width) !important;
      min-width: var(--ytm-clean-sidebar-width) !important;
      max-width: var(--ytm-clean-sidebar-width) !important;
    }

    html[data-ytm-ce-compact="1"] ytmusic-guide-renderer #guide-content,
    html[data-ytm-ce-compact="1"] ytmusic-guide-renderer #guide-wrapper {
      width: var(--ytm-clean-sidebar-width) !important;
    }

    html[data-ytm-ce-compact="1"] ytmusic-guide-entry-renderer .title,
    html[data-ytm-ce-compact="1"] ytmusic-guide-entry-renderer yt-formatted-string {
      max-width: 140px !important;
    }

    html[data-ytm-ce-compact="1"] ytmusic-nav-bar {
      min-height: 60px !important;
      height: 60px !important;
    }

    html[data-ytm-ce-compact="1"] ytmusic-search-box,
    html[data-ytm-ce-compact="1"] ytmusic-search-box[is-open],
    html[data-ytm-ce-compact="1"] ytmusic-nav-bar ytmusic-search-box {
      width: var(--ytm-clean-search-width) !important;
      max-width: var(--ytm-clean-search-width) !important;
    }

    html[data-ytm-ce-compact="1"] ytmusic-carousel-shelf-renderer,
    html[data-ytm-ce-compact="1"] ytmusic-shelf-renderer {
      margin-bottom: 24px !important;
    }

    html[data-ytm-ce-compact="1"] ytmusic-carousel-shelf-renderer #header,
    html[data-ytm-ce-compact="1"] ytmusic-shelf-renderer #header,
    html[data-ytm-ce-compact="1"] ytmusic-carousel-shelf-renderer .header,
    html[data-ytm-ce-compact="1"] ytmusic-shelf-renderer .header {
      margin-bottom: 12px !important;
    }

    html[data-ytm-ce-compact="1"] ytmusic-section-list-renderer #contents > ytmusic-carousel-shelf-renderer,
    html[data-ytm-ce-compact="1"] ytmusic-section-list-renderer #contents > ytmusic-shelf-renderer {
      padding-top: 8px !important;
      padding-bottom: 8px !important;
    }

    html[data-ytm-ce-scrollbars="1"],
    html[data-ytm-ce-scrollbars="1"] body,
    html[data-ytm-ce-scrollbars="1"] ytmusic-app,
    html[data-ytm-ce-scrollbars="1"] ytmusic-app-layout,
    html[data-ytm-ce-scrollbars="1"] ytmusic-section-list-renderer,
    html[data-ytm-ce-scrollbars="1"] ytmusic-tab-renderer,
    html[data-ytm-ce-scrollbars="1"] #content,
    html[data-ytm-ce-scrollbars="1"] #contents,
    html[data-ytm-ce-scrollbars="1"] #side-panel {
      scrollbar-width: thin !important;
      scrollbar-color: rgba(255,255,255,.07) transparent !important;
    }

    html[data-ytm-ce-scrollbars="1"] *::-webkit-scrollbar {
      width: 6px !important;
      height: 6px !important;
    }

    html[data-ytm-ce-scrollbars="1"] *::-webkit-scrollbar-track,
    html[data-ytm-ce-scrollbars="1"] *::-webkit-scrollbar-corner {
      background: transparent !important;
    }

    html[data-ytm-ce-scrollbars="1"] *::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,.07) !important;
      border-radius: 999px !important;
    }

    html[data-ytm-ce-scrollbars="1"] *:hover::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,.35) !important;
    }

    ytmusic-player-bar {
      box-sizing: border-box !important;
      padding-right: var(--ytm-clean-player-gap) !important;
    }

    #${CONTROLS_ID} {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin: 0 5px;
      flex: 0 0 auto;
    }

    #${AUDIO_BUTTON_ID},
    #${STOP_COUNTER_ID} {
      appearance: none;
      border-radius: 999px;
      height: 28px;
      cursor: pointer;
      box-sizing: border-box;
    }

    #${AUDIO_BUTTON_ID} {
      border: 1px solid rgba(255,76,76,.78);
      background: rgba(180,25,25,.28);
      color: #ff6b6b;
      min-width: 58px;
      padding: 0 10px;
      font: 600 11px/26px Arial, sans-serif;
      letter-spacing: .45px;
    }

    #${AUDIO_BUTTON_ID}[data-on="1"] {
      background: rgba(20,145,70,.34);
      border-color: rgba(70,220,120,.90);
      color: #6ee89a;
    }

    #${STOP_COUNTER_ID} {
      border: 1px solid rgba(255,255,255,.16);
      background: rgba(255,255,255,.045);
      color: rgba(255,255,255,.68);
      min-width: 62px;
      padding: 0 9px;
      font: 600 10px/26px Arial, sans-serif;
      letter-spacing: .35px;
    }

    #${STOP_COUNTER_ID}[data-has-stops="1"] {
      border-color: rgba(85,210,120,.42);
      color: #83dda0;
    }

    #${STOP_COUNTER_ID}[data-flash="1"] {
      background: rgba(28,175,78,.40);
      border-color: rgba(92,235,137,.96);
      color: #a8f4bd;
    }

    html[data-ytm-ce-counter="0"] #${STOP_COUNTER_ID} {
      display: none !important;
    }

    html[data-ytm-ce-promos="1"] ytmusic-mealbar-promo-renderer,
    html[data-ytm-ce-promos="1"] ytmusic-promo-banner-renderer,
    html[data-ytm-ce-promos="1"] ytmusic-promotion-shelf-renderer,
    html[data-ytm-ce-promos="1"] [class*="premium-promo"],
    html[data-ytm-ce-promos="1"] [id*="premium-promo"] {
      display: none !important;
    }

    @media (max-width: 1180px) {
      :root {
        --ytm-clean-sidebar-width: 176px;
        --ytm-clean-search-width: 350px;
      }
    }
  `;

  function applyVisualPrefs() {
    if (!document.documentElement) return;

    const root = document.documentElement;
    root.dataset.ytmCeCompact = compactLayout ? '1' : '0';
    root.dataset.ytmCeScrollbars = slimScrollbars ? '1' : '0';
    root.dataset.ytmCeCounter = showCounter ? '1' : '0';
    root.dataset.ytmCePromos = hidePromos ? '1' : '0';
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  function getRightControls() {
    const bar = document.querySelector('ytmusic-player-bar');
    if (!bar) return null;

    return (
      bar.querySelector('#right-controls') ||
      bar.querySelector('.right-controls') ||
      bar.querySelector('[class*="right-controls"]')
    );
  }

  function stopBubble(el) {
    ['pointerdown', 'mousedown', 'mouseup', 'pointerup', 'click'].forEach(type => {
      el.addEventListener(type, event => event.stopPropagation(), false);
    });
  }

  function updateControls() {
    const audio = document.getElementById(AUDIO_BUTTON_ID);

    if (audio) {
      audio.dataset.on = audioOnly ? '1' : '0';
      audio.textContent = audioOnly ? 'AUDIO ON' : 'AUDIO';
      audio.title = audioOnly
        ? 'Audio Only ON — prefers YouTube Music Song mode'
        : 'Audio Only OFF — restores Video mode when available';
    }

    const stops = document.getElementById(STOP_COUNTER_ID);

    if (stops) {
      stops.textContent = `STOPS ${stopCount}`;
      stops.dataset.hasStops = stopCount > 0 ? '1' : '0';
      stops.title = `${stopCount} still-listening prompt${stopCount === 1 ? '' : 's'} dismissed. Click to reset.`;
    }
  }

  function createControls() {
    const right = getRightControls();
    if (!right) return;

    let cluster = document.getElementById(CONTROLS_ID);

    if (cluster && cluster.parentElement !== right) {
      cluster.remove();
      cluster = null;
    }

    if (!cluster) {
      cluster = document.createElement('span');
      cluster.id = CONTROLS_ID;
      stopBubble(cluster);

      const audio = document.createElement('button');
      audio.id = AUDIO_BUTTON_ID;
      audio.type = 'button';

      audio.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();

        audioOnly = !audioOnly;
        localStorage.setItem(AUDIO_KEY, audioOnly ? '1' : '0');

        lastAudioTrackKey = '';
        lastVideoRestoreKey = '';

        updateControls();

        if (audioOnly) {
          scheduleSongModeForCurrentTrack(true);
        } else {
          scheduleVideoRestoreForCurrentTrack(true);
        }
      });

      const stops = document.createElement('button');
      stops.id = STOP_COUNTER_ID;
      stops.type = 'button';

      stops.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();

        stopCount = 0;
        localStorage.setItem(STOP_COUNT_KEY, '0');
        updateControls();
      });

      cluster.append(audio, stops);
      right.prepend(cluster);
    }

    updateControls();
  }

  function getModeButton(label) {
    const page = document.querySelector('ytmusic-player-page');
    if (!page) return null;

    const controls = page.querySelectorAll(
      'button, tp-yt-paper-button, [role="button"]'
    );

    for (const el of controls) {
      const text = (el.innerText || el.textContent || '').trim();
      const aria = el.getAttribute('aria-label') || '';

      if (text === label || aria === label) {
        return el.closest('button, tp-yt-paper-button, [role="button"]') || el;
      }
    }

    return null;
  }

  function trackKey() {
    const media = document.querySelector('video, audio');
    const src = media?.currentSrc || media?.src || '';

    const title =
      document.querySelector('ytmusic-player-bar .title')?.textContent?.trim() ||
      document.querySelector('ytmusic-player-bar [class*="title"]')?.textContent?.trim() ||
      '';

    return `${location.pathname}${location.search}|${src}|${title}`;
  }

  function clickMode(label) {
    const button = getModeButton(label);
    if (!button) return false;

    button.click();
    return true;
  }

  function scheduleSongModeForCurrentTrack(force = false) {
    if (!audioOnly) return;

    const key = trackKey();
    if (!force && key && key === lastAudioTrackKey) return;

    let clicked = false;

    [0, 120, 350, 800].forEach(delay => {
      setTimeout(() => {
        if (!audioOnly || clicked) return;

        const nowKey = trackKey();
        if (!force && nowKey && nowKey === lastAudioTrackKey) return;

        if (clickMode('Song')) {
          clicked = true;
          lastAudioTrackKey = nowKey || key || String(Date.now());
          lastVideoRestoreKey = '';
        }
      }, delay);
    });
  }

  function scheduleVideoRestoreForCurrentTrack(force = false) {
    if (audioOnly) return;

    const key = trackKey();
    if (!force && key && key === lastVideoRestoreKey) return;

    let clicked = false;

    [0, 120, 350, 800].forEach(delay => {
      setTimeout(() => {
        if (audioOnly || clicked) return;

        const nowKey = trackKey();
        if (!force && nowKey && nowKey === lastVideoRestoreKey) return;

        if (clickMode('Video')) {
          clicked = true;
          lastVideoRestoreKey = nowKey || key || String(Date.now());
          lastAudioTrackKey = '';
        }
      }, delay);
    });
  }

  function hookCurrentMedia() {
    const media = document.querySelector('video, audio');
    if (!media || media === mediaHooked) return;

    mediaHooked = media;

    const onTrackActivity = () => {
      if (audioOnly) {
        scheduleSongModeForCurrentTrack(false);
      }
    };

    media.addEventListener('loadedmetadata', onTrackActivity, { passive: true });
    media.addEventListener('durationchange', onTrackActivity, { passive: true });
    media.addEventListener('playing', onTrackActivity, { passive: true });
  }

  function visible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function textOf(el) {
    return (el?.innerText || el?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function handlePausePrompt(root = document) {
    if (!antiPause) return;

    const dialogs = root.matches?.('tp-yt-paper-dialog, [role="dialog"]')
      ? [root]
      : [...root.querySelectorAll?.('tp-yt-paper-dialog, [role="dialog"]') || []];

    for (const dialog of dialogs) {
      if (!visible(dialog)) continue;

      const text = textOf(dialog);
      if (!/video paused|continue watching|still watching/i.test(text)) continue;

      const buttons = [...dialog.querySelectorAll(
        'button, tp-yt-paper-button, yt-button-shape button, [role="button"]'
      )].filter(visible);

      const button =
        buttons.find(btn =>
          /^(yes|continue|continue watching|ok)$/i.test(textOf(btn)) ||
          /^(yes|continue|continue watching|ok)$/i.test(btn.getAttribute('aria-label') || '')
        ) ||
        buttons.at(-1);

      if (!button) continue;

      button.click();

      stopCount += 1;
      localStorage.setItem(STOP_COUNT_KEY, String(stopCount));
      updateControls();

      const counter = document.getElementById(STOP_COUNTER_ID);

      if (counter) {
        counter.dataset.flash = '1';

        clearTimeout(counter.__flash);
        counter.__flash = setTimeout(() => {
          counter.dataset.flash = '0';
        }, 900);
      }

      return;
    }
  }

  function nodeMayMatter(node) {
    return node instanceof Element && (
      node.matches('ytmusic-player-bar, ytmusic-player-page, video, audio, tp-yt-paper-dialog, [role="dialog"]') ||
      node.querySelector('ytmusic-player-bar, ytmusic-player-page, video, audio, tp-yt-paper-dialog, [role="dialog"]')
    );
  }

  function observeRelevantChanges() {
    if (!document.body) return;

    const observer = new MutationObserver(mutations => {
      let controlsMayNeedRefresh = false;
      let mediaMayNeedHook = false;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!nodeMayMatter(node)) continue;

          if (
            node.matches?.('ytmusic-player-bar, ytmusic-player-page') ||
            node.querySelector?.('ytmusic-player-bar, ytmusic-player-page')
          ) {
            controlsMayNeedRefresh = true;
          }

          if (
            node.matches?.('video, audio') ||
            node.querySelector?.('video, audio')
          ) {
            mediaMayNeedHook = true;
          }

          if (
            node.matches?.('tp-yt-paper-dialog, [role="dialog"]') ||
            node.querySelector?.('tp-yt-paper-dialog, [role="dialog"]')
          ) {
            handlePausePrompt(node);
          }
        }
      }

      if (controlsMayNeedRefresh) {
        createControls();
        if (audioOnly) scheduleSongModeForCurrentTrack(false);
      }

      if (mediaMayNeedHook) {
        hookCurrentMedia();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function registerMenuCommands() {
    if (typeof GM_registerMenuCommand !== 'function') return;

    GM_registerMenuCommand('Toggle compact layout', () => {
      compactLayout = !compactLayout;
      localStorage.setItem(COMPACT_KEY, compactLayout ? '1' : '0');
      applyVisualPrefs();
    });

    GM_registerMenuCommand('Toggle slim scrollbars', () => {
      slimScrollbars = !slimScrollbars;
      localStorage.setItem(SCROLLBAR_KEY, slimScrollbars ? '1' : '0');
      applyVisualPrefs();
    });

    GM_registerMenuCommand('Toggle Audio Only', () => {
      audioOnly = !audioOnly;
      localStorage.setItem(AUDIO_KEY, audioOnly ? '1' : '0');

      lastAudioTrackKey = '';
      lastVideoRestoreKey = '';

      updateControls();

      if (audioOnly) {
        scheduleSongModeForCurrentTrack(true);
      } else {
        scheduleVideoRestoreForCurrentTrack(true);
      }
    });

    GM_registerMenuCommand('Toggle auto-continue listening', () => {
      antiPause = !antiPause;
      localStorage.setItem(ANTI_PAUSE_KEY, antiPause ? '1' : '0');
    });

    GM_registerMenuCommand('Toggle STOPS counter', () => {
      showCounter = !showCounter;
      localStorage.setItem(COUNTER_VIS_KEY, showCounter ? '1' : '0');
      applyVisualPrefs();
    });

    GM_registerMenuCommand('Toggle promo-banner hiding', () => {
      hidePromos = !hidePromos;
      localStorage.setItem(PROMO_KEY, hidePromos ? '1' : '0');
      applyVisualPrefs();
    });

    GM_registerMenuCommand('Reset STOPS counter', () => {
      stopCount = 0;
      localStorage.setItem(STOP_COUNT_KEY, '0');
      updateControls();
    });
  }

  installStyle();
  applyVisualPrefs();

  function start() {
    createControls();
    hookCurrentMedia();
    observeRelevantChanges();
    registerMenuCommands();

    if (audioOnly) {
      scheduleSongModeForCurrentTrack(true);
    }

    setInterval(() => {
      createControls();
      hookCurrentMedia();

      if (audioOnly) {
        scheduleSongModeForCurrentTrack(false);
      }

      if (antiPause) {
        handlePausePrompt(document);
      }
    }, 1000);

    window.addEventListener('yt-navigate-finish', () => {
      lastAudioTrackKey = '';
      lastVideoRestoreKey = '';

      setTimeout(() => {
        createControls();
        hookCurrentMedia();

        if (audioOnly) {
          scheduleSongModeForCurrentTrack(false);
        }
      }, 100);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
