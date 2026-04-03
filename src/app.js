import { buildBookmarkletCode, buildInjectUrl } from './lib/bookmarklet.js';

const injectUrl = buildInjectUrl(window.location.origin);
const bookmarkletCode = buildBookmarkletCode(injectUrl);

const bookmarkletLink = document.getElementById('bookmarklet-link');
const bookmarkletTextarea = document.getElementById('bookmarklet-code');
const injectUrlField = document.getElementById('inject-url');
const copyBookmarkletButton = document.getElementById('copy-bookmarklet');
const copyUrlButton = document.getElementById('copy-url');

bookmarkletLink.href = bookmarkletCode;
bookmarkletTextarea.value = bookmarkletCode;
injectUrlField.value = injectUrl;

copyBookmarkletButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(bookmarkletCode);
  copyBookmarkletButton.textContent = '복사됨';
  window.setTimeout(() => {
    copyBookmarkletButton.textContent = '북마클릿 복사';
  }, 1200);
});

copyUrlButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(injectUrl);
  copyUrlButton.textContent = '복사됨';
  window.setTimeout(() => {
    copyUrlButton.textContent = 'Inject URL 복사';
  }, 1200);
});
