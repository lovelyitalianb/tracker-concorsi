// == sw.js ==
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  clients.claim();
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "notifiche-concorsi") {
    event.waitUntil(verificaConcorsi());
  }
});

async function verificaConcorsi() {
  const data = await caches.open("concorsi");
  const response = await data.match("/concorsi");
  if (!response) return;

  const concorsi = await response.json();
  const now = new Date();

  concorsi.forEach((c) => {
    if (!c.lastChecked || c.checked === false) {
      self.registration.showNotification("Puoi partecipare di nuovo a: " + c.nome);
    } else {
      const last = new Date(c.lastChecked);
      const diff = now - last;
      const ore = diff / 1000 / 60 / 60;
      const scaduto =
        (c.frequenza === "hourly" && ore >= 1) ||
        (c.frequenza === "daily" && ore >= 24) ||
        (c.frequenza === "weekly" && ore >= 168);
      if (scaduto) {
        self.registration.showNotification("Puoi partecipare di nuovo a: " + c.nome);
      }
    }
  });
}
