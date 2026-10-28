# Maya Music — Licensed Music Edition

**Black-and-white music player • Developed by Dhanush**

## Included
- Online track search via Free To Use's public royalty-free music API
- In-page audio playback: play/pause, previous/next, seek, volume, shuffle, repeat
- Likes and playlists saved in the browser
- Local audio file playback
- Media Session/background playback support where the browser/device permits it
- No API key required for public search, subject to provider availability and terms
- Free static hosting guide

## Music rights and provider
This build uses the Free To Use public API (`https://api.freetouse.com/v3`) for royalty-free music. Read the current licence: https://freetouse.com/license . Free use is subject to provider conditions; commercial use may require a paid licence. This is not a source for every commercial chart song, film soundtrack, or Spotify track. Provider endpoints, quotas, CORS behaviour or terms can change; check https://freetouse.com/api if search fails.

## Free Netlify hosting
1. Extract this ZIP.
2. Open https://app.netlify.com/drop
3. Drag the extracted `Maya_Music_Live` folder (containing `index.html`, `app.js`, and `styles.css`) into Netlify Drop.
4. Open the generated `netlify.app` URL and test Search.
5. Keep this ZIP as your update source.

## Run locally
Open `index.html` in a modern browser. Some browsers restrict API requests from `file://`; if search fails locally, deploy to HTTPS or use a local static server.

## Background playback
The player and Media Session API are enabled. Playback can continue in supported mobile browsers when a tab is in the background, but behaviour depends on browser/device settings. It cannot be guaranteed after force-closing the browser.

## Privacy and limitations
- No accounts or cloud sync; playlists and likes are stored in this browser only.
- Local files are played locally and are not uploaded.
- Follow each track's licence and attribution requirements.
- Spotify credentials are not used. Never expose a Spotify Client Secret in frontend files.
