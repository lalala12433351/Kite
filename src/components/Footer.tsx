'use client';

import { Link } from '@/lib/router';

// Get base URL for assets
const getAssetUrl = (path) => `${'/'}${path}`;

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <img src={getAssetUrl("icons/footer.svg")} className="footer-art" alt="Kite"/>
      
      <div className="links">
        <Link className="item" to="/">Home</Link>
        <Link className="item" to="/about">About Kite</Link>
        <Link className="item" to="/courses">Courses</Link>
        <Link className="item" to="/placement">Placement</Link>
        <Link className="item" to="/team">Our Team</Link>
        <Link className="item" to="/gallery">Media Gallery</Link>
        <Link className="item" to="/news">News &amp; Updates</Link>
        <Link className="item" to="/blog">Blog</Link>
        <Link className="item" to="/student-hub">Student Hub</Link>
        <Link className="item" to="/careers">Careers</Link>
        <Link className="item" to="/contact">Contact</Link>
      </div>
      
      <ul className="social-media">
        <li>
          <a href="https://www.facebook.com/profile.php?id=61573234114994" target="_blank" rel="noopener noreferrer" className="tooltip-btn">
            <span className="tooltip-txt">Facebook</span>
            <img src={getAssetUrl("icons/facebook-icon-footer.svg")} alt="Facebook"/>
          </a>
        </li>
        <li>
          <a href="https://www.instagram.com/kite.aviation/" target="_blank" rel="noopener noreferrer" className="tooltip-btn">
            <span className="tooltip-txt">Instagram</span>
            <img src={getAssetUrl("icons/instagram-icon-footer.svg")} alt="Instagram"/>
          </a>
        </li>
        <li>
          <a href="https://youtube.com/@kiteaviation?si=wq2QoonNBH62PEwA" target="_blank" rel="noopener noreferrer" className="tooltip-btn">
            <span className="tooltip-txt">YouTube</span>
            <img src={getAssetUrl("icons/youtube-icon-footer.svg")} alt="YouTube"/>
          </a>
        </li>
        <li>
          <a href="https://api.whatsapp.com/send/?phone=919008112707&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="tooltip-btn">
            <span className="tooltip-txt">WhatsApp</span>
            <img src={getAssetUrl("icons/whatsapp-icon-footer.svg")} alt="WhatsApp"/>
          </a>
        </li>
        <li>
          <a href="https://x.com/kiteaviation" target="_blank" rel="noopener noreferrer" className="tooltip-btn">
            <span className="tooltip-txt">X</span>
            <img src={getAssetUrl("icons/twitter-icon-footer.svg")} alt="X"/>
          </a>
        </li>
      </ul>
      
      <div className="copyright">
        © {currentYear} Kite Institute of Aviation & Hospitality. All Rights Reserved. 
        Developed and managed by <Link to="/it-department">Kite IT Department.</Link> 
        <button
          type="button"
          className="footer-privacy-link"
          onClick={() => window.dispatchEvent(new Event('openPrivacyPopup'))}
        >
          Privacy
        </button>
      </div>
    </footer>
  );
}

export default Footer;

