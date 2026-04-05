// src/components/Footer.js
import React, { useState, useEffect } from 'react';
import './Footer.css';

function Footer() {
  const [currentYear, setCurrentYear] = useState(2026);
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const footerLinks = [
    { name: 'About', href: '#about', id: 'about' },
    { name: "Speaker's Club", href: '#club-carousel', id: 'club-carousel' },
    { name: "Speaker's Arena", href: '#arena', id: 'arena' },
    { name: 'Services', href: '#services', id: 'services' },
    { name: 'Modules', href: '#outcomes', id: 'outcomes' }
  ];

  const socialLinks = [
    { name: 'Instagram', icon: '📷', url: 'https://instagram.com' },
    { name: 'LinkedIn', icon: '🔗', url: 'https://linkedin.com' },
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com' },
    { name: 'YouTube', icon: '📺', url: 'https://youtube.com' }
  ];

  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
      
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">🎙️</span>
              <span className="logo-text">Speaker's Club</span>
            </div>
            <p className="brand-description">
              Empowering voices, shaping leaders through the art of public speaking and debate since 2010.
            </p>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label={social.name}
                >
                  <span className="social-icon">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="footer-section">
            <h3 className="footer-section-title">Quick Links</h3>
            <ul className="footer-links">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.id);
                    }}
                    className="footer-link"
                  >
                    <span className="link-arrow">→</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Event Info Section */}
          <div className="footer-section">
            <h3 className="footer-section-title">Event Details</h3>
            <div className="event-info">
              <div className="info-item">
                <span className="info-icon">🏆</span>
                <div className="info-content">
                  <span className="info-label">Competition Type</span>
                  <span className="info-value">Intercollegiate</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🎯</span>
                <div className="info-content">
                  <span className="info-label">Domain</span>
                  <span className="info-value">Public Speaking & Debate</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">👥</span>
                <div className="info-content">
                  <span className="info-label">Organizer</span>
                  <span className="info-value">Speaker's Club, VIT Pune</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">📅</span>
                <div className="info-content">
                  <span className="info-label">Registration Deadline</span>
                  <span className="info-value">March 30, 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="footer-section">
            <h3 className="footer-section-title">Stay Updated</h3>
            <p className="newsletter-text">
              Subscribe to get notified about upcoming events and workshops.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn">
                Subscribe
              </button>
            </form>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <a href="mailto:speakersclub@vitpune.edu.in">speakersclub@vitpune.edu.in</a>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>VIT Pune, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>© {currentYear} Speaker's Club, VIT Pune. All Rights Reserved.</p>
          </div>
          <div className="footer-legal">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); }}>Privacy Policy</a>
            <span className="legal-divider">|</span>
            <a href="#terms" onClick={(e) => { e.preventDefault(); }}>Terms of Service</a>
            <span className="legal-divider">|</span>
            <a href="#cookies" onClick={(e) => { e.preventDefault(); }}>Cookie Policy</a>
          </div>
          <div className="back-to-top">
            <button 
              className="back-to-top-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;