(function () {
  const localHosts = new Set(["localhost", "127.0.0.1"]);
  const configuredBase =
    window.API_BASE_URL ||
    "https://YOUR-BACKEND-URL.onrender.com";

  const normalizedBase = configuredBase.replace(/\/+$/, "");
  const useSameOrigin = localHosts.has(window.location.hostname);

  window.API_BASE_URL = useSameOrigin ? "" : normalizedBase;

  window.apiUrl = function apiUrl(path) {
    if (!path) {
      return window.API_BASE_URL || "";
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const normalizedPath = path.startsWith("/") ? path : "/" + path;
    return `${window.API_BASE_URL}${normalizedPath}`;
  };

  window.hasConfiguredApi = function hasConfiguredApi() {
    return useSameOrigin || Boolean(window.API_BASE_URL);
  };

  if (!window.hasConfiguredApi() || /YOUR-BACKEND-URL/.test(window.API_BASE_URL)) {
    console.warn(
      "API base URL is not configured. Set window.API_BASE_URL in client/api.js before deploying the frontend to Netlify."
    );
  }
})();
