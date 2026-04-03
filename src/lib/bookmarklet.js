const LOADER_ID = '__agent-ui-sidecar-loader__';

function buildLoaderStatements(injectUrl) {
  return [
    "var d=document;",
    `var s=d.getElementById('${LOADER_ID}');`,
    'if(s){s.remove();}',
    "s=d.createElement('script');",
    `s.id='${LOADER_ID}';`,
    "s.type='module';",
    `s.src='${injectUrl}?t='+Date.now();`,
    '(d.head||d.documentElement).appendChild(s);'
  ].join('');
}

export function buildInjectUrl(origin) {
  return new URL('/inject.js', origin).href;
}

export function buildBookmarkletCode(injectUrl) {
  return `javascript:(function(){${buildLoaderStatements(injectUrl)}}())`;
}

export function buildUserscriptCode(injectUrl) {
  const { origin } = new URL(injectUrl);

  return `// ==UserScript==
// @name         Agent UI Sidecar
// @namespace    https://agent-ui-sidecar.local
// @version      1.0.0
// @description  Re-inject the Agent UI annotation toolbar after every page load.
// @match        http://*/*
// @match        https://*/*
// @exclude      ${origin}/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  var injectUrl = '${injectUrl}';
  var loaderId = '${LOADER_ID}';

  function injectSidecar() {
    var d = document;
    var s = d.getElementById(loaderId);

    if (s) {
      s.remove();
    }

    s = d.createElement('script');
    s.id = loaderId;
    s.type = 'module';
    s.src = injectUrl + '?t=' + Date.now();
    (d.head || d.documentElement).appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSidecar, { once: true });
    return;
  }

  injectSidecar();
}());
`;
}
