// Farida's 1st Birthday — RSVP backend.
// Runs as a Google Apps Script web app bound to a Google Sheet.
// Deploy: execute as Me, accessible to Anyone. See SETUP.md.

var SHEET_NAME = "RSVPs";
var HEADER = ["Timestamp", "Name", "Attending", "Adults", "Kids", "Wish"];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADER);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var name = String(data.name || "").trim().slice(0, 100);
    var attending = data.attending === "yes" ? "Yes" : data.attending === "no" ? "No" : "";
    var adults = Math.max(0, Math.min(20, Math.floor(Number(data.adults) || 0)));
    var kids = Math.max(0, Math.min(20, Math.floor(Number(data.kids) || 0)));
    var wish = String(data.wish || "").trim().slice(0, 500);
    if (!name || !attending) return json_({ ok: false, error: "missing fields" });
    getSheet_().appendRow([new Date().toISOString(), name, attending, adults, kids, wish]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "bad request" });
  }
}

function doGet(e) {
  try {
    if (!e.parameter || e.parameter.action !== "list") {
      return json_({ ok: false, error: "unknown action" });
    }
    var expected = PropertiesService.getScriptProperties().getProperty("ADMIN_PASSWORD");
    if (!expected || e.parameter.password !== expected) {
      return json_({ ok: false, error: "wrong password" });
    }
    var values = getSheet_().getDataRange().getValues();
    var rows = values.slice(1).map(function (r) {
      return { timestamp: r[0], name: r[1], attending: r[2], adults: r[3], kids: r[4], wish: r[5] };
    });
    return json_({ ok: true, rows: rows });
  } catch (err) {
    return json_({ ok: false, error: "server error" });
  }
}
