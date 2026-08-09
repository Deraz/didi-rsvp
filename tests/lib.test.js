import { test } from "node:test";
import assert from "node:assert/strict";
import {
  countdownParts, isoToUtcBasic, toGoogleCalendarUrl, toIcs, validateRsvp,
} from "../js/lib.js";

const START = "2026-08-28T18:30:00+03:00"; // = 2026-08-28T15:30:00Z
const END = "2026-08-28T21:30:00+03:00";

test("countdownParts: 1 day, 2 hours, 3 minutes, 4 seconds before", () => {
  const target = Date.parse(START);
  const now = target - (((1 * 24 + 2) * 60 + 3) * 60 + 4) * 1000;
  assert.deepEqual(countdownParts(now, START), {
    done: false, days: 1, hours: 2, minutes: 3, seconds: 4,
  });
});

test("countdownParts: exactly at party time and after → done with zeros", () => {
  const target = Date.parse(START);
  const done = { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  assert.deepEqual(countdownParts(target, START), done);
  assert.deepEqual(countdownParts(target + 5000, START), done);
});

test("isoToUtcBasic converts +03:00 offset to Z basic format", () => {
  assert.equal(isoToUtcBasic(START), "20260828T153000Z");
  assert.equal(isoToUtcBasic(END), "20260828T183000Z");
});

test("toGoogleCalendarUrl embeds encoded fields and UTC range", () => {
  const url = toGoogleCalendarUrl({
    title: "Farida's 1st Birthday 🎂☀️",
    startIso: START, endIso: END,
    location: "Family Park, El Rehab",
    description: "Map: https://maps.app.goo.gl/6SVExxStf4ZbmpAt7",
  });
  const u = new URL(url);
  assert.equal(u.hostname, "calendar.google.com");
  assert.equal(u.searchParams.get("action"), "TEMPLATE");
  assert.equal(u.searchParams.get("dates"), "20260828T153000Z/20260828T183000Z");
  assert.equal(u.searchParams.get("location"), "Family Park, El Rehab");
  assert.match(u.searchParams.get("details"), /maps\.app\.goo\.gl/);
  assert.match(u.searchParams.get("text"), /Farida/);
});

test("toIcs produces CRLF VCALENDAR with escaped description", () => {
  const ics = toIcs({
    title: "Farida's 1st Birthday",
    startIso: START, endIso: END,
    location: "Family Park, El Rehab",
    description: "Line one\nMap: https://maps.app.goo.gl/6SVExxStf4ZbmpAt7",
  });
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /\r\nDTSTART:20260828T153000Z\r\n/);
  assert.match(ics, /\r\nDTEND:20260828T183000Z\r\n/);
  assert.match(ics, /\r\nLOCATION:Family Park\\, El Rehab\r\n/);
  assert.match(ics, /DESCRIPTION:Line one\\nMap:/);
  assert.match(ics, /\r\nEND:VCALENDAR\r\n?$/);
});

test("validateRsvp: happy path yes", () => {
  const r = validateRsvp({ name: "  Amr ", attending: "yes", adults: "2", kids: "1", wish: "hi" });
  assert.deepEqual(r, { ok: true, value: { name: "Amr", attending: "yes", adults: 2, kids: 1, wish: "hi" } });
});

test("validateRsvp: attending no forces zero counts", () => {
  const r = validateRsvp({ name: "Sara", attending: "no", adults: "3", kids: "2", wish: "" });
  assert.deepEqual(r, { ok: true, value: { name: "Sara", attending: "no", adults: 0, kids: 0, wish: "" } });
});

test("validateRsvp rejections", () => {
  assert.equal(validateRsvp({ name: "", attending: "yes", adults: 1, kids: 0, wish: "" }).ok, false);
  assert.equal(validateRsvp({ name: "A", attending: "maybe", adults: 1, kids: 0, wish: "" }).ok, false);
  assert.equal(validateRsvp({ name: "A", attending: "yes", adults: 0, kids: 0, wish: "" }).ok, false);
  assert.equal(validateRsvp({ name: "A", attending: "yes", adults: "x", kids: 0, wish: "" }).ok, false);
  assert.equal(validateRsvp({ name: "A", attending: "yes", adults: 1, kids: -1, wish: "" }).ok, false);
  assert.equal(validateRsvp({ name: "A", attending: "yes", adults: 1, kids: 0, wish: "w".repeat(501) }).ok, false);
});
