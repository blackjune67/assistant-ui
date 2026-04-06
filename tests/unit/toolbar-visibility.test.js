import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TOOLBAR_VISIBILITY_KEY,
  applyStoredToolbarVisibility,
  getStoredToolbarVisibility,
  isToolbarExpanded,
  setStoredToolbarVisibility,
  waitForRenderedToolbar,
  watchToolbarVisibility
} from '../../src/lib/toolbar-visibility.js';

function createStorage(initialValue) {
  const values = new Map();

  if (initialValue !== undefined) {
    values.set(TOOLBAR_VISIBILITY_KEY, initialValue);
  }

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    }
  };
}

describe('toolbar visibility persistence', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to expanded when no preference exists', () => {
    const storage = createStorage();

    expect(getStoredToolbarVisibility(storage)).toBe('expanded');
  });

  it('skips automatic activation when the saved state is collapsed', () => {
    const storage = createStorage('collapsed');
    const toolbar = {
      activate: vi.fn(),
      deactivate: vi.fn()
    };

    expect(applyStoredToolbarVisibility(toolbar, storage)).toBe('collapsed');
    expect(toolbar.deactivate).toHaveBeenCalledTimes(1);
    expect(toolbar.activate).not.toHaveBeenCalled();
  });

  it('ignores invalid stored values and falls back to expanded', () => {
    const storage = createStorage('not-valid');
    const toolbar = {
      activate: vi.fn(),
      deactivate: vi.fn()
    };

    expect(getStoredToolbarVisibility(storage)).toBe('expanded');
    expect(applyStoredToolbarVisibility(toolbar, storage)).toBe('expanded');
    expect(toolbar.activate).toHaveBeenCalledTimes(1);
    expect(toolbar.deactivate).not.toHaveBeenCalled();
  });

  it('handles storage access failures gracefully', () => {
    const storage = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      }
    };

    expect(getStoredToolbarVisibility(storage)).toBe('expanded');
    expect(() => setStoredToolbarVisibility(storage, 'collapsed')).not.toThrow();
  });

  it('detects whether the rendered toolbar is expanded or collapsed', () => {
    const collapsedToolbar = {
      shadowRoot: {
        querySelector() {
          return {
            classList: {
              contains(className) {
                return className === 'collapsed';
              }
            }
          };
        }
      }
    };
    const expandedToolbar = {
      shadowRoot: {
        querySelector() {
          return {
            classList: {
              contains() {
                return false;
              }
            }
          };
        }
      }
    };

    expect(isToolbarExpanded(collapsedToolbar)).toBe(false);
    expect(isToolbarExpanded(expandedToolbar)).toBe(true);
  });

  it('persists visibility changes when the rendered toolbar class changes', () => {
    const storage = createStorage();
    const renderedToolbar = {
      classList: {
        contains(className) {
          return className === 'collapsed';
        }
      }
    };
    const toolbar = {
      shadowRoot: {
        querySelector() {
          return renderedToolbar;
        }
      }
    };

    class FakeMutationObserver {
      constructor(callback) {
        this.callback = callback;
      }

      observe() {}

      disconnect() {}
    }

    vi.stubGlobal('MutationObserver', FakeMutationObserver);
    const disconnect = watchToolbarVisibility(toolbar, storage);

    disconnect.observer.callback();

    expect(storage.getItem(TOOLBAR_VISIBILITY_KEY)).toBe('collapsed');
  });

  it('waits for the toolbar to finish rendering before binding persistence', async () => {
    let calls = 0;
    const renderedToolbar = {
      classList: {
        contains() {
          return false;
        }
      }
    };
    const toolbar = {
      shadowRoot: {
        querySelector() {
          calls += 1;
          return calls >= 3 ? renderedToolbar : null;
        }
      }
    };

    const result = await waitForRenderedToolbar(toolbar, { attempts: 4, delayMs: 0 });

    expect(result).toBe(renderedToolbar);
  });
});
