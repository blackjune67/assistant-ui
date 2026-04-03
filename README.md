# Agent UI Sidecar

This project injects `agent-ui-annotation` into any locally opened page without modifying the target project itself.

The original bookmarklet flow still exists for one-shot injection, but the preferred path is now a persistent
userscript install. A userscript can re-inject the sidecar after every page refresh, which a bookmarklet or console
paste cannot do by themselves.

## Requirements

- Node.js 20 or newer
- A browser that can run bookmarklets
- Tampermonkey or Violentmonkey for persistent auto-reload injection

## Local run

```bash
cd ..\agent-ui-sidecar
npm install
npm run dev
```

Open `http://127.0.0.1:4174` after the dev server starts.

## Recommended flow: persistent userscript

1. Install Tampermonkey or Violentmonkey in your browser.
2. Open the sidecar page and copy or download the generated userscript.
3. Create a new userscript in the extension and paste the generated code.
4. Keep `npm run dev` running.
5. Refresh your target page. The sidecar should reappear automatically on every full reload.

## Optional flow: one-shot bookmarklet

1. Copy the bookmarklet code from the sidecar page.
2. Paste it into the browser console or save it as a bookmarklet.
3. Run it on the target page when you need a temporary injection.

This flow is convenient for quick tests, but it resets after a full page reload.

## Notes

- This tool is intended for local development environments.
- The injected annotation context still includes `route`, `url`, `title`, and `timestamp`.
- Pages with a strict CSP can block module script injection, which prevents the toolbar from loading.

## Credit

- made by hajune
