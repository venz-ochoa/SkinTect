const API = import.meta.env.VITE_API_BASE_URL;
const originalFetch = window.fetch.bind(window);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

window.fetch = async (input, init = {}) => {
  const url = typeof input === "string" ? input : input?.url;
  const isApi = API && url && url.startsWith(API);
  if (!isApi) return originalFetch(input, init);

  const token = localStorage.getItem("token");
  if (token) {
    init = {
      ...init,
      headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
    };
  }

  //retry while the free Render server wakes up (network failure or 502/503/504)
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await originalFetch(input, init);
      if ([502, 503, 504].includes(res.status) && attempt < 3) {
        await wait(4000);
        continue;
      }
      return res;
    } catch (err) {
      if (attempt >= 3) throw err;
      await wait(4000);
    }
  }
};
