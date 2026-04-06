export const TOOLBAR_VISIBILITY_KEY = 'agent-ui-sidecar.toolbarVisibility';

function normalizeToolbarVisibility(value) {
  return value === 'collapsed' ? 'collapsed' : 'expanded';
}

function getRenderedToolbar(toolbar) {
  return (
    toolbar?.shadowRoot?.querySelector?.('[data-annotation-toolbar]') ??
    toolbar?.querySelector?.('[data-annotation-toolbar]') ??
    null
  );
}

export function getStoredToolbarVisibility(storage) {
  try {
    return normalizeToolbarVisibility(storage?.getItem?.(TOOLBAR_VISIBILITY_KEY));
  } catch {
    return 'expanded';
  }
}

export function setStoredToolbarVisibility(storage, visibility) {
  try {
    storage?.setItem?.(TOOLBAR_VISIBILITY_KEY, normalizeToolbarVisibility(visibility));
  } catch {
    // Ignore storage failures so injection still works in restricted pages.
  }
}

export function isToolbarExpanded(toolbar) {
  const renderedToolbar = getRenderedToolbar(toolbar);

  if (!renderedToolbar) {
    return true;
  }

  return !renderedToolbar.classList?.contains?.('collapsed');
}

export function applyStoredToolbarVisibility(toolbar, storage) {
  const visibility = getStoredToolbarVisibility(storage);

  if (visibility === 'collapsed') {
    toolbar?.deactivate?.();
    return visibility;
  }

  toolbar?.activate?.();
  return visibility;
}

export function watchToolbarVisibility(toolbar, storage) {
  const renderedToolbar = getRenderedToolbar(toolbar);

  if (!renderedToolbar || typeof MutationObserver !== 'function') {
    return {
      observer: null,
      disconnect() {}
    };
  }

  const persistVisibility = () => {
    setStoredToolbarVisibility(storage, isToolbarExpanded(toolbar) ? 'expanded' : 'collapsed');
  };

  const observer = new MutationObserver(() => {
    persistVisibility();
  });

  observer.observe(renderedToolbar, {
    attributes: true,
    attributeFilter: ['class']
  });

  persistVisibility();

  return {
    observer,
    disconnect() {
      observer.disconnect();
    }
  };
}

export async function waitForRenderedToolbar(toolbar, options = {}) {
  const { attempts = 10, delayMs = 16 } = options;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const renderedToolbar = getRenderedToolbar(toolbar);

    if (renderedToolbar) {
      return renderedToolbar;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }

  return null;
}
