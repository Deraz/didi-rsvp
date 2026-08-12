import { CONFIG } from "./config.js";
import { countdownParts, toGoogleCalendarUrl, toIcs, validateRsvp } from "./lib.js";

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

function setupRsvp() {
  const form = document.getElementById("rsvp-form");
  const counts = document.getElementById("rsvp-counts");
  const msg = document.getElementById("rsvp-msg");
  const done = document.getElementById("rsvp-done");

  form.addEventListener("change", () => {
    const attending = form.elements.attending.value;
    counts.hidden = attending !== "yes";
  });

  for (const btn of form.querySelectorAll(".step-btn")) {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      const next = Number(input.value || 0) + Number(btn.dataset.step);
      input.value = Math.min(Number(input.max), Math.max(Number(input.min), next));
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    const result = validateRsvp({
      name: form.elements.name.value,
      attending: form.elements.attending.value,
      adults: form.elements.adults.value,
      kids: form.elements.kids.value,
      wish: form.elements.wish.value,
    });
    if (!result.ok) { msg.textContent = result.error; return; }
    if (!CONFIG.appsScriptUrl) {
      msg.textContent = "RSVP isn’t open quite yet — try again soon! ☁️";
      return;
    }
    const submitBtn = form.querySelector(".btn-submit");
    submitBtn.disabled = true;
    msg.textContent = "Sending sunshine… ☀️";
    try {
      const res = await fetch(CONFIG.appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(result.value),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "server said no");
      form.hidden = true;
      done.hidden = false;
      done.querySelector(result.value.attending === "yes" ? ".done-yes" : ".done-no").hidden = false;
      burstConfetti();
    } catch {
      msg.textContent = "Oops — the sun hid for a second. Please try again! 🌥️ (Already tried? No worries — we only count your latest answer.)";
      submitBtn.disabled = false;
    }
  });
}

function burstConfetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#FFC93C", "#E8842C", "#E85D8A", "#A99BE0", "#FFFFFF"];
  for (let i = 0; i < 90; i++) {
    const bit = document.createElement("span");
    bit.className = "confetti";
    bit.style.left = `${Math.random() * 100}vw`;
    bit.style.background = colors[i % colors.length];
    bit.style.animationDelay = `${Math.random() * 0.4}s`;
    bit.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    bit.style.setProperty("--drift", `${(Math.random() - 0.5) * 40}vw`);
    document.body.append(bit);
    setTimeout(() => bit.remove(), 4000);
  }
}
setupRsvp();

startCountdown();
