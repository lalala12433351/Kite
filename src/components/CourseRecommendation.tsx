'use client';

import { useState } from 'react';

// Get base URL for assets
const getAssetUrl = (path) => `${'/'}${path}`;

// Course data (should match CourseSection courses)
const courses = [
  {
    id: 1,
    title: 'Kite Diploma Course in Aviation, Hospitality and Travel Management',
    duration: '12 Months, 5 days/week (Mon- Fri) 2 hours',
    shortDesc: "India's aviation industry is soaring towards unprecedented growth, with projections of 400 new airports and 300 additional aircraft in the next decade.",
    eligibility: ['12th Pass or Pursuing & Graduates', 'Age: 18 - 25 Years', 'Skill India Certification'],
    keywords: ['cabin crew', 'aviation', 'hospitality', 'travel', 'diploma', 'comprehensive'],
    minQualification: '12th',
    maxAge: 25,
    minAge: 18
  },
  {
    id: 2,
    title: 'Foundation in Travel & Tourism with Amadeus',
    duration: '8 Months, 5 days/week (Mon-Fri) 2 hours',
    shortDesc: 'This program covers the fundamental aspects of the travel and tourism industry, including travel documentation, air ticketing, tourism services, customer service, and hands-on Amadeus GDS training.',
    eligibility: ['12th Pass & Graduate', 'Age: 18-25 Years'],
    keywords: ['travel', 'tourism', 'amadeus', 'booking', 'foundation', 'ticketing'],
    minQualification: '12th',
    maxAge: null,
    minAge: null
  },
  {
    id: 3,
    title: 'Passenger Ground Services Course',
    duration: '6 Months, 5 days/week (Mon-Fri) 2 hours',
    shortDesc: 'This program prepares you for front-line passenger service roles, covering airport operations, check-in, boarding, aviation security, and modern passenger service innovations.',
    eligibility: ['12th Pass & Graduate', 'Age: 18-25 Years'],
    keywords: ['passenger', 'ground services', 'airport', 'customer service', 'check-in', 'boarding'],
    minQualification: '12th',
    maxAge: 25,
    minAge: 18
  },
  {
    id: 4,
    title: 'Airport Ramp Services Training',
    duration: '6 Months, 5 days/week (Mon-Fri) 2 hours',
    shortDesc: 'This program equips you with the skills required to work on the airport ramp, supporting safe and efficient aircraft turnaround operations.',
    eligibility: ['12th Pass & Graduate', 'Age: 18-25 Years'],
    keywords: ['ramp', 'airport', 'ground operations', 'turnaround'],
    minQualification: '12th',
    maxAge: 25,
    minAge: 18
  },
  {
    id: 5,
    title: 'Airport Operations Fundamentals',
    duration: '6 Months, 5 days/week (Mon-Fri) 2 hours',
    shortDesc: 'An introduction to airport layout, aircraft and ground operations, safety, security, and airport business fundamentals.',
    eligibility: ['12th Pass & Graduate', 'Age: 18-25 Years'],
    keywords: ['airport', 'operations', 'ground operations', 'safety', 'security', 'management'],
    minQualification: '12th',
    maxAge: 25,
    minAge: 18
  },
  {
    id: 6,
    title: 'Cargo Introductory Course',
    duration: '6 Months, 5 days/week (Mon-Fri) 2 hours',
    shortDesc: 'An introductory course on air cargo operations, documentation, safety, and the cargo logistics chain.',
    eligibility: ['12th Pass & Graduate', 'Age: 18-25 Years'],
    keywords: ['cargo', 'air cargo', 'logistics', 'freight'],
    minQualification: '12th',
    maxAge: 25,
    minAge: 18
  }
];

function CourseRecommendation() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    qualification: '',
    age: '',
    interest: '',
    experience: ''
  });
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (field, value) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-advance to next step after a short delay
    setTimeout(() => {
      let currentStep = 0;
      if (field === 'qualification') currentStep = 1;
      else if (field === 'age') currentStep = 2;
      else if (field === 'interest') currentStep = 3;
      else if (field === 'experience') currentStep = 4;
      
      if (currentStep < 4) {
        setStep(currentStep + 1);
      } else {
        // Calculate recommendations for final step
        const updatedAnswers = {
          ...answers,
          [field]: value
        };
        const recommendations = calculateRecommendations(updatedAnswers);
        setRecommendedCourses(recommendations);
        setShowResults(true);
      }
    }, 300);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Calculate recommendations
      const recommendations = calculateRecommendations(answers);
      setRecommendedCourses(recommendations);
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStepClick = (stepNumber) => {
    // Only allow clicking on steps that have been answered or the current step
    const canNavigate = 
      (stepNumber === 1) ||
      (stepNumber === 2 && answers.qualification) ||
      (stepNumber === 3 && answers.qualification && answers.age) ||
      (stepNumber === 4 && answers.qualification && answers.age && answers.interest);
    
    if (canNavigate && !showResults) {
      setStep(stepNumber);
    }
  };

  const handleReset = () => {
    setStep(1);
    setAnswers({
      qualification: '',
      age: '',
      interest: '',
      experience: ''
    });
    setRecommendedCourses([]);
    setShowResults(false);
  };

  const calculateRecommendations = (answers) => {
    let matches = courses.map(course => {
      let score = 0;
      let reasons = [];

      // Qualification matching
      if (answers.qualification) {
        const qual = answers.qualification.toLowerCase();
        if (qual.includes('graduate') || qual.includes('degree')) {
          if (course.minQualification === 'graduate') {
            score += 30;
            reasons.push('Matches your qualification level');
          } else if (course.minQualification === '12th') {
            score += 20;
            reasons.push('You exceed the minimum qualification');
          }
        } else if (qual.includes('12th') || qual.includes('high school')) {
          if (course.minQualification === '12th') {
            score += 30;
            reasons.push('Matches your qualification level');
          }
        }
      }

      // Age matching (for course 1 which has age restrictions)
      if (answers.age && course.id === 1) {
        const age = parseInt(answers.age);
        if (age >= course.minAge && age <= course.maxAge) {
          score += 25;
          reasons.push('Age requirement met');
        } else {
          score -= 15;
          reasons.push('Age may not meet requirements');
        }
      }

      // Interest/Keyword matching
      if (answers.interest) {
        const interest = answers.interest.toLowerCase();
        course.keywords.forEach(keyword => {
          if (interest.includes(keyword)) {
            score += 15;
            reasons.push(`Matches your interest in ${keyword}`);
          }
        });
      }

      // Experience matching
      if (answers.experience) {
        const exp = answers.experience.toLowerCase();
        if (exp.includes('no experience') || exp.includes('beginner')) {
          if (course.id === 1 || course.id === 5 || course.id === 6) {
            score += 10;
            reasons.push('Suitable for beginners');
          }
        } else if (exp.includes('some') || exp.includes('intermediate')) {
          if (course.id === 2 || course.id === 3 || course.id === 4) {
            score += 10;
            reasons.push('Builds on your experience');
          }
        }
      }

      return { course, score, reasons };
    });

    // Sort by score and return top matches
    matches = matches
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 recommendations

    return matches;
  };

  const handleContactUs = (courseTitle) => {
    // Open enquiry form with course pre-selected
    const event = new CustomEvent('openEnquiryForm', { 
      detail: { course: courseTitle, title: 'Get Started' } 
    });
    window.dispatchEvent(event);
  };

  if (showResults) {
    return (
      <div className="course-recommendation">
        <div className="recommendation-header">
          <h2>Recommended Courses for You</h2>
          <button className="btn-reset" onClick={handleReset}>Start Over</button>
        </div>

        {recommendedCourses.length > 0 ? (
          <div className="recommended-courses-modern recommended-courses-single">
            {recommendedCourses.slice(0, 1).map((rec) => (
              <div key={rec.course.id} className="recommended-course-modern featured">
                <div className="course-rank">
                  <span className="rank-badge">Best Match</span>
                </div>
                
                <div className="course-content-modern">
                  <div className="course-header-modern">
                    <h3>{rec.course.title}</h3>
                    <div className="match-indicator">
                      <div className="match-bar">
                        <div 
                          className="match-fill" 
                          style={{ width: `${rec.score}%` }}
                        ></div>
                      </div>
                      <span className="match-percentage">{Math.round(rec.score)}% Match</span>
                    </div>
                  </div>
                  
                  <div className="course-meta">
                    <span className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {rec.course.duration}
                    </span>
                  </div>
                  
                  <p className="course-desc-modern">{rec.course.shortDesc}</p>
                  
                  <div className="match-reasons-modern">
                    <div className="reasons-header">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <strong>Why this course matches you</strong>
                    </div>
                    <div className="reasons-list">
                      {rec.reasons.map((reason, i) => (
                        <div key={i} className="reason-item">
                          <span className="reason-icon">✓</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="btn-contact-modern"
                    onClick={() => handleContactUs(rec.course.title)}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-recommendations">
            <p>Based on your answers, we'd love to help you find the perfect course!</p>
            <button 
              className="btn-contact"
              onClick={() => handleContactUs('')}
            >
              Contact Us for Personalized Guidance
            </button>
          </div>
        )}
        
        <div className="all-programs-message">
          <p>If you want to see all of our programs, they are listed below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-recommendation">
      <div className="recommendation-header">
        <h2>Can I suggest a course for you?</h2>
        <p>Answer a few questions and we'll recommend the best courses for you</p>
      </div>

      <div className="recommendation-steps">
        <div className="step-indicator">
          <span 
            className={`step ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''} ${answers.qualification ? 'completed' : ''}`}
            onClick={() => handleStepClick(1)}
            style={{ cursor: 'pointer' }}
          >1</span>
          <span 
            className={`step ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''} ${answers.age ? 'completed' : ''}`}
            onClick={() => handleStepClick(2)}
            style={{ cursor: answers.qualification ? 'pointer' : 'not-allowed', opacity: answers.qualification ? 1 : 0.5 }}
          >2</span>
          <span 
            className={`step ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''} ${answers.interest ? 'completed' : ''}`}
            onClick={() => handleStepClick(3)}
            style={{ cursor: (answers.qualification && answers.age) ? 'pointer' : 'not-allowed', opacity: (answers.qualification && answers.age) ? 1 : 0.5 }}
          >3</span>
          <span 
            className={`step ${step >= 4 ? 'active' : ''} ${step === 4 ? 'current' : ''} ${answers.experience ? 'completed' : ''}`}
            onClick={() => handleStepClick(4)}
            style={{ cursor: (answers.qualification && answers.age && answers.interest) ? 'pointer' : 'not-allowed', opacity: (answers.qualification && answers.age && answers.interest) ? 1 : 0.5 }}
          >4</span>
        </div>

        <div className="step-content">
          {step === 1 && (
            <div className="question-step">
              <h3>What is your current qualification?</h3>
              <div className="options">
                <label>
                  <input
                    type="radio"
                    name="qualification"
                    value="12th Pass / High School"
                    checked={answers.qualification === '12th Pass / High School'}
                    onChange={(e) => handleAnswer('qualification', e.target.value)}
                  />
                  <span>12th Pass / High School</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="qualification"
                    value="12th Pursuing"
                    checked={answers.qualification === '12th Pursuing'}
                    onChange={(e) => handleAnswer('qualification', e.target.value)}
                  />
                  <span>12th Pursuing</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="qualification"
                    value="Graduate / Degree"
                    checked={answers.qualification === 'Graduate / Degree'}
                    onChange={(e) => handleAnswer('qualification', e.target.value)}
                  />
                  <span>Graduate / Degree</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="qualification"
                    value="Post Graduate"
                    checked={answers.qualification === 'Post Graduate'}
                    onChange={(e) => handleAnswer('qualification', e.target.value)}
                  />
                  <span>Post Graduate</span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="question-step">
              <h3>What is your age?</h3>
              <div className="options">
                <label>
                  <input
                    type="radio"
                    name="age"
                    value="18-25"
                    checked={answers.age === '18-25'}
                    onChange={(e) => handleAnswer('age', e.target.value)}
                  />
                  <span>18-25 years</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="age"
                    value="26-30"
                    checked={answers.age === '26-30'}
                    onChange={(e) => handleAnswer('age', e.target.value)}
                  />
                  <span>26-30 years</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="age"
                    value="31-35"
                    checked={answers.age === '31-35'}
                    onChange={(e) => handleAnswer('age', e.target.value)}
                  />
                  <span>31-35 years</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="age"
                    value="35+"
                    checked={answers.age === '35+'}
                    onChange={(e) => handleAnswer('age', e.target.value)}
                  />
                  <span>35+ years</span>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="question-step">
              <h3>What interests you most?</h3>
              <div className="options">
                <label>
                  <input
                    type="radio"
                    name="interest"
                    value="Cabin Crew & Aviation"
                    checked={answers.interest === 'Cabin Crew & Aviation'}
                    onChange={(e) => handleAnswer('interest', e.target.value)}
                  />
                  <span>Cabin Crew & Aviation</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="interest"
                    value="Logistics & Supply Chain"
                    checked={answers.interest === 'Logistics & Supply Chain'}
                    onChange={(e) => handleAnswer('interest', e.target.value)}
                  />
                  <span>Logistics & Supply Chain</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="interest"
                    value="Airport Operations"
                    checked={answers.interest === 'Airport Operations'}
                    onChange={(e) => handleAnswer('interest', e.target.value)}
                  />
                  <span>Airport Operations</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="interest"
                    value="Travel & Tourism"
                    checked={answers.interest === 'Travel & Tourism'}
                    onChange={(e) => handleAnswer('interest', e.target.value)}
                  />
                  <span>Travel & Tourism</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="interest"
                    value="Customer Service"
                    checked={answers.interest === 'Customer Service'}
                    onChange={(e) => handleAnswer('interest', e.target.value)}
                  />
                  <span>Customer Service</span>
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="question-step">
              <h3>What is your experience level?</h3>
              <div className="options">
                <label>
                  <input
                    type="radio"
                    name="experience"
                    value="No experience / Beginner"
                    checked={answers.experience === 'No experience / Beginner'}
                    onChange={(e) => handleAnswer('experience', e.target.value)}
                  />
                  <span>No experience / Beginner</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="experience"
                    value="Some experience in related field"
                    checked={answers.experience === 'Some experience in related field'}
                    onChange={(e) => handleAnswer('experience', e.target.value)}
                  />
                  <span>Some experience in related field</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="experience"
                    value="Experienced professional"
                    checked={answers.experience === 'Experienced professional'}
                    onChange={(e) => handleAnswer('experience', e.target.value)}
                  />
                  <span>Experienced professional</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* <div className="step-actions">
          {step > 1 && (
            <button className="btn-back" onClick={handleBack}>Back</button>
          )}
          <button 
            className="btn-next" 
            onClick={handleNext}
            disabled={
              (step === 1 && !answers.qualification) ||
              (step === 2 && !answers.age) ||
              (step === 3 && !answers.interest) ||
              (step === 4 && !answers.experience)
            }
          >
            {step === 4 ? 'Get Recommendations' : 'Next'}
          </button>
        </div> */}
      </div>
      
      <div className="all-programs-message">
        <p>If you want to see all of our programs, they are listed below</p>
      </div>
    </div>
  );
}

export default CourseRecommendation;

