import { buildBookmarkletCode, buildInjectUrl, buildUserscriptCode } from './lib/bookmarklet.js';

const injectUrl = buildInjectUrl(window.location.origin);
const bookmarkletCode = buildBookmarkletCode(injectUrl);
const userscriptCode = buildUserscriptCode(injectUrl);

const bookmarkletLink = document.getElementById('bookmarklet-link');
const bookmarkletTextarea = document.getElementById('bookmarklet-code');
const userscriptTextarea = document.getElementById('userscript-code');
const injectUrlField = document.getElementById('inject-url');
const copyBookmarkletButton = document.getElementById('copy-bookmarklet');
const copyUserscriptButton = document.getElementById('copy-userscript');
const copyUrlButton = document.getElementById('copy-url');
const downloadUserscriptLink = document.getElementById('download-userscript');

function wireCopyButton(button, text, idleLabel) {
  button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(text);
    button.textContent = '복사됨';

    window.setTimeout(() => {
      button.textContent = idleLabel;
    }, 1200);
  });
}

bookmarkletLink.href = bookmarkletCode;
bookmarkletTextarea.value = bookmarkletCode;
userscriptTextarea.value = userscriptCode;
injectUrlField.value = injectUrl;

wireCopyButton(copyBookmarkletButton, bookmarkletCode, '북마클릿 복사');
wireCopyButton(copyUserscriptButton, userscriptCode, 'Userscript 복사');
wireCopyButton(copyUrlButton, injectUrl, 'Inject URL 복사');

const userscriptBlob = new Blob([userscriptCode], { type: 'text/javascript;charset=utf-8' });
downloadUserscriptLink.href = URL.createObjectURL(userscriptBlob);
