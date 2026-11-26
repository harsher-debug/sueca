export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // The wildcard is required for /skf?utm_*. Similar prefixes belong to origin.
    if (url.pathname !== '/skf' && !url.pathname.startsWith('/skf/')) return fetch(request);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    if (url.pathname === '/skf/' || url.pathname === '/skf/index.html') {
      url.pathname = '/skf';
      return Response.redirect(url.href, 308);
    }
    if (url.pathname === '/skf') url.pathname = '/skf/index.html';
    const response = await env.ASSETS.fetch(new Request(url, request));
    const headers = new Headers(response.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    if (url.pathname === '/skf/index.html') headers.set('Link', '<https://sueca.com.br/skf>; rel="canonical"');
    if (response.status === 404) headers.set('X-Robots-Tag', 'noindex');
    return new Response(request.method === 'HEAD' ? null : response.body, { status: response.status, headers });
  }
};
