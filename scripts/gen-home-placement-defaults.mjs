import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'lib', 'cmsDefaults');

const airlines = [
  { name: 'airindia', url: 'https://www.airindia.com/' },
  { name: 'emirates', url: 'https://www.emirates.com/ie/english/' },
  { name: 'etihad', url: 'https://www.etihad.com/' },
  { name: 'qatar', url: 'https://www.qatarairways.com/' },
  { name: 'kuwait', url: 'https://www.kuwaitairways.com/en' },
  { name: 'indigo', url: 'https://www.goindigo.in/' },
  { name: 'spice', url: 'https://www.spicejet.com/' },
  { name: 'airasia', url: 'https://www.airasia.com/' },
  { name: 'akasaair', url: 'https://www.akasaair.com/' },
  { name: 'starair', url: 'https://www.starair.in/' },
  { name: 'vistara', url: 'https://www.airvistara.com/' },
  { name: 'airindiaexpress', url: 'https://www.airindiaexpress.com/' },
  { name: 'celebi', url: 'https://www.celebiaviation.com/' },
  { name: 'airarabia', url: 'https://www.airarabia.com/' },
  { name: 'american', url: 'https://www.aa.com/homePage.do?locale=en_US' },
  { name: 'airindiasats', url: 'https://www.aisats.in/' },
  { name: 'bwfs', url: 'https://www.bird.in/businessverticals/aviation-services.html' },
  { name: 'gaar', url: 'https://www.gmrgroup.in/airports/' },
  { name: 'itc', url: 'https://www.itcportal.com/' },
  { name: 'harley', url: 'https://www.harley-davidson.com/', className: 'auto' },
  { name: 'easymytrip', url: 'https://www.easemytrip.ae/', className: 'travel' },
  { name: 'vfs', url: 'https://www.vfsglobal.com/en/individuals/index.html', className: 'travel' },
  { name: 'parkhyat', url: 'https://www.hyatt.com/', className: 'hotel' },
  { name: 'theleela', url: 'https://www.theleela.com/', className: 'hotel' },
  { name: 'obroi', url: 'https://www.oberoihotels.com/', className: 'hotel' },
  { name: 'taj', url: 'https://www.tajhotels.com/en-in', className: 'hotel' },
  { name: 'jw', url: 'https://www.jw-marriott.marriott.com/', className: 'hotel' },
  { name: 'radisson', url: 'https://www.radissonhotels.com/', className: 'hotel' },
  { name: 'westin', url: 'https://www.westin.marriott.com/', className: 'hotel' },
];

const home = {
  heroTypingTexts: ["India's Most Trusted", 'Aviation Training Institute'],
  circleTiles: [
    {
      label: 'Our Story',
      link: '/about',
      image: 'images/himg-1.jpg',
      icon: 'images/about-icon.svg',
      hoverText: 'Discover our journey, values, and milestones that shape who we are today.',
    },
    {
      label: 'Student Hub',
      link: '/student-hub',
      image: 'images/himg-2.jpg',
      icon: 'images/play-icon.svg',
      hoverText: 'Discover exciting activities and events designed for future aviation achievers.',
      badge: 'NEW',
    },
    {
      label: 'Life at Kite',
      link: '/gallery',
      image: 'images/himg-3.jpg',
      icon: 'images/gallery-icon.svg',
      hoverText: 'Explore photos and videos capturing our journey and moments.',
    },
    {
      label: 'Talk to Virtual Agent',
      action: 'openChatbot',
      image: 'images/himg-4.jpg',
      icon: 'images/talk-icon.svg',
      hoverText: 'Get instant answers and guidance from our virtual assistant.',
    },
    {
      label: 'Campus Tour',
      action: 'openCampusTour',
      image: 'images/himg-5.jpg',
      icon: 'images/student-icon.svg',
      hoverText: 'Take a quick tour and explore our vibrant campus in action.',
    },
  ],
  googleReviews: {
    heading: "Google's 5-Star Excellence!",
    subtext:
      "Don't just take our word for it - see what our students & parents have to say about their experience at Kite.",
    buttonLabel: 'View All Reviews on Google',
    url: 'https://share.google/MKrE5AOIGlQr0vC6l',
  },
  aboutBlurb: {
    instituteName: 'Kite Institute of Aviation & Hospitality',
    highlightWord: 'prestigious',
    paragraph:
      "India's prestigious aviation training institute based in Bangalore, dedicated to providing world-class programs that equip aspiring professionals for successful careers in airlines, airports, and the hospitality industry.",
  },
  courseTeaser: [
    {
      title: 'Kite Diploma Course in Aviation, Hospitality and Travel Management',
      duration: '12 Months, 5 days/week (Mon- Fri) 2 hours',
    },
    { title: 'Airport Operations Fundamentals', duration: '6 Months, 5 days/week (Mon-Fri) 2 hours' },
    { title: 'Passenger Ground Services Course', duration: '6 Months, 5 days/week (Mon-Fri) 2 hours' },
    { title: 'Airport Ramp Services Training', duration: '6 Months, 5 days/week (Mon-Fri) 2 hours' },
    { title: 'Foundation in Travel & Tourism with Amadeus', duration: '8 Months, 5 days/week (Mon-Fri) 2 hours' },
    { title: 'Cargo Introductory Course', duration: '6 Months, 5 days/week (Mon-Fri) 2 hours' },
  ],
  courseRecommendation: {
    heading: 'Can I suggest a course for you?',
    text: "Answer a few quick questions and we'll recommend the perfect course based on your interests and qualifications.",
    buttonLabel: 'Find My Course',
    href: '/courses?openRecommendation=1',
  },
  airlinesHeading: 'Careers Take Off with Top Airlines',
  airlines: airlines.map((a) => ({ name: a.name, logo: a.name, url: a.url, className: a.className || null })),
  closingText:
    "At Kite Institute of Aviation & Hospitality, we believe that the sky is not the limit—it's just the beginning.\nJoin us and take your first step toward a successful and rewarding career in the aviation and hospitality industry.",
  whyChooseSection: {
    eyebrow: 'Kite Advantage',
    heading: 'Why Choose Kite Aviation',
    intro:
      'We blend industry-focused training, personal mentorship, and practical exposure so students become confident professionals from day one.',
  },
  whyChooseCards: [
    {
      id: 1,
      title: 'Placement-First Learning',
      shortText: 'Focused preparation aligned to airline, airport, and hospitality hiring requirements.',
      image: 'images/himg-1.jpg',
      details: [
        'Structured preparation for real interview rounds and group discussions.',
        'Industry expectation mapping for airport, airline, and hospitality roles.',
        'Resume support and career guidance from our placement-oriented mentors.',
      ],
    },
    {
      id: 2,
      title: 'Interview & Grooming Mastery',
      shortText: 'Mock interviews, communication drills, and professional grooming for real-world success.',
      image: 'images/himg-2.jpg',
      details: [
        'Personal grooming sessions aligned with airline and hospitality standards.',
        'Confidence-building mock interviews with practical feedback.',
        'Body language, communication, and etiquette training for career readiness.',
      ],
    },
    {
      id: 3,
      title: 'Mentors from the Industry',
      shortText: 'Learn from trainers with practical aviation and hospitality operations experience.',
      image: 'images/himg-3.jpg',
      details: [
        'Sessions led by professionals with hands-on operational exposure.',
        'Real case studies from aviation, airport, and hospitality workflows.',
        'Guidance on role expectations, work culture, and growth pathways.',
      ],
    },
    {
      id: 4,
      title: 'Practical Exposure',
      shortText: 'Hands-on modules and scenario-based training designed around actual workplace workflows.',
      image: 'images/himg-5.jpg',
      details: [
        'Practice-oriented modules that simulate real service environments.',
        'Operational scenarios to build problem-solving and teamwork.',
        'Job-readiness focus to help students transition confidently into industry roles.',
      ],
    },
  ],
  faqItems: [
    {
      id: 'eligibility',
      question: 'What are the eligibility criteria for aviation courses?',
      answer:
        'Most programs require 12th pass (or equivalent). Age limits typically range from 18–25 depending on the course. Share your qualification and we will confirm eligibility for your preferred program.',
    },
    {
      id: 'placement',
      question: 'Do you provide placement assistance?',
      answer:
        'Yes. We provide placement assistance and career support with strong industry connections. Our team guides students through interviews, grooming, and employer introductions.',
    },
    {
      id: 'age-limit',
      question: 'Is there any age limit for cabin crew training?',
      answer:
        'Airline hiring norms often prefer candidates roughly between 18 and 27 years. Our counsellors will advise you based on your profile and the course you choose.',
    },
    {
      id: 'experience',
      question: 'Do I need prior experience to join?',
      answer:
        'No prior aviation experience is required for most entry-level programs. We train you from fundamentals through practical modules aligned with industry standards.',
    },
    {
      id: 'grooming',
      question: 'Are grooming sessions included?',
      answer:
        'Yes. Grooming, communication, and interview preparation are integrated into our diploma and related modules so students meet airline and hospitality expectations.',
    },
  ],
  usefulLinks: [
    {
      title: 'Verify Certificate',
      subtitle: 'Verify student certificates online',
      href: 'https://kiteaviation.in/students/verify',
      external: true,
      icon: 'icons/certificate-check.svg',
    },
    {
      title: 'Virtual Tour',
      subtitle: 'Explore our campus in 1 minute',
      action: 'openCampusTour',
      icon: 'images/student-icon.svg',
    },
    {
      title: 'Student Hub',
      subtitle: 'Events, highlights & activities',
      href: '/student-hub',
      icon: 'images/play-icon.svg',
    },
    {
      title: 'Virtual Assistant',
      subtitle: 'Get instant answers',
      action: 'openChatbot',
      icon: 'images/talk-icon.svg',
    },
  ],
  videos: [
    { id: 1, thumb: 'icons/video-thumb1.jpg', src: 'gallery/walkthrough.mp4', subtitle: 'Kite Aviation', title: 'Campus' },
    { id: 2, thumb: 'icons/video-thumb2.jpg', src: 'gallery/Koshy-Reel.mp4', subtitle: 'Kite Aviation', title: 'Training' },
    { id: 3, thumb: 'icons/video-thumb3.jpg', src: 'gallery/speedramp.mp4', subtitle: 'Kite Aviation', title: 'Promo Reel' },
    { id: 4, thumb: 'icons/video-thumb4.jpg', src: 'gallery/testimonial1.mp4', subtitle: 'Testimonial - Air India', title: 'Anju' },
    { id: 5, thumb: 'icons/video-thumb5.jpg', src: 'gallery/Independenceday-video.mp4', subtitle: 'Independence Day', title: 'Celebration' },
    { id: 6, thumb: 'icons/video-thumb6.jpg', src: 'gallery/kite-promo1.mp4', subtitle: 'Welcome to', title: 'Kite' },
  ],
  featuredPlacementStudents: [
    { name: 'Anuradha', company: 'Adarsh Hamilton', image: 'images/placement-stories/anuradha.png' },
    { name: 'Nilani S R', company: 'Air India', image: 'images/placement-stories/nilani.png' },
    { name: 'Keerthana R', company: 'AirIndia Sats', image: 'images/placement-stories/keerthana.png' },
    { name: 'Pumin Konyak', company: 'IndiGo', image: 'images/placement-stories/pumin.png' },
    { name: 'Mahesh', company: 'Adarsh Hamilton', image: 'images/placement-stories/mahesh.png' },
    { name: 'Noorjahan', company: 'AirIndia Sats', image: 'images/placement-stories/noorjahan.png' },
    { name: 'Vennila', company: 'AirIndia Sats', image: 'images/placement-stories/vennila.png' },
  ],
  videoGalleryHeading: 'Media Showcase',
};

const placement = {
  hero: {
    title: 'Placement',
    introHeading: 'Your Gateway to a Successful Career',
    intro:
      'At Kite Institute of Aviation & Hospitality, we take immense pride in shaping the careers of our students by providing excellent training and placement assistance. Our strong industry connections and dedicated placement cell ensure that our graduates step into the professional world with confidence and expertise.',
  },
  videosHeading: 'Recent Placements',
  videos: [
    {
      id: 'placement-1',
      thumb: 'icons/nilani.jpg',
      src: 'gallery/placement-video2.webm',
      title: 'Nilani',
      company: 'IndiGo',
      airlineLogo: 'indigo',
    },
    {
      id: 'placement-2',
      thumb: 'icons/pumin.jpg',
      src: 'gallery/placement-video1.webm',
      title: 'Pumin',
      company: 'Air India',
      airlineLogo: 'airindia',
    },
    {
      id: 'placement-3',
      thumb: 'icons/noorjahan.jpg',
      src: 'gallery/placement-video3.webm',
      title: 'Noorjahan',
      company: 'Air India',
      airlineLogo: 'airindia',
    },
  ],
  stories: [
    { name: 'Anuradha S', company: 'Adarsh Hamilton', image: 'images/placement-stories/anuradha.png' },
    { name: 'Nilani S R', company: 'Air India', image: 'images/placement-stories/nilani.png' },
    { name: 'Keerthana R', company: 'AirIndia Sats', image: 'images/placement-stories/keerthana.png' },
    { name: 'Pumin Konyak', company: 'IndiGo', image: 'images/placement-stories/pumin.png' },
    { name: 'Mahesh ', company: 'Adarsh Hamilton', image: 'images/placement-stories/mahesh.png' },
    { name: 'Noorjahan', company: 'AirIndia Sats', image: 'images/placement-stories/noorjahan.png' },
    { name: 'Vennila K', company: 'AirIndia Sats', image: 'images/placement-stories/vennila.png' },
    { name: 'Sharadhi M', company: 'AirIndia Sats', image: 'images/placement-stories/sharadhi.png' },
    { name: 'Sanggaiheung Chuilo', company: 'Indigo', image: 'images/placement-stories/sangee.png' },
    { name: 'Shashank', company: 'The Elanza', image: 'images/placement-stories/shashank.png' },
  ],
  ctaCard: {
    text: 'You Could Be Next!',
    actionLabel: 'Enroll now',
  },
  partnersHeading: 'Placement Partners',
  partnersIntro:
    'We are associated with some of the most prestigious names in the aviation and hospitality sectors, including:',
  airlines: airlines.map((a) => ({ name: a.name, logo: a.name, url: a.url, className: a.className || null })),
  whyChoose: {
    heading: 'Why Choose Kite for Placements?',
    items: [
      {
        title: '100% Placement Assistance',
        text: 'We guide and support students in securing job opportunities in leading airlines, hotels, travel & tourism companies, and customer service industries.',
      },
      {
        title: 'Industry Tie-ups',
        text: 'Collaborations with top aviation, hospitality, and travel management companies.',
      },
      {
        title: 'Skill Development & Training',
        text: 'Specialized workshops, mock interviews, soft skills enhancement, and resume-building sessions.',
      },
      {
        title: 'Internships & On-the-Job Training',
        text: 'Practical exposure through internships with reputed brands to prepare students for real-world challenges.',
      },
    ],
  },
  successStories: {
    heading: 'Success Stories',
    body: 'Our alumni have successfully secured positions in renowned organizations worldwide. Their journeys inspire our current students to aim high and achieve their career aspirations.',
    closingHeading: 'Join Us & Take Off to a Bright Future!',
    closingBody:
      'Enroll at Kite Institute of Aviation & Hospitality and let us help you achieve your dream career. Contact our placement cell today to explore exciting career opportunities!',
  },
};

fs.writeFileSync(path.join(outDir, 'home.json'), `${JSON.stringify(home, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, 'placement.json'), `${JSON.stringify(placement, null, 2)}\n`);
console.log('wrote home.json and placement.json');
