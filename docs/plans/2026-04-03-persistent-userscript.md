# Persistent Userscript Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a persistent userscript install flow so the annotation toolbar is automatically re-injected after page refreshes.

**Architecture:** Keep the existing `inject.js` loader as the single runtime entrypoint and add a generated userscript string that re-attaches that loader on every page load. Expose the generated userscript in the UI alongside the existing bookmarklet so users can choose one-shot or persistent injection.

**Tech Stack:** Vite, vanilla JavaScript, Vitest

---

### Task 1: Lock the userscript contract with tests

**Files:**
- Modify: `tests/unit/sidecar-helpers.test.js`

**Step 1: Write the failing test**

Add a test that expects the generated userscript to:
- include a Tampermonkey/Violentmonkey metadata block
- target `http` and `https` pages
- exclude the sidecar origin
- inject `/inject.js` with cache busting

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because `buildUserscriptCode` does not exist yet.

**Step 3: Write minimal implementation**

Add `buildUserscriptCode()` in the bookmarklet helper module using the existing loader behavior.

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for the new helper tests.

### Task 2: Expose the persistent install flow

**Files:**
- Modify: `src/app.js`
- Modify: `index.html`

**Step 1: Add UI wiring**

Populate a userscript textarea, copy button, and download link from the generated userscript code.

**Step 2: Keep existing bookmarklet path intact**

Retain the current bookmarklet and inject URL actions for one-shot usage.

**Step 3: Verify app wiring**

Run: `npm test`
Expected: PASS with helper tests still green.

### Task 3: Document the new preferred workflow

**Files:**
- Modify: `README.md`

**Step 1: Update usage**

Document that bookmarklet is temporary, while the userscript survives reloads by re-injecting on each page load.

**Step 2: Final verification**

Run: `npm test`
Run: `npm run build`
Expected: Both commands succeed.
