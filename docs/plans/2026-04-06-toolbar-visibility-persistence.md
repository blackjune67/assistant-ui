# Toolbar Visibility Persistence

## Summary

This document describes the April 6, 2026 change that preserves the sidecar's closed state in the Tampermonkey userscript flow.

Before this change, the toolbar always reopened after a full page refresh or page navigation because the inject script always called `activate()` after reinjection. That behavior made it difficult for users to temporarily close the sidecar without it immediately returning on the next load.

## Problem

In the persistent userscript flow, the sidecar is injected again on every page load.

The previous behavior had one key issue:

- If the user clicked the toolbar close button, the toolbar stayed closed only until the current page lifecycle ended.
- After a refresh or navigation, the userscript injected the sidecar again and reopened it automatically.
- This made the close action feel temporary and unreliable for users who wanted the tool to stay out of the way for a while.

## What Changed

### 1. Added a dedicated toolbar visibility helper

File: `src/lib/toolbar-visibility.js`

This helper centralizes visibility persistence logic.

It now:

- Defines the storage key used for toolbar visibility state.
- Normalizes saved values to either `expanded` or `collapsed`.
- Reads the current preference safely.
- Writes the preference safely.
- Detects whether the rendered toolbar is visually expanded or collapsed.
- Watches toolbar class changes through a `MutationObserver` so UI state changes are persisted when the user opens or closes the toolbar.

### 2. Updated inject flow to respect saved visibility

File: `src/inject.js`

The inject script now:

- Uses `window.sessionStorage` as the persistence layer for the current browser tab.
- Checks the saved visibility preference before calling `activate()`.
- Calls `deactivate()` instead of `activate()` when the saved state is collapsed.
- Waits for the component to finish rendering before reading or binding toolbar visibility.
- Binds visibility persistence after the element is ready so future close/open actions are recorded.

This means the toolbar will no longer reopen automatically after refreshes or navigations in the same tab if the user previously closed it.

## Why `sessionStorage` Was Chosen

The goal of the fix was to support the "close it for now" use case without turning the toolbar off permanently across all future sessions.

`sessionStorage` was chosen because:

- It persists across refreshes and same-tab navigation.
- It matches the temporary nature of the user's intent.
- It avoids surprising users by keeping the toolbar hidden forever after the browser is fully closed and reopened.

If future requirements change, the same helper can be adapted to `localStorage`.

## Test Coverage

File: `tests/unit/toolbar-visibility.test.js`

New tests were added for:

- Default behavior when no preference exists.
- Skipping automatic activation when the saved state is collapsed.
- Ignoring invalid stored values and falling back to expanded.
- Graceful behavior when storage access throws.
- Persisting visibility changes when the rendered toolbar switches between expanded and collapsed states.

## Verification

The change was verified with:

- `npm test`
- `npm run build`

## Files Changed

- `src/inject.js`
- `src/lib/toolbar-visibility.js`
- `tests/unit/toolbar-visibility.test.js`
- `README.md`

## Result

Users can now close the sidecar in the Tampermonkey userscript flow and keep it closed across refreshes and page navigation within the same tab session.
