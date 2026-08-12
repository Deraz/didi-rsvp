import { CONFIG } from "./config.js";

const gate = document.getElementById("gate");
const dash = document.getElementById("dash");
const gateMsg = document.getElementById("gate-msg");
const dashMsg = document.getElementById("dash-msg");

async function fetchRows(password) {
  const url = `${CONFIG.appsScriptUrl}?action=list&password=${encodeURIComponent(password)}`;
  const res = await fetch(url);
  const data = await res.json();
  // Defensive: blank sheet rows (owner cleared cells) can still come back from
  // the live script until it's redeployed with the matching server-side filter.
  if (data.ok) data.rows = data.rows.filter((r) => String(r.name).trim());
  return data;
}

// Latest entry per (case-insensitive, trimmed) name wins — families may
// re-submit to correct a mistake, so totals must not double-count.
function dedupeLatest(rows) {
  const byName = new Map();
  for (const row of rows) byName.set(String(row.name).trim().toLowerCase(), row);
  return [...byName.values()];
}

function render(rows) {
  const newestFirst = [...rows].reverse();
  const latest = dedupeLatest(rows);
  const yes = latest.filter((r) => r.attending === "Yes");
  document.getElementById("st-families").textContent = latest.length;
  document.getElementById("st-yes").textContent = yes.length;
  document.getElementById("st-no").textContent = latest.length - yes.length;
  document.getElementById("st-adults").textContent = yes.reduce((n, r) => n + Number(r.adults || 0), 0);
  document.getElementById("st-kids").textContent = yes.reduce((n, r) => n + Number(r.kids || 0), 0);

  const tbody = document.getElementById("rsvp-rows");
  tbody.textContent = "";
  for (const r of newestFirst) {
    const tr = document.createElement("tr");
    const when = new Date(r.timestamp).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
    for (const cell of [when, r.name, r.attending, r.adults, r.kids, r.wish]) {
      const td = document.createElement("td");
      td.textContent = cell ?? "";
      tr.append(td);
    }
    tbody.append(tr);
  }

  const wishes = document.getElementById("wishes");
  wishes.textContent = "";
  for (const r of newestFirst.filter((r) => String(r.wish).trim())) {
    const card = document.createElement("blockquote");
    card.className = "wish-card";
    card.textContent = `“${r.wish}” — ${r.name}`;
    wishes.append(card);
  }
}

async function unlock(password) {
  gateMsg.textContent = "checking… ☀️";
  try {
    const data = await fetchRows(password);
    if (!data.ok) {
      gateMsg.textContent = "That’s not the magic word! 🙈";
      gate.querySelector("form").classList.add("shake");
      setTimeout(() => gate.querySelector("form").classList.remove("shake"), 500);
      sessionStorage.removeItem("didi-pass");
      return;
    }
    sessionStorage.setItem("didi-pass", password);
    gate.hidden = true;
    dash.hidden = false;
    render(data.rows);
  } catch {
    gateMsg.textContent = "Couldn’t reach the sunshine servers — try again ☁️";
  }
}

document.getElementById("gate-form").addEventListener("submit", (e) => {
  e.preventDefault();
  unlock(document.getElementById("gate-pass").value);
});
document.getElementById("refresh").addEventListener("click", async () => {
  try {
    const data = await fetchRows(sessionStorage.getItem("didi-pass") ?? "");
    if (data.ok) {
      render(data.rows);
      dashMsg.textContent = "";
    } else {
      dashMsg.textContent = "Hmm, that didn’t refresh — try again in a moment ☁️";
    }
  } catch {
    dashMsg.textContent = "Couldn’t reach the sunshine servers — try again ☁️";
  }
});
const saved = sessionStorage.getItem("didi-pass");
if (saved) unlock(saved);
