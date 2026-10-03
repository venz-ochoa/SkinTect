const API = import.meta.env.VITE_API_BASE_URL;
const originalFetch = window.fetch.bind(window);

window.fetch = (input, init = {}) => {
  const url = typeof input === "string" ? input : input?.url;
  const token = localStorage.getItem("token");
  if (token && API && url && url.startsWith(API)) {
    init = {
      ...init,
      headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
    };
  }
  return originalFetch(input, init);
};
