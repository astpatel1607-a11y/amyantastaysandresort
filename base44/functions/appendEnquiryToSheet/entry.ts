import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

const HEADERS = ["Date", "Name", "Mobile", "Destination", "Property", "Check-in", "Check-out", "Guests", "Rooms", "Message"];
const TOKEN_TTL_SECONDS = 300;       // challenge tokens live 5 minutes
const RATE_WINDOW_MS = 60_000;      // 1 minute sliding window
const SUBMIT_MAX = 3;               // max submissions per IP per minute
const CHALLENGE_MAX = 10;           // max challenge requests per IP per minute
const GENERIC_ERROR = "We could not process your request. Please try again later.";

// Best-effort, per-isolate rate-limit buckets (Workers may spin up multiple isolates,
// so this is a soft limit — it still stops naive repeated spam within an isolate).
const buckets = new Map();

function clientIp(req) {
  const cf = req.headers.get("CF-Connecting-IP");
  if (cf) return cf.trim();
  const xff = req.headers.get("X-Forwarded-For");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

function rateCheck(key, max) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.start > RATE_WINDOW_MS) {
    buckets.set(key, { count: 1, start: now });
    return true;
  }
  b.count += 1;
  return b.count <= max;
}

function bufToB64url(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return bufToB64url(sig);
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function issueToken(secret) {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const sig = await hmac(secret, `${exp}.${nonce}`);
  return `${exp}.${nonce}.${sig}`;
}

async function verifyToken(token, secret) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expStr, nonce, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (now >= exp) return false;                       // expired
  if (exp - now > TOKEN_TTL_SECONDS + 10) return false; // not far-future
  if (!/^[a-f0-9]{16,64}$/.test(nonce)) return false;
  const expected = await hmac(secret, `${exp}.${nonce}`);
  return timingSafeEqual(sig, expected);
}

function sanitize(value, max) {
  if (value == null) return "";
  return String(value)
    .replace(/[\u0000-\u001F\u007F]/g, "") // strip control chars
    .trim()
    .slice(0, max);
}

// Returns { ok: true, data } or { ok: false, status, message }.
function validate(body) {
  const errors = {};
  const name = sanitize(body?.name, 50);
  if (!name) errors.name = "Name is required";
  else if (!/^[A-Za-z][A-Za-z .'-]{1,49}$/.test(name)) errors.name = "Invalid name";

  const mobileDigits = sanitize(body?.mobile, 20).replace(/[^\d]/g, "");
  if (!mobileDigits) errors.mobile = "Mobile number is required";
  else if (mobileDigits.length < 10 || mobileDigits.length > 15) errors.mobile = "Invalid mobile number";

  const message = sanitize(body?.message, 1000);

  const destination = sanitize(body?.destination, 100);
  const property = sanitize(body?.property, 100);
  const guests = sanitize(body?.guests, 3);
  const rooms = sanitize(body?.rooms, 3);
  if (guests && !/^\d{1,3}$/.test(guests)) errors.guests = "Invalid guests";
  if (rooms && !/^\d{1,3}$/.test(rooms)) errors.rooms = "Invalid rooms";

  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  const checkIn = sanitize(body?.checkIn, 10);
  const checkOut = sanitize(body?.checkOut, 10);
  if (checkIn && !dateRe.test(checkIn)) errors.checkIn = "Invalid check-in";
  if (checkOut && !dateRe.test(checkOut)) errors.checkOut = "Invalid check-out";

  if (Object.keys(errors).length) {
    return { ok: false, status: 400, message: "Please check the details you entered and try again." };
  }
  return {
    ok: true,
    data: { name, mobile: mobileDigits, message, destination, property, checkIn, checkOut, guests, rooms }
  };
}

function parseSheetId(url) {
  if (!url) return null;
  const m = String(url).match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : null;
}

// Append validated row to the configured sheet. Best-effort: never throws to the
// client and never reveals sheet/credential internals. Logging failures are
// swallowed (the Enquiry record is already persisted by the frontend).
async function appendToSheet(base44, row) {
  const settingsPage = await base44.asServiceRole.entities.SiteSetting.list({ limit: 1 });
  const settings = (settingsPage.items || [])[0];
  const spreadsheetId = settings?.googleSheetUrl ? parseSheetId(settings.googleSheetUrl) : null;
  if (!spreadsheetId) return; // no sheet configured — skip (admin must configure once)

  const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");
  if (!accessToken) return;
  const authHeaders = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

  // Ensure a header row exists once (cheap GET; write only if empty).
  try {
    const getRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Enquiries!A1:J1`, { headers: authHeaders });
    if (getRes.ok) {
      const got = await getRes.json();
      const first = got.values?.[0];
      if (!first || first.every((c) => !c)) {
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Enquiries!A1:J1?valueInputOption=RAW`, {
          method: "PUT", headers: authHeaders, body: JSON.stringify({ values: [HEADERS] })
        });
      }
    }
  } catch (_) { /* header check is best-effort */ }

  const ts = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const values = [[ts, row.name, row.mobile, row.destination, row.property, row.checkIn, row.checkOut, row.guests, row.rooms, row.message]];
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Enquiries!A:J:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST", headers: authHeaders, body: JSON.stringify({ values })
  });
}

export default async function(req) {
  let body = {};
  try { body = await req.json(); } catch (_) { body = {}; }
  const ip = clientIp(req);

  try {
    // Challenge issuance — lightweight, rate-limited, returns a signed token only.
    if (body?.mode === "challenge") {
      if (!rateCheck(`ch:${ip}`, CHALLENGE_MAX)) {
        return Response.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
      }
      const secret = secrets.get("ENQUIRY_HMAC_SECRET");
      if (!secret) {
        console.error("ENQUIRY_HMAC_SECRET is not set");
        return Response.json({ error: GENERIC_ERROR }, { status: 503 });
      }
      const token = await issueToken(secret);
      return Response.json({ token });
    }

    // Submit path — verify token, rate-limit, validate, then append (best-effort).
    if (!rateCheck(`sub:${ip}`, SUBMIT_MAX)) {
      return Response.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }
    const secret = secrets.get("ENQUIRY_HMAC_SECRET");
    if (!secret) {
      console.error("ENQUIRY_HMAC_SECRET is not set");
      return Response.json({ error: GENERIC_ERROR }, { status: 503 });
    }
    const valid = await verifyToken(body?.token, secret);
    if (!valid) {
      return Response.json({ error: "Request verification failed. Please refresh and try again." }, { status: 403 });
    }

    const result = validate(body);
    if (!result.ok) {
      return Response.json({ error: result.message }, { status: result.status });
    }

    const base44 = createClientFromRequest(req);
    try {
      await appendToSheet(base44, result.data);
    } catch (err) {
      // Log server-side only; never surface internal details to the client.
      console.error("Sheet append failed:", err?.message || err);
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("appendEnquiryToSheet error:", error?.message || error);
    return Response.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}