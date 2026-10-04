/* 말의 구원 — 워크북 서비스 워커
   앱 본문(index.html)은 언제나 인터넷에서 먼저 받아 오고, 끊겼을 때만 저장해 둔 것을 씁니다.
   그래서 새 index.html을 올리면, 성도들은 다음에 열 때 바로 새 내용을 받습니다.
   서체 · 아이콘처럼 바뀌지 않는 파일은 저장해 둔 것을 먼저 씁니다.
   서체나 아이콘 파일을 바꿀 때만 아래 CACHE 이름의 숫자를 올리세요. */
const CACHE = "deepspring-v1";
const CORE = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png", "./icons/favicon-64.png",
  "./fonts/DeepspringSans-400.woff2", "./fonts/DeepspringSans-600.woff2", "./fonts/GowunBatang-400.woff2", "./fonts/GowunBatang-700.woff2"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const url = new URL(r.url);
  if (url.origin !== location.origin) return;
  const isPage = r.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("/index.html");
  if (isPage) {
    e.respondWith(
      fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); } return res; })
        .catch(() => caches.match("./index.html").then(m => m || caches.match("./")))
    );
    return;
  }
  e.respondWith(
    caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; }))
  );
});
