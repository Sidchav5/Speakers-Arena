// src/components/Navbar.js
import React, { useEffect, useMemo, useState } from 'react';
import './Navbar.css';
import brandLogo from '../Images/Final_Logo.jpg';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleResize = () => {
      if (window.innerWidth > 900 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

  const navLinks = useMemo(
    () => [
      { name: 'About', href: '#about', id: 'about' },
      { name: 'Arena', href: '#arena', id: 'arena' },
      { name: 'Services', href: '#services', id: 'services' },
      { name: 'Modules', href: '#outcomes', id: 'outcomes' }
    ],
    []
  );

  const scrollToSection = (sectionId, linkName) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveLink(linkName);
      setIsMobileMenuOpen(false);
      
      // Update URL without reload
      window.history.pushState(null, '', `#${sectionId}`);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Prevent body scroll when mobile menu is open
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.nav-bar')) {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = 'unset';
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Highlight active link based on scroll position
  useEffect(() => {
    const handleActiveLink = () => {
      const sections = navLinks.map(link => document.getElementById(link.id));
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveLink(navLinks[i].name);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleActiveLink);
    handleActiveLink();
    
    return () => window.removeEventListener('scroll', handleActiveLink);
  }, [navLinks]);

  return (
    <>
      <nav className={`nav-bar ${isScrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-container">
          {/* Logo Section */}
          <div className="nav-brand">
            <div className="nav-logo-wrapper">
              <img src={brandLogo} alt="Speaker's Club Logo" className="nav-logo" />
              <div className="logo-glow"></div>
            </div>
            <div className="nav-brand-text">
              <p className="nav-name-text">Speaker's Club</p>
              <p className="nav-subtitle">VIT Pune</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="nav-links-desktop">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={`nav-link ${activeLink === link.name ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.id, link.name);
                }}
              >
                <span className="nav-link-text">{link.name}</span>
                <span className="nav-link-indicator"></span>
              </a>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="toggle-line"></span>
            <span className="toggle-line"></span>
            <span className="toggle-line"></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <div className="mobile-menu-logo">
              <img src={brandLogo} alt="Logo" className="mobile-logo-img" />
              <p>Speaker's Club</p>
            </div>
          </div>
          <div className="mobile-menu-links">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={`mobile-nav-link ${activeLink === link.name ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.id, link.name);
                }}
              >
                <span className="mobile-link-text">{link.name}</span>
                <span className="mobile-link-arrow">→</span>
              </a>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => {
          setIsMobileMenuOpen(false);
          document.body.style.overflow = 'unset';
        }}></div>
      )}
    </>
  );
}

export default Navbar;