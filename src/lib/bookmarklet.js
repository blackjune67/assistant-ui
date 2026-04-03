export function buildInjectUrl(origin) {
  return new URL('/inject.js', origin).href;
}

export function buildBookmarkletCode(injectUrl) {
  return (
    "javascript:(function(){var d=document;var s=d.getElementById('__agent-ui-sidecar-loader__');if(s){s.remove();}" +
    "s=d.createElement('script');s.id='__agent-ui-sidecar-loader__';s.type='module';s.src='" +
    injectUrl +
    "?t='+Date.now();d.head.appendChild(s);}())"
  );
}
