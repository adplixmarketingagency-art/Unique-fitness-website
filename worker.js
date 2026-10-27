export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const canonicalRedirects = {
      "/index.html": "/",
      "/about/index.html": "/about/",
      "/bmi/index.html": "/bmi/",
      "/contact/index.html": "/contact/",
      "/services/index.html": "/services/",
      "/blog/index.html": "/blog/",
      "/blog/post.html": "/blog/post"
    };
    const target = canonicalRedirects[url.pathname];

    if (target) {
      url.pathname = target;
      url.search = "";
      return Response.redirect(url, 301);
    }

    return env.ASSETS.fetch(request);
  }
};
