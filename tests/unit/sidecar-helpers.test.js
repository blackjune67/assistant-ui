import { describe, expect, it } from 'vitest';
import { buildBookmarkletCode, buildInjectUrl } from '../../src/lib/bookmarklet.js';
import { buildPageContext } from '../../src/lib/context.js';

describe('bookmarklet helpers', () => {
  it('builds the inject endpoint from the sidecar origin', () => {
    expect(buildInjectUrl('http://127.0.0.1:4174')).toBe('http://127.0.0.1:4174/inject.js');
  });

  it('builds a bookmarklet that injects the module script with cache busting', () => {
    const bookmarkletCode = buildBookmarkletCode('http://127.0.0.1:4174/inject.js');

    expect(bookmarkletCode.startsWith('javascript:(function(){')).toBe(true);
    expect(bookmarkletCode).toContain("__agent-ui-sidecar-loader__");
    expect(bookmarkletCode).toContain("type='module'");
    expect(bookmarkletCode).toContain("http://127.0.0.1:4174/inject.js?t='+Date.now()");
  });
});

describe('page context', () => {
  it('builds generic annotation context from the current page state', () => {
    expect(
      buildPageContext({
        pathname: '/admin/tickets/list',
        href: 'http://127.0.0.1:8080/admin/tickets/list?page=2',
        title: 'Ticket List',
        timestamp: '2026-04-03T00:00:00.000Z'
      })
    ).toEqual({
      route: '/admin/tickets/list',
      url: 'http://127.0.0.1:8080/admin/tickets/list?page=2',
      title: 'Ticket List',
      timestamp: '2026-04-03T00:00:00.000Z'
    });
  });
});
