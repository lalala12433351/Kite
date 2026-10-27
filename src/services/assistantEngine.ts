/**
 * Smart matching for Kite Institute virtual assistant (Sara).
 * Prioritises institute-related questions and natural phrasing.
 */
import { courses } from '../data/coursesData';
import {
  matchGenericIndustryFAQ,
  isBroadIndustryQuestion,
  INDUSTRY_OPEN_FALLBACK,
} from './aviationHospitalityFAQ';

const STOP = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
  'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'and', 'but', 'if', 'or', 'because', 'until', 'while', 'about',
  'against', 'between', 'into', 'through', 'during', 'before', 'after',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they',
  'them', 'this', 'that', 'these', 'those', 'what', 'which', 'who',
  'whom', 'whose', 'tell', 'please', 'want', 'know', 'like', 'get',
  'give', 'any', 'much', 'many', 'also', 'even', 'still', 'well',
]);

/** Words that signal the user is asking about Kite / aviation careers */
const INSTITUTE_SIGNALS = new Set([
  'kite', 'institute', 'institution', 'campus', 'college', 'academy',
  'aviation', 'hospitality', 'course', 'courses', 'diploma', 'certificate',
  'admission', 'admissions', 'enrol', 'enroll', 'apply', 'application',
  'fee', 'fees', 'placement', 'placements', 'job', 'jobs', 'career',
  'bangalore', 'bengaluru', 'koramangala', 'jakkasandra', 'karnataka',
  'cabin', 'crew', 'ground', 'airport', 'airline', 'iata', 'amadeus',
  'skill', 'india', 'training', 'batch', 'timing', 'timings', 'class',
  'student', 'students', 'hostel', 'counseling', 'counselling', 'visit',
  'sara', 'assistant', 'contact', 'phone', 'email', 'address', 'location',
  'scholarship', 'discount', 'installment', 'duration', 'eligibility',
  'airline', 'airlines', 'aircraft', 'tourism', 'hotel', 'flight', 'flights',
  'travel', 'ticketing', 'pilot', 'cockpit', 'fnb', 'guest',
]);

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(norm) {
  return norm.split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
}

function instituteSignalCount(words) {
  return words.filter((w) => INSTITUTE_SIGNALS.has(w)).length;
}

function coursesSnippet() {
  return courses.map((c, i) => `${i + 1}. ${c.title}`).join('\n');
}

const CONTACT_LINE = '📞 +91 70228 33935 · ✉️ enquiry@kiteaviation.in';

const DEFAULT_INSTITUTE_FALLBACK = (hasInstituteContext) => {
  const intro = hasInstituteContext
    ? "Thanks for asking — here's how I can help with Kite Institute:\n\n"
    : '';
  return (
    `${intro}` +
    "I'm Sara, your guide for Kite Institute of Aviation & Hospitality.\n\n" +
    'I can help with: courses & durations, admissions and eligibility, fees and installments, ' +
    'placements, certifications (Skill India, IATA), campus location and timings, and careers in aviation and hospitality.\n\n' +
    'Our programs include:\n' +
    coursesSnippet() +
    '\n\nUse the quick topics below or type your question naturally.\n\n' +
    CONTACT_LINE
  );
};

const OFF_TOPIC_REDIRECT =
  "I'm here to help with Kite Institute — courses, admissions, placements, campus, and aviation careers.\n\n" +
  'Ask me something about the institute, or tap a quick topic below.\n\n' +
  CONTACT_LINE;

/**
 * Score how well user input matches a knowledge-base key.
 */
function scorePair(userNorm, userWords, keyRaw) {
  const keyNorm = normalize(keyRaw);
  if (!keyNorm.length) return 0;

  if (userNorm === keyNorm) return 1000;
  if (userNorm.includes(keyNorm) && keyNorm.length >= 8) return 800 + Math.min(100, keyNorm.length);
  if (keyNorm.includes(userNorm) && userNorm.length >= 10) return 700;

  const keyWords = tokenize(keyNorm);
  if (!keyWords.length) return 0;

  const keySet = new Set(keyWords);
  let overlap = 0;
  for (const w of userWords) {
    if (keySet.has(w)) overlap += 1;
  }
  // Phrase fragments: user word appears inside key string
  let partial = 0;
  for (const w of userWords) {
    if (w.length >= 4 && keyNorm.includes(w)) partial += 0.5;
  }

  const union = new Set([...userWords, ...keyWords]).size || 1;
  const jaccard = overlap / union;

  let score = overlap * 35 + partial * 20 + jaccard * 120;

  // Prefer longer keys when overlap is equal (more specific intents)
  if (overlap >= 2) score += Math.min(80, keyNorm.length * 0.5);

  // Boost if several key terms hit
  if (overlap >= 3) score += 60;

  return score;
}

/**
 * Optional: direct keyword → pick first matching knowledge key (higher priority)
 */
const PRIORITY_PHRASES = [
  {
    test: (u) =>
      /\b(who\s+(created|made|built|developed|designed)|whose\s+website|website\s+(creator|developer))\b/.test(u) &&
      /\b(website|web\s*site|this\s*site|this\s*app|portal)\b/.test(u),
    key: 'who created website who made website developer sugesh sugeshonline built this site web',
  },
  {
    test: (u) =>
      /\b(sugesh|sugeshonline)\b/.test(u) &&
      /\b(who|created|made|built|website|developer|site|web)\b/.test(u),
    key: 'who created website who made website developer sugesh sugeshonline built this site web',
  },
  { test: (u) => /\b(fee|fees|cost|price|payment|installment|pay)\b/.test(u) && u.length < 160, key: 'fee structure fees' },
  { test: (u) => /\b(placement|placements|job|jobs|recruit|hiring)\b/.test(u) && !/\bgoogle\b|\bamazon\b|\bit company\b/.test(u), key: 'do you provide placement support' },
  { test: (u) => /\b(where|location|address|campus|situated|reach|visit)\b/.test(u) && /\b(kite|institute|institution|bangalore|bengaluru|koramangala|your|you)\b/.test(u), key: 'where is your institute located' },
  { test: (u) => /\b(course|courses|program|programs|diploma)\b/.test(u) && /\b(what|which|list|offer|have|run)\b/.test(u), key: 'what courses do you offer course' },
  { test: (u) => /\b(contact|phone|number|call|email|whatsapp)\b/.test(u) && /\b(kite|institute|you|your|reach)\b/.test(u), key: 'how can i contact kite institute of aviation & hospitality' },
  { test: (u) => /\b(eligibility|eligible|criteria)\b/.test(u) && /\b(diploma|kite|aviation|hospitality)\b/.test(u), key: 'what is the eligibility for the Kite Diploma Course in Aviation & Hospitality Management ' },
  {
    test: (u) =>
      /\b(skill india|certificate|certification|govt|government|recognized|aaasc)\b/.test(u) ||
      (/\biata\b/.test(u) &&
        /\b(certificate|certification|govt|government|recognized|offer|do you provide|govt)\b/.test(u)),
    key: 'do you offer government-recognized certificates',
  },
  { test: (u) => /\b(hostel|accommodation|stay|pg|lodging)\b/.test(u), key: 'Hostel facility available? Do you provide hostel facility? Hostal' },
];

/**
 * @param {string} input - user message
 * @param {Record<string, string>} chatAnswers - knowledge base
 * @returns {{ text: string, matchedKey: string | null }}
 */
export function getAssistantResponse(input, chatAnswers) {
  const userNorm = normalize(input);
  if (!userNorm.length) {
    return { text: "I'm here when you're ready — what would you like to know about Kite Institute?", matchedKey: null };
  }

  const userWords = tokenize(userNorm);
  const signals = instituteSignalCount(userWords);

  // Priority phrase routing (only if that key exists)
  for (const { test, key } of PRIORITY_PHRASES) {
    if (test(userNorm) && chatAnswers[key]) {
      return { text: chatAnswers[key], matchedKey: key };
    }
  }

  let bestKey = null;
  let bestScore = 0;

  for (const key of Object.keys(chatAnswers)) {
    const s = scorePair(userNorm, userWords, key);
    if (s > bestScore) {
      bestScore = s;
      bestKey = key;
    }
  }

  // Threshold: need a confident match
  const threshold = userWords.length <= 2 ? 120 : 85;
  if (bestKey && bestScore >= threshold) {
    return { text: chatAnswers[bestKey], matchedKey: bestKey };
  }

  // Medium confidence: single strong word overlap on long keys
  if (bestKey && bestScore >= 55 && userWords.length >= 3) {
    return { text: chatAnswers[bestKey], matchedKey: bestKey };
  }

  // Generic aviation / hospitality industry (not Kite-specific)
  const industryAnswer = matchGenericIndustryFAQ(userNorm);
  if (industryAnswer) {
    return { text: industryAnswer, matchedKey: null };
  }

  // Institute-flavoured question but no KB hit — helpful default
  if (signals >= 1 || /kite|aviation|hospitality|bangalore|bengaluru|koramangala/.test(userNorm)) {
    return {
      text: DEFAULT_INSTITUTE_FALLBACK(true),
      matchedKey: null,
    };
  }

  // Broad industry topic without Kite keywords — still on-topic for Sara
  if (isBroadIndustryQuestion(userNorm)) {
    return { text: INDUSTRY_OPEN_FALLBACK, matchedKey: null };
  }

  return {
    text: OFF_TOPIC_REDIRECT,
    matchedKey: null,
  };
}

/** Suggested prompts shown as chips (interactive). Optional `path` opens that route after Sara replies. */
export const QUICK_TOPICS = [
  { label: 'Courses we offer', query: 'What courses do you offer?', path: '/courses' },
  { label: 'Fees & payments', query: 'What is the fee structure?', path: null },
  { label: 'Placements', query: 'Do you provide placement support?', path: '/placement' },
  { label: 'Location & visit', query: 'Where is the institute located?', path: '/contact' },
  { label: 'Eligibility', query: 'What is the eligibility for the diploma course?', path: '/courses' },
  { label: 'Contact us', query: 'How can I contact Kite Institute?', path: '/contact' },
];

/**
 * When the user asks about courses or related topics, return a route to open in the app.
 * @param {string} userInput - raw user message
 * @returns {{ path: string, kind: string } | null}
 */
export function getSuggestedNavigation(userInput) {
  const u = normalize(userInput);
  if (!u.length) return null;

  // --- Specific course detail (check before generic "course") ---
  if (
    /passenger\s*ground|ground\s*services(\s*course)?|check\s*-?\s*in\s*(and\s*)?(boarding|course)?/.test(u) &&
    !/ramp/.test(u)
  ) {
    return { path: '/courses/3', kind: 'course' };
  }
  if (/airport\s*ramp|ramp\s*services|ramp\s*training/.test(u)) {
    return { path: '/courses/4', kind: 'course' };
  }
  if (
    /\bamadeus\b/.test(u) ||
    /foundation\s*(in\s*)?travel|travel\s*&\s*tourism|travel\s+and\s+tourism/.test(u)
  ) {
    return { path: '/courses/2', kind: 'course' };
  }
  if (
    /kite\s*diploma|diploma\s+in\s+aviation|aviation\s*,\s*hospitality\s+and\s+travel|aviation\s+hospitality\s+travel\s+management/.test(u)
  ) {
    return { path: '/courses/1', kind: 'course' };
  }
  if (/airport\s*operations\s*fundamentals|\baof\b/.test(u) && !/ramp/.test(u)) {
    return { path: '/courses/5', kind: 'course' };
  }
  if (/cargo\s*(introductory|course|program)|introductory\s*cargo|air\s*cargo(\s+course)?/.test(u)) {
    return { path: '/courses/6', kind: 'course' };
  }

  // --- Related pages (when user asks to see / open / visit a section ---
  const wantsPage = /\b(open|show|visit|see|go\s*to|take\s*me\s*to|navigate|page|website|section)\b/.test(u);

  if (/\bplacement(s)?\b/.test(u) && (wantsPage || /\babout\s+(your\s*)?placement/.test(u))) {
    return { path: '/placement', kind: 'page' };
  }
  if (/\b(team|faculty|instructors)\b/.test(u) && wantsPage) {
    return { path: '/team', kind: 'page' };
  }
  if (/\b(gallery|photos|pictures|campus\s*tour)\b/.test(u) && wantsPage) {
    return { path: '/gallery', kind: 'page' };
  }
  if (/\b(news|blog|announcements)\b/.test(u) && wantsPage) {
    return { path: '/news', kind: 'page' };
  }
  if (/\babout\s*(kite|the\s*institute|you)\b/.test(u) && wantsPage) {
    return { path: '/about', kind: 'page' };
  }
  if (
    /\b(contact|enquiry|enroll|admission\s*form)\b/.test(u) &&
    (wantsPage || /\bform\b/.test(u))
  ) {
    return { path: '/contact', kind: 'page' };
  }

  // --- Courses listing ---
  const wantsCourseList =
    /\b(what|which|list|tell me about|show|browse|open|see)\b.*\b(course|courses|program|programs|diploma|offer|offered)\b/.test(u) ||
    /\b(course|courses|program|programs)\b.*\b(offer|you have|available|run|provide|list|open|show)\b/.test(u) ||
    /\b(suggest|looking for|recommend|interested in)\b.*\b(course|diploma|program|aviation|training)\b/.test(u) ||
    /\ball\s*(your\s*)?(programs?|courses?|diplomas?)\b/.test(u) ||
    /\bcourse\s*(details|page|listing|information|info|catalogue|catalog)\b/.test(u) ||
    /\bopen\s*(the\s*)?course(s)?\s*(page|section)?\b/.test(u) ||
    /\bhow\s+many\s+courses\b/.test(u) ||
    (/\bcourse\b/.test(u) && /\b(institute|kite|you|your)\b/.test(u) && /\b(what|which|tell|describe|explain)\b/.test(u));

  if (wantsCourseList) {
    return { path: '/courses', kind: 'courses' };
  }

  // Word overlap with course titles (fallback for "tell me about ramp training")
  let bestId = null;
  let bestScore = 0;
  for (const c of courses) {
    const words = normalize(c.title)
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w));
    let score = 0;
    for (const w of words) {
      if (u.includes(w)) score += w.length > 6 ? 3 : 2;
    }
    if (c.id === 1 && /diploma\b/.test(u) && /aviation|hospitality/.test(u)) score += 5;
    if (score > bestScore) {
      bestScore = score;
      bestId = c.id;
    }
  }
  if (bestId != null && bestScore >= 6) {
    return { path: `/courses/${bestId}`, kind: 'course' };
  }

  return null;
}
