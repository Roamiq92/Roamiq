/**
 * ROAMIQ — Affiliate IDs Configuration
 *
 * Sostituisci questi ID con i tuoi reali appena li ottieni:
 *
 * Booking.com:   https://partners.booking.com  → "aid" nella dashboard
 * GetYourGuide:  https://partner.getyourguide.com → "Partner ID"
 * Skyscanner:    https://partners.skyscanner.net → "Associate ID"
 * OpenTable:     https://restaurant.opentable.it/partner → "Referral ID"
 */

export const AFFILIATES = {
  // Booking.com — commissione 25-40% su ogni prenotazione
  BOOKING_AID: "YOUR_BOOKING_AID",

  // GetYourGuide — commissione 8% su esperienze e tour
  GYG_PARTNER_ID: "YOUR_GYG_PARTNER_ID",

  // Skyscanner — flat fee per ogni volo prenotato
  SKYSCANNER_ID: "YOUR_SKYSCANNER_ID",

  // OpenTable — €1-5 per ogni prenotazione tavolo confermata
  OPENTABLE_REF: "roamiq",
} as const;

/* ── URL Builders con affiliate ── */

export function bookingUrl(destination: string, checkIn: string, checkOut: string, travelers: string) {
  const adults = travelers === "coppia" ? 2 : travelers === "famiglia" ? 3 : travelers === "amici" ? 3 : 1;
  const params = new URLSearchParams({
    aid: AFFILIATES.BOOKING_AID,
    ss: destination,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: String(adults),
    no_rooms: "1",
    lang: "it",
    selected_currency: "EUR",
  });
  return `https://www.booking.com/searchresults.it.html?${params.toString()}`;
}

export function getYourGuideUrl(activity: string, destination: string) {
  const params = new URLSearchParams({
    q: `${activity} ${destination}`,
    partner_id: AFFILIATES.GYG_PARTNER_ID,
    currency: "EUR",
    lang: "it",
  });
  return `https://www.getyourguide.it/s/?${params.toString()}`;
}

export function skyscannerUrl(from: string, destination: string, date: string, travelers: string) {
  const adults = travelers === "coppia" ? 2 : travelers === "famiglia" ? 3 : travelers === "amici" ? 3 : 1;
  // Skyscanner deep link format
  const params = new URLSearchParams({
    associateid: AFFILIATES.SKYSCANNER_ID,
    currency: "EUR",
    locale: "it-IT",
    adults: String(adults),
  });
  return `https://www.skyscanner.it/transport/voli/${encodeURIComponent(from)}/${encodeURIComponent(destination)}/${date}/?${params.toString()}`;
}

export function openTableUrl(restaurant: string, destination: string, date: string, partySize: number) {
  const params = new URLSearchParams({
    term: `${restaurant} ${destination}`,
    covers: String(partySize),
    dateTime: `${date}T20:00`,
    ref: AFFILIATES.OPENTABLE_REF,
  });
  return `https://www.opentable.it/s/?${params.toString()}`;
}

export function googleHotelsUrl(hotelName: string, destination: string, checkIn: string, checkOut: string) {
  // Google Hotels non ha affiliazione diretta ma genera autorevolezza
  const q = encodeURIComponent(`${hotelName} ${destination}`);
  return `https://www.google.com/travel/hotels?q=${q}&checkin=${checkIn}&checkout=${checkOut}&hl=it`;
}

export function googleMapsUrl(query: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
}
