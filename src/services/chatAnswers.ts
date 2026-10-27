/**
 * Knowledge base for Sara (Kite virtual assistant).
 * Keys are matching phrases (more words = more specific intent).
 */
export const chatAnswers = {
  // Greetings & small talk (keep light but professional)
  'good morning gm': 'Good morning! Welcome to Kite Institute. How can I help you with our courses or admissions today?',
  'good afternoon ga': 'Good afternoon! I’m Sara — ask me anything about Kite Institute, courses, or placements.',
  'good evening ge': 'Good evening! How can I assist you with aviation or hospitality training at Kite?',
  'good night gn': 'Good night! If you need us tomorrow, we’re here Monday–Saturday, 9 AM–6 PM. Take care!',
  'Iam good glad doing great doing well': 'I’m glad to hear that! What would you like to know about Kite Institute?',
  'how are you how are you? how are you': 'I’m doing well, thank you — ready to help you with Kite Institute. What’s on your mind?',
  'goodbye bye see you later': 'Goodbye! We’d love to see you at our campus or hear from you at enquiry@kiteaviation.in.',
  'take care': 'You too — and feel free to reach us anytime at +91 70228 33935.',
  'I feel sick': 'Sorry you’re not feeling well. Please rest and take care. For institute-related questions, I’m here when you’re back.',
  "I'm feeling unwell": 'Hope you recover soon. When you’re ready, I can help with course or admission queries.',
  "I'm not okay": 'I’m here to help with institute information whenever you need it. Take care of yourself.',
  "I'm not feeling well": 'Wishing you a quick recovery. For anything about Kite’s courses, ask anytime.',
  'help me Iam confused':
    'No problem. Tell me whether you’re looking for courses, fees, placements, or how to visit — or call +91 70228 33935 for a quick chat.',
  'happy birthday hb': 'Happy birthday! 🎂 If you’re considering a career in aviation, we’d love to tell you about our programs.',
  'congratulations congrats': 'Congratulations! If we can help with your next step in aviation or hospitality training, just ask.',
  'thank you thanks thx':
    'You’re welcome! If you need course details, fees, or a campus visit, I’m here — or visit the Courses page on our website.',
  'how old are you how old are you?':
    'I’m Sara, Kite’s virtual assistant — always up to date with our latest courses and campus info.',
  'good luck all the best': 'Thank you! Wishing you the best in your aviation journey — we’re here to support you.',
  'suggest some courses I am looking for an aviation course can you please suggest some course?':
    'Here are programs we offer at Kite Institute:\n\n' +
    '1. Kite Diploma in Aviation, Hospitality & Travel Management (12 months)\n' +
    '2. Foundation in Travel & Tourism with Amadeus (8 months)\n' +
    '3. Passenger Ground Services (6 months)\n' +
    '4. Airport Ramp Services Training (6 months)\n' +
    '5. Airport Operations Fundamentals (6 months)\n' +
    '6. Cargo Introductory Course (6 months)\n\n' +
    'Browse full details on our Courses page or call +91 70228 33935 for counselling.',
  'are you a robot':
    'I’m Sara, Kite’s AI assistant — I answer from our official information so you get reliable guidance quickly.',
  "who's your favorite human": 'Our students and counsellors — they keep aviation dreams flying!',
  'do you sleep': 'I’m available whenever you open the chat — our team is available Mon–Sat, 9 AM–6 PM.',
  'sing me a song': 'I’ll stick to course advice! Ask me about diplomas, ground services, or placements instead.',
  'Can you please assist':
    'Absolutely. I can explain courses, fees, eligibility, placements, and how to reach us. What do you need first?',
  'bad words profanity abuse':
    'Let’s keep our chat respectful. I’m here to help with Kite Institute — courses, admissions, and careers.',
  'insult swear words rude language':
    'Please use polite language. I’m happy to help with institute-related questions.',
  'offensive words inappropriate language':
    'Let’s keep the conversation positive. Ask me about Kite’s programs or campus anytime.',
  'who is your dad mom father sugesh sugesh raghavan':
    'Sara is powered by technology built for Kite Institute. For course details, our team is the best contact: +91 70228 33935.',
  'who created you invented designed website':
    'I’m Sara, Kite’s assistant for prospective students. For website or partnership queries, email enquiry@kiteaviation.in.',
  'who created website who made website developer sugesh sugeshonline built this site web':
    'This website was created by Sugesh Raghavan for Kite Institute of Aviation & Hospitality.',
  'do you have feelings': 'I’m focused on giving you clear, helpful answers about Kite Institute!',
  'hello hi hey': 'Hello! I’m Sara from Kite Institute of Aviation & Hospitality. How can I help you today?',
  '12th pass is the only criteria to apply?':
    'For most programs, 12th pass (or equivalent) is required; some courses also list age limits. Tell me which course you’re interested in and I’ll point you to the right eligibility.',
  'Passenger Ground Services Course at Kite':
    'Our Passenger Ground Services program prepares you for check-in, boarding, airport operations, security awareness, and customer service. Duration: 6 months (Mon–Fri). Eligibility: 12th pass or graduate, typically age 18–25. Certificates include Skill India and IATA. Call +91 70228 33935 or email enquiry@kiteaviation.in.',
  'Foundation in Travel & Tourism with Amadeus':
    'This 8-month program covers travel documentation, air ticketing, tourism services, customer excellence, and hands-on Amadeus GDS. Eligibility: 12th pass or graduate, age 18–25. Contact us for the next batch and fee details.',
  'Cargo Supply Chain & Transport Modes':
    'We now offer the Cargo Introductory Course (6 months) covering air cargo basics, handling, safety, and documentation. For cargo and logistics careers, we’ll guide you on the best fit — call +91 70228 33935.',
  'Airport Ramp Services Training':
    'Ramp training focuses on safe aircraft turnaround, ground handling, and IATA-aligned procedures. Six months, Mon–Fri. Great for careers in airport/airline ground operations. Contact +91 70228 33935 for intake details.',
  'Advanced Course in Logistics & Supply Chain Management?':
    'Our Airport Operations Fundamentals (6 months) covers airport layout, operations, safety, security, and airport business basics. Ask us how it fits your goals.',
  "how are you how's it going what's up whats up?": 'Doing great — ready to help with Kite Institute. What would you like to know?',
  'what is your name? who are you? who are you your name':
    'I’m Sara, the virtual assistant for Kite Institute of Aviation & Hospitality in Bengaluru.',
  'bye goodbye': 'Goodbye! Visit us at Kite Aviation Institute, Koramangala, or write to enquiry@kiteaviation.in.',
  'fee structure fees':
    'Fees depend on the course and current batch. For accurate fee structure, instalments, and offers, please call +91 70228 33935 or email enquiry@kiteaviation.in — our counsellors will guide you.',
  'what courses do you offer course':
    'We offer diploma and certificate programs in aviation, hospitality, travel, ground handling, and airport operations — including Amadeus GDS, passenger ground services, ramp services, airport operations, and cargo. See the Courses section on our site for full list and durations.',
  'what is the eligibility for the Kite Diploma Course in Aviation & Hospitality Management ':
    'Kite Diploma (Aviation, Hospitality & Travel Management): typically 12th pass or pursuing, plus age 18–25; Skill India certification applies. Confirm current criteria with admissions.',
  'what is the eligibility for the Advanced Course in Logistics and Supply Chain Management':
    'Airport Operations Fundamentals: 12th pass or graduate, age 18–25. Verify with admissions for the latest batch.',
  'what is the eligibility for the Airport Ramp Services Training at Kite':
    'Airport Ramp Services Training: 12th pass or graduate, age 18–25. Contact us for the next batch.',
  'what is the eligibility for the Cargo Supply Chain & Transport Modes':
    'Cargo Introductory Course: 12th pass or graduate, age 18–25. Call for details.',
  'what is the eligibility for Foundation in Travel & Tourism with Amadeus':
    'Foundation in Travel & Tourism with Amadeus: 12th pass or graduate, age 18–25.',
  'what is the eligibility for the advanced diploma in logistics':
    'For logistics and airport operations tracks, eligibility is usually 12th pass or graduate with age 18–25 — confirm with our team for your chosen program.',
  'do you provide placement support':
    'Yes — we provide placement assistance and career support for our students, with strong industry connections. Ask our team for the latest placement track record.',
  'do you offer skill india certification':
    'Yes — our courses are aligned with Skill India; specific certificates vary by program (Skill India, IATA, About Kite verification, etc.).',
  'do you offer government-recognized certificates':
    'We offer industry-recognised training including Skill India and IATA-aligned components where applicable. Government recognition details (e.g. AASSC) are shared during counselling — ask admissions for your course.',
  'do you offer interview training?':
    'Yes — we include interview preparation, mock sessions, and grooming as part of our diploma and related modules. Ask for the Interview Training Program details if you want a focused module.',
  'what is the duration of the interview training program':
    'Focused interview training modules are often around 1 month; diploma students also get interview skills throughout the course. Confirm exact duration with your counsellor.',
  'what topics are covered in the interview training program':
    'Topics include interview etiquette, airline-style selection, grooming, communication, group discussion, and mock interviews.',
  'how can I apply for admission':
    'Fill out our enquiry form on the website or visit the campus. You’ll submit documents, meet a counsellor, and get batch details. Call +91 70228 33935 to book a visit or online session.',
  'can I pay the fees in installments installment':
    'Yes — we offer instalment options for many programs. Our counsellor will explain the plan for your chosen course.',
  'where is your institute located':
    'Kite Aviation Institute — No. 1/2, 3rd Floor, Kalayanamantapa Road, Jakkasandra, Koramangala 1st Block, Bengaluru 560034, Karnataka. Phone: +91 70228 33935.',
  'what are the fees for the diploma courses':
    'Diploma fees vary by program and intake. Please call +91 70228 33935 or email enquiry@kiteaviation.in for the latest fee and instalment plan.',
  'can I schedule an online counseling session':
    'Yes — we can arrange counselling online or on campus. Call +91 70228 33935 or email enquiry@kiteaviation.in with your preferred time.',
  'when can I visit the institute':
    'We’re open Monday to Saturday, 9 AM to 6 PM. Let us know your preferred date so we can assign a counsellor.',
  'thank you thanks':
    'You’re welcome! If you need anything else about Kite Institute, I’m here — or visit our Courses and Contact pages.',
  'what is your contact number?': 'You can reach us at +91 70228 33935.',
  'what is your email address?': 'Write to us at enquiry@kiteaviation.in.',
  'how can I get more details about a course? yes yes I am how can I contact your email':
    'Call +91 70228 33935 or email enquiry@kiteaviation.in — we’ll send brochure details and batch dates.',
  'do you offer weekend or online classes?':
    'We offer structured weekday batches; weekend or online options may be available for selected programs — ask admissions for the current schedule.',
  'is there any age limit for the courses?':
    'Most programs target candidates around 18–25 years; diploma may allow slightly different ranges. Confirm for your programme with admissions.',
  'do you provide scholarships or discounts?':
    'We sometimes run scholarships and offers — ask our counsellor during your enquiry for active schemes.',
  'what is aviation?':
    'Aviation is the industry of flying and supporting aircraft — airlines, airports, safety, ground handling, and passenger service. Kite trains you for roles in this sector.',
  'what is hospitality management?':
    'Hospitality management covers guest service in hotels, airlines, and travel — communication, grooming, and guest handling. It’s a core part of our diploma.',
  'what is logistics and supply chain management?':
    'It’s the movement and storage of goods — including air cargo. Our cargo and airport programs introduce you to this field.',
  'what are the career opportunities after completing a course?':
    'Graduates pursue cabin crew, airport ground staff, travel ticketing, cargo, ramp operations, and hospitality roles — depending on the programme and your profile.',
  'what skills are required for a career in aviation?':
    'Communication, grooming, customer focus, teamwork, English fluency, and discipline — all skills we train at Kite.',
  'how can I prepare for an aviation career?':
    'Choose a recognised programme, work on fitness and communication, and consider swimming for cabin crew. We can help you pick the right course — call us.',
  'do you have any social media handles?':
    'Yes — follow Kite Institute on Facebook, Instagram, and LinkedIn for updates, events, and student stories.',
  'how can I stay updated with your latest news?':
    'Follow our social channels, check the News section on the website, or subscribe to our updates via enquiry.',
  'i love you': 'That’s kind of you! I’m here to help with Kite Institute — courses, admissions, and careers.',
  'do love me': 'I appreciate the friendly chat! Let me know how I can help with your education plans.',
  'will you marry me': 'I’ll stick to career advice! Ask me about our diploma or ground services courses instead.',
  'do you have a boyfriend girlfriend': 'I’m here for institute info — what would you like to know about Kite?',
  'are you real': 'I’m a virtual assistant with real information about Kite Institute.',
  'what do you look like': 'You’ll see our friendly team when you visit the campus!',
  'are you human': 'I’m Sara, an AI assistant — our human counsellors are available on phone and email.',
  'do you eat dinner breakfast lunch dinner? breakfast? lunch?':
    'I don’t run on meals — but our campus team can share canteen and nearby options when you visit!',
  'what is the speed of a commercial airplane':
    'Most jets cruise near 900 km/h (560 mph). For cabin crew training, we focus on safety and service — not the physics exam!',
  'which is the largest passenger plane': 'The Airbus A380 is among the largest passenger aircraft.',
  'what is the fastest jet in the world':
    'The SR-71 Blackbird is famous for extreme speed — your focus for a career is training and skills we teach at Kite.',
  'how do airplanes fly':
    'Lift, thrust, drag, and weight — basic aerodynamics. Our courses focus on passenger service and airport operations.',
  'what is the safest airline':
    'Safety ratings change yearly — major international carriers invest heavily in safety. We prepare you for industry standards.',
  'how high do airplanes fly': 'Typically 30,000–40,000 ft cruise altitude.',
  'why do planes leave white trails in the sky':
    'Condensation trails from engine exhaust in cold air — interesting for aviation enthusiasts!',
  'what is the black box in an airplane':
    'Flight recorders for investigation — safety and emergency training is part of our aviation modules.',
  'how many airports are there in the world': 'Tens of thousands worldwide — India’s aviation growth means many career opportunities.',
  'which is the busiest airport in the world':
    'Rankings vary by year — hubs like Atlanta, Dubai, and others are often near the top.',
  'how to become a cabin crew':
    'Build communication, grooming, fitness, and swimming skills; complete professional training. Our diploma includes aviation, hospitality, and interview prep. Call +91 70228 33935.',
  'where is kite institute of aviation & hospitality located your office location address':
    'Kite Institute of Aviation & Hospitality — Venus Building, 3rd Floor, 3rd Main, Kalyanamantappa, Jakkasandra, Koramangala, Bengaluru 560034. Phone: +91 70228 33935.',
  'how can i contact kite institute of aviation & hospitality':
    'Phone: +91 70228 33935 · Email: enquiry@kiteaviation.in · Visit: Koramangala, Bengaluru (see Contact page for map).',
  'Where is the campus located? Where is the campus located location':
    'Campus: Koramangala, Bengaluru — same address as on our Contact page. We recommend scheduling a visit.',
  'ok okey okay understood': 'Got it — ask if you need anything else about Kite Institute.',
  'Hostel facility available? Do you provide hostel facility? Hostal':
    'Yes — hostel accommodation is available for students. Please confirm availability and charges with admissions when you enquire.',

  // Extra institute topics (better matching)
  'about kite institute why choose kite institute mission vision':
    'Kite Institute of Aviation & Hospitality trains students for aviation, hospitality, and travel careers with practical skills, industry-aligned modules, and placement support. We focus on grooming, communication, and hands-on learning in Bengaluru.',
  'timings office hours working hours open close':
    'We’re open Monday to Saturday, 9:00 AM to 6:00 PM. Call before visiting if you need a specific counsellor.',
  'what is airport operations fundamentals course':
    'Airport Operations Fundamentals (6 months) covers airport layout, aircraft and ground operations, safety, security, and airport business basics — ideal for airport operations careers.',
  'what is the eligibility for passenger ground services':
    'Passenger Ground Services: typically 12th pass or graduate, age 18–25. Confirm with admissions for the current batch.',
  'amadeus training gds course':
    'Our Foundation in Travel & Tourism includes hands-on Amadeus GDS training for reservations and ticketing. Ask for batch timings.',
  'certificate verification verify certificate online':
    'Students can verify course certificates through Kite’s secure online portal — see our website or ask admissions for the verification link.',
  'swimming pool training cabin crew':
    'Swimming is important for cabin crew — our diploma includes swimming as part of preparation for airline requirements.',
  'biggest center infrastructure facility':
    'Kite features a large training centre (9000+ sq ft) with modern classrooms and facilities — visit us to see the campus.',
};
