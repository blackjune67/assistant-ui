import 'agent-ui-annotation';
import { buildPageContext } from './lib/context.js';

const TOOLBAR_ID = 'agent-ui-annotation-sidecar';

function ensureToolbar() {
  let toolbar = document.getElementById(TOOLBAR_ID);

  if (toolbar) {
    return toolbar;
  }

  toolbar = document.createElement('agent-ui-annotation');
  toolbar.id = TOOLBAR_ID;
  toolbar.setAttribute('theme', 'auto');
  toolbar.setAttribute('output-level', 'standard');
  toolbar.setAttribute('annotation-color', '#2563eb');
  document.body.appendChild(toolbar);

  return toolbar;
}

async function activateToolbar() {
  await customElements.whenDefined('agent-ui-annotation');

  const toolbar = ensureToolbar();

  if (typeof toolbar.setBeforeCreateHook === 'function') {
    toolbar.setBeforeCreateHook(() => ({
      context: buildPageContext({
        pathname: window.location.pathname,
        href: window.location.href,
        title: document.title
      })
    }));
  }

  if (typeof toolbar.activate === 'function') {
    toolbar.activate();
  }

  window.__agentUiAnnotationSidecar = toolbar;
  console.info('[agent-ui-sidecar] annotation toolbar injected');
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      activateToolbar().catch((error) => {
        console.error('[agent-ui-sidecar] failed to activate', error);
      });
    },
    { once: true }
  );
} else {
  activateToolbar().catch((error) => {
    console.error('[agent-ui-sidecar] failed to activate', error);
  });
}
