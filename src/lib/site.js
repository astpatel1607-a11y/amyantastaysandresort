import { base44 } from "@/api/base44Client";

// Cache site settings across the app to avoid repeated calls.
let _settingsCache = null;
let _settingsPromise = null;

export async function getSiteSettings() {
  if (_settingsCache) return _settingsCache;
  if (_settingsPromise) return _settingsPromise;
  _settingsPromise = base44.entities.SiteSetting.list({ limit: 1 })
    .then((res) => {
      const items = res.items || res;
      _settingsCache = items[0] || defaultSettings();
      return _settingsCache;
    })
    .catch(() => defaultSettings());
  return _settingsPromise;
}

export function clearSettingsCache() {
  _settingsCache = null;
  _settingsPromise = null;
}

function defaultSettings() {
  return {
    brandName: "Amyanta Stays & Resorts",
    tagline: "Stay. Explore. Experience.",
    whatsappNumber: "",
    phoneNumbers: [],
    email: "",
    instagram: "",
    address: "",
    mapUrl: "",
    heroImage: "",
    aboutStory: "",
    vision: "",
    mission: "",
    founderName: "",
    founderImage: "",
    founderStory: ""
  };
}

// Build a wa.me link with a pre-filled message.
export function buildWhatsAppUrl(number, message) {
  const clean = (number || "").replace(/[^\d]/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${clean}${text}`;
}

export function buildTelUrl(number) {
  const clean = (number || "").replace(/[^\d+]/g, "");
  return `tel:${clean}`;
}

// Format an INR price; returns null if not set.
export function formatPrice(price) {
  if (price == null || price === 0 || price === "") return null;
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

// Compose a WhatsApp enquiry message from form data.
export function buildEnquiryMessage(data, settings) {
  const lines = ["New Amyanta Enquiry", ""];
  if (data.name) lines.push(`Name: ${data.name}`);
  if (data.mobile) lines.push(`Mobile: ${data.mobile}`);
  if (data.destination) lines.push(`Destination: ${data.destination}`);
  if (data.property) lines.push(`Property: ${data.property}`);
  if (data.checkIn) lines.push(`Check-in: ${data.checkIn}`);
  if (data.checkOut) lines.push(`Check-out: ${data.checkOut}`);
  if (data.guests) lines.push(`Guests: ${data.guests}`);
  if (data.rooms) lines.push(`Rooms: ${data.rooms}`);
  if (data.message) lines.push(`Message: ${data.message}`);
  return lines.join("\n");
}

// Property-specific WhatsApp message.
export function buildPropertyWhatsAppMessage(property, destination) {
  const name = property?.name || "this property";
  const dest = destination?.name || property?.destinationName || "your destination";
  return `Hello Amyanta, I am interested in ${name} in ${dest}. I would like to enquire about availability.`;
}

export function slugify(text) {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}