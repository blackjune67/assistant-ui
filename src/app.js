import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';
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
wireCopyButton(copyUserscriptButton, userscriptCode, '사용자스크립트 복사');
wireCopyButton(copyUrlButton, injectUrl, 'Inject URL 복사');

const userscriptBlob = new Blob([userscriptCode], { type: 'text/javascript;charset=utf-8' });
downloadUserscriptLink.href = URL.createObjectURL(userscriptBlob);

// --- Hero canvas: typewriter animation via @chenglou/pretext ---
async function initHeroCanvas() {
  await document.fonts.ready;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d');
  const TEXT = 'AI가 UI 구조를 쉽게 해석하고 효율적으로 수정할 수 있도록 돕는 도구입니다.';
  const LINE_HEIGHT_RATIO = 1.35;
  const CHAR_DELAY_MS = 38;

  let lines = [];
  let fontSize = 32;
  let lineHeight = Math.round(fontSize * LINE_HEIGHT_RATIO);
  let containerWidth = 0;
  let canvasHeight = 0;

  function getFontSize(w) {
    return Math.round(Math.min(36, Math.max(22, w * 0.034)));
  }

  function recompute() {
    const w = canvas.parentElement.clientWidth;
    const fs = getFontSize(w);
    if (w === containerWidth && fs === fontSize) return;
    containerWidth = w;
    fontSize = fs;
    lineHeight = Math.round(fontSize * LINE_HEIGHT_RATIO);

    const prepared = prepareWithSegments(TEXT, `700 ${fontSize}px Inter`);
    const result = layoutWithLines(prepared, w, lineHeight);
    lines = result.lines;

    canvasHeight = result.height + 8;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = canvasHeight + 'px';
  }

  recompute();

  const ro = new ResizeObserver(() => recompute());
  ro.observe(canvas.parentElement);

  const startTime = performance.now();

  function draw() {
    const elapsed = performance.now() - startTime;
    const totalChars = Math.min(Math.floor(elapsed / CHAR_DELAY_MS), TEXT.length);
    const isComplete = totalChars >= TEXT.length;
    const fontStr = `700 ${fontSize}px Inter`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, containerWidth, canvasHeight);
    ctx.font = fontStr;
    ctx.textBaseline = 'alphabetic';

    let rendered = 0;
    let cursorX = 0;
    let cursorY = 0;
    let isTyping = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const y = i * lineHeight + lineHeight * 0.82;
      const charsLeft = totalChars - rendered;

      if (charsLeft <= 0) break;

      const slice = line.text.slice(0, charsLeft);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(slice, 0, y);

      if (charsLeft < line.text.length) {
        isTyping = true;
        cursorX = ctx.measureText(slice).width;
        cursorY = y;
        break;
      }

      rendered += line.text.length;
    }

    // cursor
    const cursorVisible = Math.floor(elapsed / 500) % 2 === 0;
    if (isTyping || (isComplete && cursorVisible)) {
      ctx.fillStyle = '#22c55e';
      if (isTyping) {
        ctx.fillRect(cursorX + 2, cursorY - lineHeight * 0.77, 2.5, lineHeight * 0.88);
      } else {
        const last = lines[lines.length - 1];
        const lastX = ctx.measureText(last.text).width;
        const lastY = (lines.length - 1) * lineHeight + lineHeight * 0.82;
        ctx.fillRect(lastX + 2, lastY - lineHeight * 0.77, 2.5, lineHeight * 0.88);
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

initHeroCanvas();

// --- Background dot grid: spring-repel + constellation lines ---
function initParticleBg() {
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '0',
  });
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const SPACING = 62;
  const REPEL_RADIUS = 170;
  const REPEL_STRENGTH = 58;
  const CONNECT_DIST = 95;

  let W = 0, H = 0, dots = [];
  const mouse = { x: -9999, y: -9999 };

  function rebuild() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const cols = Math.ceil(W / SPACING) + 1;
    const rows = Math.ceil(H / SPACING) + 1;
    const ox = (W - (cols - 1) * SPACING) / 2;
    const oy = (H - (rows - 1) * SPACING) / 2;
    dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = ox + c * SPACING, y = oy + r * SPACING;
        dots.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
      }
    }
  }

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('resize', rebuild);
  rebuild();

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const nearby = [];

    for (const d of dots) {
      const dx = d.ox - mouse.x, dy = d.oy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let tx = d.ox, ty = d.oy;

      if (dist < REPEL_RADIUS && dist > 0) {
        const force = Math.pow(1 - dist / REPEL_RADIUS, 1.6) * REPEL_STRENGTH;
        tx = d.ox + (dx / dist) * force;
        ty = d.oy + (dy / dist) * force;
        nearby.push(d);
      }

      d.vx += (tx - d.x) * 0.17;
      d.vy += (ty - d.y) * 0.17;
      d.vx *= 0.7;
      d.vy *= 0.7;
      d.x += d.vx;
      d.y += d.vy;
    }

    // constellation lines between nearby displaced dots
    for (let i = 0; i < nearby.length; i++) {
      for (let j = i + 1; j < nearby.length; j++) {
        const a = nearby[i], b = nearby[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < CONNECT_DIST * CONNECT_DIST) {
          const alpha = (1 - Math.sqrt(d2) / CONNECT_DIST) * 0.45;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(34,197,94,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // dots
    for (const d of dots) {
      const dx = d.ox - mouse.x, dy = d.oy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const prox = Math.max(0, 1 - dist / REPEL_RADIUS);
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.3 + prox * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = prox > 0.04
        ? `rgba(34,197,94,${0.2 + prox * 0.7})`
        : `rgba(71,85,105,0.35)`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

// --- Panel 3D tilt on hover ---
function initPanelTilt() {
  document.querySelectorAll('.panel').forEach(panel => {
    let raf;
    panel.addEventListener('mousemove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = panel.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        panel.style.transform = `perspective(900px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) scale(1.015)`;
        panel.style.boxShadow = `0 2px 6px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.4), ${dx * -6}px ${dy * -6}px 24px rgba(34,197,94,0.07)`;
      });
    });
    panel.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      panel.style.transform = '';
      panel.style.boxShadow = '';
    });
  });
}

initParticleBg();
initPanelTilt();
