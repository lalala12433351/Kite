/**
 * Shared course data for CourseSection and CourseDetail.
 * Image paths are relative; use getAssetUrl(course.image) in components.
 */
export const courses = [
  {
    id: 1,
    image: 'icons/course-img1.jpg',
    title: 'Kite Diploma Course in Aviation, Hospitality and Travel Management',
    duration: '12 Months, 5 days/week (Mon- Fri) 2 hours',
    shortDesc: "India's aviation industry is soaring towards unprecedented growth, with projections of 400 new airports and 300 additional aircraft in the next decade.",
    eligibility: ['12th Pass or Pursuing & Graduates', 'Age: 18 - 25 Years', 'Skill India Certification'],
    certificates: [
      { name: 'Skill India', url: 'https://www.skillindiadigital.gov.in/', className: 'skill-india' },
      { name: 'IATA', url: 'https://www.iata.org/', className: 'iata' },
      { name: 'About Kite', url: '#', className: 'kite', isInternal: true }
    ],
    kpis: [
      { label: 'Big Center', value: '9000 Sq Ft' },
      { label: 'Placements', value: '5000+' },
      { label: 'Hiring Partners Onboard', value: '500+' },
      { label: 'Highest Monthly CTC Offered', value: '1 Lac+' }
    ],
    modules: [
      { title: 'English Enhancer', desc: 'As the name suggests, this course is designed to enhance students\' pronunciation, intonation, and fluency in English. It is highly interactive, focusing on developing essential skills such as public speaking and group discussions — crucial for succeeding in interviews.' },
      { title: 'Grooming', desc: 'This course equips students with essential grooming skills tailored for the aviation & hospitality industries. Key topics include skin and hair care, mastering both western and traditional attire, dental hygiene, and professional makeup techniques.' },
      { title: 'Personality Development', desc: 'This interactive course is designed to develop key personality traits essential for success in a professional environment. It covers areas such as fostering a positive attitude, managing anger, enhancing empathy, boosting motivation, and stress management.' },
      { title: 'Aviation', desc: 'This comprehensive course is meticulously designed to prepare students for a dynamic career as cabin crew members. The program delves into every facet of aviation hospitality, encompassing in-depth training on flight safety protocols, emergency procedures, and passenger management.' },
      { title: 'Hospitality Management', desc: 'This module equips students with the essential skills needed in the hospitality industry. Topics covered include managing guest arrivals, check-ins and check-outs, and handling various payment methods.' },
      { title: 'Customer Relationship Management', desc: 'This essential course focuses on developing customer handling skills. Students are introduced to various customer types and their specific needs, while learning the key elements that make customer service exceptional.' },
      { title: 'Interviewing Skills', desc: 'As the name suggests, this course prepares students to confidently face and clear various types of interviews. It covers impromptu speaking, mock interviews, group discussions, and the importance of positive body language.' },
      { title: 'Swimming', desc: 'Swimming is a vital skill, particularly for those aspiring to join an international airline. All international airlines, as well as some domestic ones, require their crew members to be proficient swimmers.' },
      { title: 'Placement assistance', desc: 'Our course offers comprehensive placement assistance to help students secure rewarding career opportunities. With guidance from industry experts and access to a vast network of employers, students are supported throughout their job search.' }
    ]
  },
  {
    id: 2,
    image: 'icons/course-img2.jpg',
    title: 'Foundation in Travel & Tourism with Amadeus',
    duration: '8 Months, 5 days/week (Mon-Fri) 2 hours',
    shortDesc: 'This program covers the fundamental aspects of the travel and tourism industry, including travel documentation, air ticketing, tourism services, customer service, and hands-on Amadeus GDS training.',
    eligibility: ['12th Pass &amp; Graduate', 'Age: 18-25 Years'],
    certificates: [
      { name: 'Skill India', url: 'https://www.skillindiadigital.gov.in/', className: 'skill-india' },
      { name: 'IATA', url: 'https://www.iata.org/', className: 'iata' },
      { name: 'About Kite', url: '#', className: 'kite', isInternal: true }
    ],
    kpis: [
      { label: 'Big Center', value: '9000 Sq Ft' },
      { label: 'Placements', value: '5000+' },
      { label: 'Hiring Partners Onboard', value: '500+' },
      { label: 'Highest Monthly CTC Offered', value: '1 Lac+' }
    ],
    modules: [
      { title: 'The Role of Travel Professionals', desc: 'Understanding job functions and industry dynamics.' },
      { title: 'Geography & Industry Codes', desc: 'Learn essential location, airport, and airline codes.' },
      { title: 'Travel Documentation', desc: 'Understand passports, visas, and entry requirements.' },
      { title: 'Air Transport & Ticketing', desc: 'Explore airline services, fare structures, and booking systems.' },
      { title: 'Tourism Services', desc: 'Gain knowledge about hotels, car rentals, cruises, and tour packages.' },
      { title: 'Customer Service Excellence', desc: 'Learn strategies to enhance customer experience and loyalty.' },
      { title: 'Amadeus GDS Training', desc: 'Hands-on experience in making reservations, issuing tickets, and managing travel bookings.' }
    ]
  },
  {
    id: 3,
    image: 'icons/course-img3.jpg',
    title: 'Passenger Ground Services Course',
    duration: '6 Months, 5 days/week (Mon-Fri) 2 hours',
    shortDesc: 'This program prepares you for front-line passenger service roles, covering airport operations, check-in, boarding, aviation security, and modern passenger service innovations.',
    eligibility: ['12th Pass &amp; Graduate', 'Age: 18-25 Years'],
    certificates: [
      { name: 'Skill India', url: 'https://www.skillindiadigital.gov.in/', className: 'skill-india' },
      { name: 'IATA', url: 'https://www.iata.org/', className: 'iata' }
    ],
    kpis: [
      { label: 'Big Center', value: '9000 Sq Ft' },
      { label: 'Placements', value: '5000+' },
      { label: 'Hiring Partners Onboard', value: '500+' },
      { label: 'Highest Monthly CTC Offered', value: '1 Lac+' }
    ],
    modules: [
      { title: 'Introduction to Airport and Airline Operations', desc: 'Understanding the aviation ecosystem and how airports and airlines work together.' },
      { title: 'Computer Reservations & Departure Control Systems (CRS & DCS)', desc: 'Learn how to manage bookings, check-ins, and passenger data using modern systems.' },
      { title: 'Passenger & Baggage Check-in Procedures', desc: 'Handle check-in processes at the airport and off-site locations with accuracy and efficiency.' },
      { title: 'Boarding Procedures & Flight Close-out Messaging', desc: 'Ensure smooth passenger boarding and accurate flight close-out communication.' },
      { title: 'Dangerous Goods Regulations Awareness', desc: 'Understand baggage restrictions, safety regulations, and DG awareness for passenger handling.' },
      { title: 'Managing Passenger Interactions', desc: 'Enhance communication skills to handle customer queries, concerns, and special requests.' },
      { title: 'Aviation Security Procedures', desc: 'Learn security protocols for passenger and baggage handling at various touchpoints.' },
      { title: 'Innovations in Passenger Services', desc: 'Explore the latest trends and technologies shaping modern passenger experiences.' }
    ]
  },
  {
    id: 4,
    image: 'icons/course-img4.jpg',
    title: 'Airport Ramp Services Training',
    duration: '6 Months, 5 days/week (Mon-Fri) 2 hours',
    shortDesc: 'This program equips you with the skills required to work on the airport ramp, supporting safe and efficient aircraft turnaround operations.',
    eligibility: ['12th Pass &amp; Graduate', 'Age: 18-25 Years'],
    certificates: [
      { name: 'Skill India', url: 'https://www.skillindiadigital.gov.in/', className: 'skill-india' },
      { name: 'IATA', url: 'https://www.iata.org/', className: 'iata' }
    ],
    kpis: [
      { label: 'Big Center', value: '9000 Sq Ft' },
      { label: 'Placements', value: '5000+' },
      { label: 'Hiring Partners Onboard', value: '500+' },
      { label: 'Highest Monthly CTC Offered', value: '1 Lac+' }
    ],
    modules: [
      { title: 'Ground Operations & Working Environment', desc: 'Comprehend airport ground operations, work areas, and the overall ramp environment.' },
      { title: 'Ramp Operations Terminology', desc: 'Understand standard ramp operations terminology used in day-to-day communication.' },
      { title: 'Airport Departments & Coordination', desc: 'Learn how different airport departments work together to ensure on-time and safe operations.' },
      { title: 'Safety & Security Basics', desc: 'Gain basic knowledge of safety and security services required for efficient ramp operations.' },
      { title: 'Aircraft Ground Servicing Procedures', desc: 'Learn the procedures for key aircraft ground servicing tasks during turnaround.' },
      { title: 'IATA AHM & IGOM Standards', desc: 'Understand the IATA Airport Handling Manual (AHM) and IATA Ground Operations Manual (IGOM) standards that guide ramp activities.' }
    ]
  },
  {
    id: 5,
    image: 'icons/course-img5.jpg',
    title: 'Airport Operations Fundamentals',
    duration: '6 Months, 5 days/week (Mon-Fri) 2 hours',
    shortDesc: 'A comprehensive introduction to airport layout, aircraft and ground operations, safety, security, and the business side of airport management.',
    eligibility: ['12th Pass &amp; Graduate', 'Age: 18-25 Years'],
    certificates: [
      { name: 'Skill India', url: 'https://www.skillindiadigital.gov.in/', className: 'skill-india' },
      { name: 'IATA', url: 'https://www.iata.org/', className: 'iata' },
      { name: 'About Kite', url: '#', className: 'kite', isInternal: true }
    ],
    kpis: [
      { label: 'Big Center', value: '9000 Sq Ft' },
      { label: 'Placements', value: '5000+' },
      { label: 'Hiring Partners Onboard', value: '500+' },
      { label: 'Highest Monthly CTC Offered', value: '1 Lac+' }
    ],
    modules: [
      { title: 'Airport Layout & Infrastructure', desc: 'Understand runways, taxiways, aprons, terminals, and the difference between airside and landside operations.' },
      { title: 'Aircraft & Ground Operations', desc: 'Learn about ATC coordination, ramp operations, aircraft turnaround, and gate management.' },
      { title: 'Safety & Compliance', desc: 'Study key regulations from ICAO and FAA and the principles of Safety Management Systems (SMS).' },
      { title: 'Security & Emergency Management', desc: 'Explore screening, access control, crisis response, and coordination with security agencies.' },
      { title: 'Airport Business Basics', desc: 'Discover airport revenue sources, airline agreements, concessions, and fundamentals of airport financial management.' }
    ]
  },
  {
    id: 6,
    image: 'icons/course-img6.jpg',
    title: 'Cargo Introductory Course',
    duration: '6 Months, 5 days/week (Mon-Fri) 2 hours',
    shortDesc: 'An introductory program to air cargo operations, documentation, safety, and the cargo logistics chain.',
    eligibility: ['12th Pass &amp; Graduate', 'Age: 18-25 Years'],
    certificates: [
      { name: 'Skill India', url: 'https://www.skillindiadigital.gov.in/', className: 'skill-india' },
      { name: 'IATA', url: 'https://www.iata.org/', className: 'iata' }
    ],
    kpis: [
      { label: 'Big Center', value: '9000 Sq Ft' },
      { label: 'Placements', value: '5000+' },
      { label: 'Hiring Partners Onboard', value: '500+' },
      { label: 'Highest Monthly CTC Offered', value: '1 Lac+' }
    ],
    modules: [
      { title: 'Air Cargo Basics', desc: 'Understand cargo types, shipment flow, and key documents such as the Air Waybill (AWB).' },
      { title: 'Cargo Handling & Operations', desc: 'Learn acceptance, screening, storage, and loading procedures at air cargo facilities.' },
      { title: 'Safety & Security in Cargo', desc: 'Gain dangerous goods awareness and learn about regulatory compliance, including ICAO standards.' },
      { title: 'Cargo Logistics Chain', desc: 'Explore the roles of airlines, freight forwarders, ground handlers, and other logistics partners.' },
      { title: 'Customer & Documentation Processes', desc: 'Cover booking, tracking, and basic customs-related procedures for cargo shipments.' }
    ]
  }
];

export function getCourseById(id) {
  const numId = parseInt(id, 10);
  if (!Number.isNaN(numId)) {
    const found = courses.find((c) => c.id === numId);
    if (found) return found;
  }
  return courses.find((c) => String(c.id) === String(id)) || null;
}
