import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Carousel = () => {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Imágenes de ejemplo (el usuario las reemplazará por sus diseños)
  const slides = [
    {
      desktop: "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=1470",
      mobile: "https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=600",
      title: "Ofertas de Verano"
    },
    {
      desktop: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=1470",
      mobile: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=600",
      title: "Cuidado Personal"
    }
  ];

  const nextSlide = () => setCurrent(prev => prev === slides.length - 1 ? 0 : prev + 1);
  const prevSlide = () => setCurrent(prev => prev === 0 ? slides.length - 1 : prev - 1);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    const timer = setInterval(() => nextSlide(), 5000);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="carousel-container">
      <div className="carousel-inner" style={{ transform: `translateX(-${current * 100}%)` }}>
        {slides.map((slide, index) => (
          <div key={index} className="carousel-slide">
            <img 
              src={isMobile ? slide.mobile : slide.desktop} 
              alt={slide.title} 
              className="carousel-image"
            />
            <div className="carousel-caption">
              <h2>{slide.title}</h2>
              <button className="btn-orange">Ver Ofertas</button>
            </div>
          </div>
        ))}
      </div>
      
      <button className="carousel-btn prev" onClick={prevSlide}><ChevronLeft /></button>
      <button className="carousel-btn next" onClick={nextSlide}><ChevronRight /></button>

      <div className="carousel-dots">
        {slides.map((_, i) => (
          <span key={i} className={`dot ${current === i ? 'active' : ''}`} onClick={() => setCurrent(i)}></span>
        ))}
      </div>

      <style>{`
        .carousel-container {
          position: relative;
          width: 100%;
          height: ${isMobile ? '300px' : '500px'};
          overflow: hidden;
          background: #eee;
        }
        .carousel-inner {
          display: flex;
          transition: transform 0.5s ease-in-out;
          height: 100%;
        }
        .carousel-slide {
          min-width: 100%;
          height: 100%;
          position: relative;
        }
        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .carousel-caption {
          position: absolute;
          bottom: 40px;
          left: 10%;
          color: white;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
          z-index: 10;
        }
        .carousel-caption h2 {
          font-size: ${isMobile ? '1.5rem' : '2.5rem'};
          margin-bottom: 15px;
          font-weight: 900;
        }
        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.3);
          border: none;
          color: white;
          padding: 15px;
          cursor: pointer;
          border-radius: 50%;
          display: flex;
          backdrop-filter: blur(5px);
          transition: background 0.3s;
        }
        .carousel-btn:hover { background: rgba(0,161,155,0.8); }
        .prev { left: 20px; }
        .next { right: 20px; }
        .carousel-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
        }
        .dot {
          width: 12px;
          height: 12px;
          background: rgba(255,255,255,0.5);
          border-radius: 50%;
          cursor: pointer;
        }
        .dot.active { background: var(--primary); width: 30px; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Carousel;
