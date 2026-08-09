// Pure logic only — no DOM, no fetch, no Date.now(). Testable in Node.

export function countdownParts(nowMs, targetIso) {
  const diff = Date.parse(targetIso) - nowMs;
  if (diff <= 0) return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSeconds = Math.floor(diff / 1000);
  return {
    done: false,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function isoToUtcBasic(iso) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function toGoogleCalendarUrl({ title, startIso, endIso, location, description }) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${isoToUtcBasic(startIso)}/${isoToUtcBasic(endIso)}`,
    location,
    details: description,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function icsEscape(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function toIcs({ title, startIso, endIso, location, description }) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//didi-rsvp//EN",
    "BEGIN:VEVENT",
    `UID:didi-rsvp-${isoToUtcBasic(startIso)}@didi-rsvp`,
    `DTSTAMP:${isoToUtcBasic(startIso)}`,
    `DTSTART:${isoToUtcBasic(startIso)}`,
    `DTEND:${isoToUtcBasic(endIso)}`,
    `SUMMARY:${icsEscape(title)}`,
    `LOCATION:${icsEscape(location)}`,
    `DESCRIPTION:${icsEscape(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n") + "\r\n";
}

export function validateRsvp(input) {
  const name = String(input.name ?? "").trim();
  const attending = input.attending;
  const wish = String(input.wish ?? "").trim();
  if (!name) return { ok: false, error: "Please tell us your name!" };
  if (name.length > 100) return { ok: false, error: "That name is a bit long!" };
  if (attending !== "yes" && attending !== "no") {
    return { ok: false, error: "Please pick yes or no!" };
  }
  if (wish.length > 500) return { ok: false, error: "Keep the wish under 500 characters 🌞" };
  let adults = 0, kids = 0;
  if (attending === "yes") {
    adults = Number(input.adults);
    kids = Number(input.kids);
    if (!Number.isInteger(adults) || adults < 1 || adults > 20) {
      return { ok: false, error: "How many grown-ups are coming?" };
    }
    if (!Number.isInteger(kids) || kids < 0 || kids > 20) {
      return { ok: false, error: "How many little ones are coming?" };
    }
  }
  return { ok: true, value: { name, attending, adults, kids, wish } };
}
