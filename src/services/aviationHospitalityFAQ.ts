/**
 * Generic aviation & hospitality industry answers (not Kite-specific).
 * Used when the knowledge base has no direct key match but the question is on-topic.
 */

const FAQ = [
  {
    re: /\bjet\s*lag\b|\btime\s*zone\s*fatigue\b/,
    text:
      'Jet lag is fatigue and sleep disruption when you cross time zones quickly — your body clock is out of sync with local day/night. Crew and frequent travellers manage it with rest, hydration, light exposure, and gradual schedule shifts. Airlines train crew on fatigue risk management.',
  },
  {
    re: /\bturbulence\b|\bair\s*pocket\b/,
    text:
      'Turbulence is irregular air movement that can shake the aircraft. It is usually uncomfortable but not dangerous — planes are built for it, and pilots use weather and radar to avoid the worst areas. Always follow crew instructions and keep your seatbelt fastened when seated.',
  },
  {
    re: /\bboarding\s*pass\b|\bpnr\b|\bbooking\s*reference\b/,
    text:
      'A boarding pass confirms your seat and flight; a PNR (Passenger Name Record) is your booking reference in the reservation system. Ground staff and self-service kiosks use these to check you in and issue baggage tags.',
  },
  {
    re: /\bduty\s*free\b|\btax\s*free\b.*\b(shop|airport)\b/,
    text:
      'Duty-free shops sell goods without local import/sales taxes in controlled airport zones. Rules on liquids and allowances vary by country — always check customs limits before you buy.',
  },
  {
    re: /\bstar\s*rating\b.*\bhotel\b|\b5\s*star\s*hotel\b|\bhotel\s*classification\b/,
    text:
      'Hotels are often graded by stars (1–5) or official schemes — criteria include rooms, services, F&B, and facilities. Ratings are not identical worldwide; always read recent guest reviews too.',
  },
  {
    re: /\brevpar\b|\brevenue\s*per\s*available\s*room\b/,
    text:
      'RevPAR is a hotel performance metric: room revenue divided by available rooms in a period. It helps revenue managers balance pricing, occupancy, and demand.',
  },
  {
    re: /\bconcierge\b|\bbell\s*desk\b/,
    text:
      'Concierge assists guests with reservations, transport, recommendations, and special requests — a key front-office role in upscale hotels and resorts.',
  },
  {
    re: /\bhousekeeping\b|\broom\s*attendant\b|\bturndown\b/,
    text:
      'Housekeeping keeps rooms clean, stocked, and safe — standards matter for guest satisfaction and brand audits. In aviation-linked hospitality, attention to detail is similar to cabin presentation standards.',
  },
  {
    re: /\bfront\s*office\b|\breception\b.*\bhotel\b|\bcheck\s*-?\s*in\b.*\bhotel\b/,
    text:
      'Front office handles arrivals, departures, billing, keys, and guest requests — it sets the first and last impression of a hotel stay.',
  },
  {
    re: /\bf\s*&\s*b\b|\bfood\s*and\s*beverage\b|\brestaurant\s*operations\b/,
    text:
      'F&B covers restaurants, bars, banqueting, and in-flight catering — combining service skills, hygiene, costing, and guest experience.',
  },
  {
    re: /\balliance\b.*\b(airline|oneworld|star\s*alliance|skyteam)\b|\boneworld\b|\bstar\s*alliance\b|\bskyteam\b/,
    text:
      'Major airline alliances (e.g. Star Alliance, oneworld, SkyTeam) let carriers codeshare, align frequent-flyer benefits, and coordinate networks — useful for passengers connecting globally.',
  },
  {
    re: /\blow\s*cost\s*carrier\b|\blcc\b|\bno\s*frills\b.*\bairline\b/,
    text:
      'Low-cost carriers focus on high aircraft utilisation, point-to-point routes, and optional extras — fares are often lower, but baggage and meals may cost extra.',
  },
  {
    re: /\bicao\b|\binternational\s*civil\s*aviation\b/,
    text:
      'ICAO sets global standards for aviation safety, navigation, and environmental practices — countries adopt SARPs (Standards and Recommended Practices) through national regulators.',
  },
  {
    re: /\b(iata|international\s*air\s*transport)\b(?!.*kite)/,
    text:
      'IATA is a trade association of airlines — it helps with standards, training, ticketing, and industry advocacy. Many travel and airport programs reference IATA courses and manuals.',
  },
  {
    re: /\bdgca\b|\bdirectorate\s*general\s*of\s*civil\s*aviation\b/,
    text:
      'DGCA is India’s civil aviation regulator — it oversees safety, licensing, rules for airlines and airports, and passenger rights within the Indian system.',
  },
  {
    re: /\bair\s*traffic\s*control\b|\batc\b|\btower\b.*\b(airport|clearance)\b/,
    text:
      'ATC manages aircraft separation and flow in airspace and on the ground — clearances, headings, and altitudes keep operations safe and orderly.',
  },
  {
    re: /\bground\s*handling\b|\bturnaround\b.*\b(aircraft|flight)\b/,
    text:
      'Ground handling covers baggage, pushback, catering loading, fueling, cleaning, and coordination on the ramp — critical for on-time performance and safety.',
  },
  {
    re: /\bmro\b|\bmaintenance\s*repair\b.*\baircraft\b/,
    text:
      'MRO organisations maintain and repair aircraft to regulatory standards — heavy checks, line maintenance, and component shops keep fleets airworthy.',
  },
  {
    re: /\bload\s*factor\b|\byield\b.*\bairline\b/,
    text:
      'Airlines track load factor (passengers vs seats) and yield (revenue per passenger-km) — key to profitability along with fuel and network planning.',
  },
  {
    re: /\bpassenger\s*rights\b|\bdelay\s*compensation\b|\bbenefit\s*of\s*doubt\b.*\bflight\b/,
    text:
      'Passenger rights for delays, cancellations, and denied boarding depend on the country, airline conditions, and ticket rules — always read the carrier’s contract of carriage.',
  },
  {
    re: /\btravel\s*agent\b|\btravel\s*agency\b|\biata\s*agency\b/,
    text:
      'Travel agents and OTAs sell flights, packages, and ancillary services — many use GDS tools and earn commissions or service fees while advising clients.',
  },
  {
    re: /\bgds\b|\bglobal\s*distribution\s*system\b/,
    text:
      'GDS platforms (e.g. Amadeus, Sabre, Travelport) connect travel sellers to airline/hotel inventory — professionals train on these for reservations and ticketing.',
  },
  {
    re: /\boverbooking\b|\bbumped\b.*\bflight\b/,
    text:
      'Airlines sometimes oversell seats based on no-show forecasts. If everyone shows up, volunteers may take compensation, or rules may apply for involuntary denied boarding — policies vary.',
  },
  {
    re: /\bjet\s*bridge\b|\bairbridge\b|\bpbb\b/,
    text:
      'Jet bridges (passenger boarding bridges) connect the terminal to the aircraft door — better for weather and accessibility than stairs-only boarding.',
  },
  {
    re: /\bairside\b|\blandside\b/,
    text:
      'Airside is the secure flight area past security; landside is before security. Different rules apply for access, retail, and operations.',
  },
  {
    re: /\bcrew\s*resource\s*management\b|\bcrm\b.*\b(crew|cockpit|flight)\b/,
    text:
      'CRM trains pilots and cabin crew to communicate clearly, manage stress, and coordinate under pressure — central to modern safety culture.',
  },
  {
    re: /\bupselling\b|\bcross\s*sell\b.*\b(hotel|hospitality)\b/,
    text:
      'Upselling offers a higher-value option; cross-selling adds related services — both are common in hotels and airlines when done ethically and transparently.',
  },
  {
    re: /\beco\s*tourism\b|\bsustainable\s*tourism\b/,
    text:
      'Sustainable tourism minimises environmental and social harm — relevant to aviation (emissions, noise) and hospitality (water, waste, local communities).',
  },
  {
    re: /\bcruise\b.*\b(industry|ship|hospitality)\b|\bship\s*hospitality\b/,
    text:
      'Cruise hospitality blends hotel-style service with maritime safety — roles span cabins, F&B, entertainment, and guest services on board.',
  },
  {
    re: /\bbarista\b|\bwine\s*service\b|\bsommelier\b/,
    text:
      'F&B careers include barista skills, wine service, and banquet operations — useful in hotels, lounges, and premium airline catering concepts.',
  },
  {
    re: /\bspa\b|\bwellness\b.*\b(hotel|resort)\b/,
    text:
      'Hotel spas and wellness add revenue and guest loyalty — roles combine hospitality, hygiene, and guest care standards.',
  },
  {
    re: /\bloyalty\s*program\b|\bfrequent\s*flyer\b|\bffp\b/,
    text:
      'Airline loyalty programs reward repeat travel with points or miles — status tiers can offer lounge access, upgrades, and partner benefits.',
  },
  {
    re: /\bwide\s*body\b|\bnarrow\s*body\b|\baircraft\s*types\b/,
    text:
      'Narrow-body jets (single aisle) often fly short/medium haul; wide-body (twin aisle) typically long haul with more seats and cargo — crew workflows differ by cabin layout.',
  },
  {
    re: /\bapron\b|\btarmac\b.*\bairport\b/,
    text:
      'The apron (ramp) is where aircraft park, load, and service — ground movement and safety rules are strict for vehicles and staff.',
  },
  {
    re: /\bdangerous\s*goods\b|\bdg\b.*\b(aviation|air|flight|cargo)\b/,
    text:
      'Dangerous goods are items that can pose risk in flight — batteries, chemicals, etc. IATA and regulators define how they may be carried and declared.',
  },
  {
    re: /\bicao\s*alphabet\b|\bphonetic\s*alphabet\b|\balpha\s*bravo\b/,
    text:
      'The ICAO phonetic alphabet (Alpha, Bravo, Charlie…) avoids mishearing letters on radio — standard in aviation and many hospitality/security comms.',
  },
];

/**
 * @param {string} userNorm - lowercase normalized user message
 * @returns {string | null}
 */
export function matchGenericIndustryFAQ(userNorm) {
  for (const { re, text } of FAQ) {
    if (re.test(userNorm)) return text;
  }
  return null;
}

/** Broad industry terms: not Kite-specific but on-topic for Sara */
export function isBroadIndustryQuestion(userNorm) {
  return /\b(aviation|airline|airlines|airport|airports|aircraft|flight|flights|flying|pilot|cockpit|cabin|crew|ground\s*staff|ground\s*handling|ticketing|gds|iata|icao|dgca|atc|hospitality|hotel|hotels|resort|restaurant|tourism|tourist|travel\s*industry|f\s*&\s*b|food\s*and\s*beverage|guest\s*service|concierge|housekeeping|cruise|loyalty\s*program|frequent\s*flyer|mro|ramp|airside|boarding|layover|layovers)\b/i.test(
    userNorm
  );
}

export const INDUSTRY_OPEN_FALLBACK =
  'That’s a good industry question. In aviation and hospitality, careers span airlines, airports, travel, hotels, and customer-facing roles — with strong emphasis on safety, communication, grooming, and service excellence.\n\n' +
  'I can explain general concepts (airports, cabin/ground roles, GDS, guest service, etc.). For anything specific to Kite Institute — courses, fees, or admissions — ask and I’ll connect you to our programs.\n\n' +
  '📞 +91 70228 33935 · ✉️ enquiry@kiteaviation.in';
