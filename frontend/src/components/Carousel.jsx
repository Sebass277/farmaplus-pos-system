import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Carousel = ({ products, addToCart }) => {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleBannerAction = (slide) => {
    if (slide.productId && addToCart && products) {
      const product = products.find(p => p.id === slide.productId);
      if (product) {
        addToCart(product);
      }
    }
  };

  const slides = [
    {
      desktop: '/banners/desktop1.png',
      mobile: '/banners/desktop1.png',
      title: 'Nova Salud - Tu Bienestar'
    },
    {
      desktop: '/banners/desktop2.jpg',
      mobile: '/banners/desktop2.jpg',
      title: 'Oferta: Protector Eucerin',
      productId: 'PROD-001' // ID del Protector Solar
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
              <h2 style={{ fontSize: isMobile ? '1.5rem' : '2.5rem', fontWeight: '900', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{slide.title}</h2>
              <button 
                className="btn-orange" 
                onClick={() => handleBannerAction(slide)}
                style={{ padding: '15px 30px', borderRadius: '30px', fontWeight: '800' }}
              >
                {slide.productId ? 'Añadir a la Bolsa' : 'Ver Catálogo'}
              </button>
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
