import { CONFIG } from "./config.js";
import { countdownParts } from "./lib.js";

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

startCountdown();
