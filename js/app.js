import { CONFIG } from "./config.js";
import { countdownParts, toGoogleCalendarUrl, toIcs } from "./lib.js";

function startCountdown() {
  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    minutes: document.getElementById("cd-minutes"),
    seconds: document.getElementById("cd-seconds"),
    grid: document.querySelector(".count-grid"),
    until: document.querySelector(".count-until"),
    done: document.querySelector(".count-done"),
  };
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    const p = countdownParts(Date.now(), CONFIG.party.startIso);
    if (p.done) {
      els.grid.hidden = true; els.until.hidden = true; els.done.hidden = false;
      clearInterval(timer);
      return;
    }
    els.days.textContent = pad(p.days);
    els.hours.textContent = pad(p.hours);
    els.minutes.textContent = pad(p.minutes);
    els.seconds.textContent = pad(p.seconds);
  }
  const timer = setInterval(tick, 1000);
  tick();
}

function setupDetails() {
  const p = CONFIG.party;
  document.getElementById("det-date").textContent = p.dateLabel;
  document.getElementById("det-time").textContent = p.timeLabel;
  document.getElementById("det-venue").textContent = p.venueName;
  document.getElementById("det-maps").href = p.mapsUrl;
  const event = {
    title: p.calendarTitle, startIso: p.startIso, endIso: p.endIso,
    location: p.venueName, description: p.calendarDescription,
  };
  document.getElementById("det-gcal").href = toGoogleCalendarUrl(event);
  const blob = new Blob([toIcs(event)], { type: "text/calendar" });
  document.getElementById("det-ics").href = URL.createObjectURL(blob);
}
setupDetails();

function setupPhotos() {
  const section = document.getElementById("photos");
  if (CONFIG.photos.length === 0) { section.hidden = true; return; }
  const grid = document.getElementById("photo-grid");
  for (const photo of CONFIG.photos) {
    const fig = document.createElement("figure");
    fig.className = "photo-card";
    const img = document.createElement("img");
    img.src = photo.src; img.alt = photo.caption ?? ""; img.loading = "lazy";
    const cap = document.createElement("figcaption");
    cap.textContent = photo.caption ?? "";
    fig.append(img, cap);
    grid.append(fig);
  }
}
setupPhotos();

startCountdown();
