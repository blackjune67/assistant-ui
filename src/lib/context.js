export function buildPageContext({ pathname, href, title, timestamp = new Date().toISOString() }) {
  return {
    route: pathname,
    url: href,
    title,
    timestamp
  };
}
