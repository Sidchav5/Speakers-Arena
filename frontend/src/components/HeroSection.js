// src/components/HeroSection.js
import React, { useCallback, useEffect, useRef, useState } from 'react';
import myImage1 from './1.Group Formation.png';
import myImage2 from './2.Randomizer.png';
import myImage3 from './3.documents.avif';
import myImage4 from './4.Final_Logo.jpg';
import myImage5 from './5.Vision.jpg';
import myImage6 from './6.event structure.jpg';
import myImage7 from './7.learning outcomes.png';
import myImage8 from './8.prize pool.jpg';
import Navbar from './Navbar';
import './HeroSection.css';

function HeroSection() {
  const highlightsRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const highlightCards = [
    {
      title: 'Brief Description: Speaker\'s Club',
      body: 'Student-driven platform at VIT Pune for public speaking, communication, and critical thinking.',
      image: myImage4 ,
      id: 'club-carousel',
      gradient: 'green'
    },
    {
      title: 'Club Platform and Vision',
      body: 'Build confident speakers, thoughtful listeners, and leaders through workshops, competitions, and peer learning.',
      image: myImage5,
      gradient: 'gold'
    },
    {
      title: 'Detailed Description: Speaker\'s Arena',
      body: 'Flagship intercollegiate Public Speaking and Debate event organized by Speaker\'s Club, VIT Pune.',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80',
      id: 'arena',
      gradient: 'black'
    },
    {
      title: 'Event Structure',
      body: 'Prepared Speaking, Extempore, and Debate rounds evaluate clarity, confidence, logic, and delivery.',
      image:myImage6,
      gradient: 'green'
    },
    {
      title: 'Learning Outcomes',
      body: 'Participants improve stage presence, speaking clarity, listening skills, and analytical thinking.',
      image: myImage7,
      gradient: 'gold'
    },
    {
      title: 'Prize Pool',
      body: 'Total prize pool of Rs. 6500 with exciting rewards, recognition, and certificates.',
      image: myImage8,
      gradient: 'black'
    },
  ];

  const scrollHighlights = useCallback((direction) => {
    const container = highlightsRef.current;
    if (!container) return;

    const firstCard = container.querySelector('.highlight-card');
    const step = (firstCard ? firstCard.offsetWidth : 288) + 24;
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (direction > 0) {
      if (container.scrollLeft + step >= maxScroll - 2) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: step, behavior: 'smooth' });
      }
    } else {
      if (container.scrollLeft - step <= 0) {
        container.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -step, behavior: 'smooth' });
      }
    }
  }, []);

  // Mouse drag scrolling
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - highlightsRef.current.offsetLeft);
    setScrollLeft(highlightsRef.current.scrollLeft);
    highlightsRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (highlightsRef.current) {
      highlightsRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (highlightsRef.current) {
      highlightsRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - highlightsRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    highlightsRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    const autoScroll = setInterval(() => {
      scrollHighlights(1);
    }, 5000);

    return () => clearInterval(autoScroll);
  }, [scrollHighlights]);

  useEffect(() => {
    const container = highlightsRef.current;
    if (container) {
      container.style.cursor = 'grab';
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isDragging, startX, scrollLeft]);

  return (
    <>
      <header className="hero-section">
        <Navbar />
        <div className="hero-banner">
          <div className="hero-badge">
            <span className="badge-icon">⚡</span>
            Speaker's Club Internal Portal
            <span className="badge-icon">⚡</span>
          </div>
          <p className="poster-name">
            Speaker's Arena <span className="gold-text">Execution Desk</span>
          </p>
          <p className="poster-tagline">
            Built for core team operations to execute the event through key services
          </p>
          <div className="hero-cta">
            <button className="cta-primary">
              <span>Open Services</span>
              <span className="cta-arrow">→</span>
            </button>
            <button className="cta-secondary">
              <span>View Workflow</span>
              <span className="cta-arrow">↗</span>
            </button>
          </div>
        </div>
        <div className="hero-highlight-card">
          <div className="highlight-stats">
            <div className="stat">
              <span className="stat-number">80+</span>
              <span className="stat-label">Total Entries</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">100+</span>
              <span className="stat-label">Topics Managed</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">1</span>
              <span className="stat-label">Single Control Panel</span>
            </div>
          </div>
          <p className="prize-highlight">
            ⚡ WE DEBATE, DISCUSS AND DOMINATE ⚡
          </p>
        </div>
        <div className="hero-scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </header>

      <main className="content-wrap">
        <section className="carousel-section" id="about">
          <div className="section-head">
            <div className="section-badge">
              <span className="badge-dot"></span>
              Execution Overview
            </div>
            <h2>Operations <span className="gold-text">Highlights</span></h2>
            <p>Auto-scrolling cards with manual navigation for quick coordinator access</p>
          </div>

          <div className="highlights-shell" aria-label="Highlight cards controls">
            <button
              type="button"
              className="scroll-btn scroll-btn-left"
              onClick={() => scrollHighlights(-1)}
              aria-label="Scroll cards left"
            >
              ←
            </button>

            <div className="highlights-marquee" aria-label="Club and event highlights cards">
              <div 
                className="highlights-track" 
                ref={highlightsRef}
                onMouseEnter={() => highlightsRef.current && (highlightsRef.current.style.cursor = 'grab')}
              >
                {highlightCards.map((card, idx) => (
                  <div
                    className={`card highlight-card gradient-${card.gradient}`}
                    key={`${card.title}-${idx}`}
                    id={card.id ? card.id : undefined}
                  >
                    <div className="card-image-wrapper">
                      <img src={card.image} className="card-img-top" alt={card.title} loading="lazy" />
                      <div className="card-overlay"></div>
                    </div>
                    <div className="card-body">
                      <div className="card-icon">
                        {card.gradient === 'gold' && '🏆'}
                        {card.gradient === 'green' && '🌿'}
                        {card.gradient === 'black' && '⚡'}
                      </div>
                      <h5 className="card-title">{card.title}</h5>
                      <p className="card-text">{card.body}</p>
                      <div className="card-hover-effect"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="scroll-btn scroll-btn-right"
              onClick={() => scrollHighlights(1)}
              aria-label="Scroll cards right"
            >
              →
            </button>
          </div>
          
          <div className="carousel-progress">
            <div className="progress-bar"></div>
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="section-head">
            <div className="section-badge">
              <span className="badge-dot"></span>
              Core Execution Services
            </div>
            <h2>Service <span className="gold-text">Modules</span></h2>
            <p>This platform is specifically for Speaker's Club team members to run the event</p>
          </div>
          <div className="services-horizontal-row" id="outcomes">
            <div className="card service-card" style={{ width: '18rem' }}>
              <img
                src={myImage1}
                className="card-img-top service-image"
                alt="Create groups"
                loading="lazy"
              />
              <div className="card-body">
                <h5 className="card-title">Create Groups</h5>
                <p className="card-text">Create participant groups quickly for smooth round execution and team coordination.</p>
                <a href="/groups" className="btn btn-primary service-btn">Open Module</a>
              </div>
            </div>

            <div className="card service-card" style={{ width: '18rem' }}>
              <img
                src={myImage2}
                className="card-img-top service-image"
                alt="Allocate topics"
                loading="lazy"
              />
              <div className="card-body">
                <h5 className="card-title">Allocate Topics</h5>
                <p className="card-text">Assign prepared speaking, extempore, and debate topics with clear distribution.</p>
                <a href="/topics" className="btn btn-primary service-btn">Open Module</a>
              </div>
            </div>

            <div className="card service-card" style={{ width: '18rem' }}>
              <img
                src={myImage3}
                className="card-img-top service-image"
                alt="Important documents"
                loading="lazy"
              />
              <div className="card-body">
                <h5 className="card-title">Important Documents</h5>
                <p className="card-text">Access rules, schedules, checklists, and judging sheets from one place.</p>
                <a href="#" className="btn btn-primary service-btn">View Documents</a>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}

export default HeroSection;
