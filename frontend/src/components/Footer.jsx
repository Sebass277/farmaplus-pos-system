import React from 'react';
import { Pill, MapPin, Phone, Mail, Globe, MessageCircle, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: '#fff', borderTop: '1px solid var(--border)', paddingTop: '60px', marginTop: '100px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', padding: '0 5%', paddingBottom: '40px' }}>
        {/* Logo & Bio */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: '900', fontSize: '1.5rem', marginBottom: '20px' }}>
            <Pill size={24} />
            <span>Nova Salud</span>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
            Tu bienestar es nuestra prioridad. Ofrecemos los mejores productos farmacéuticos con la atención que mereces.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <a href="#" className="social-icon" title="Web"><Globe /></a>
            <a href="#" className="social-icon" title="WhatsApp"><MessageCircle /></a>
            <a href="#" className="social-icon" title="Compartir"><Share2 /></a>
          </div>
        </div>

        {/* Links Rápidos */}
        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ marginBottom: '20px', fontWeight: '800' }}>Enlaces</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><a href="/" className="footer-link">Inicio</a></li>
            <li><a href="/tienda" className="footer-link">Productos</a></li>
            <li><a href="#" className="footer-link">Nosotros</a></li>
            <li><a href="#" className="footer-link">Contacto</a></li>
          </ul>
        </div>

        {/* Contacto */}
        <div style={{ flex: '1 1 300px' }}>
          <h4 style={{ marginBottom: '20px', fontWeight: '800' }}>Contacto</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <li style={{ display: 'flex', gap: '10px', color: 'var(--text-muted)' }}>
              <MapPin size={20} className="icon-p" /> Av. Salud Pública 123, Lima
            </li>
            <li style={{ display: 'flex', gap: '10px', color: 'var(--text-muted)' }}>
              <Phone size={20} className="icon-p" /> +51 987 654 321
            </li>
            <li style={{ display: 'flex', gap: '10px', color: 'var(--text-muted)' }}>
              <Mail size={20} className="icon-p" /> consultas@novasalud.com
            </li>
          </ul>
        </div>
      </div>

      {/* Créditos */}
      <div style={{ background: 'var(--bg-main)', padding: '20px 5%', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Nova Salud. Todos los derechos reservados. Desarrollado por <strong>Nova Dev Team</strong>.
        </p>
      </div>

      <style>{`
        .footer-link {
          text-decoration: none;
          color: var(--text-muted);
          transition: color 0.3s;
        }
        .footer-link:hover { color: var(--primary); }
        .social-icon {
          color: var(--primary);
          background: #f0f4f3;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          transition: all 0.3s;
        }
        .social-icon:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-3px);
        }
        .icon-p { color: var(--primary); }
      `}</style>
    </footer>
  );
};

export default Footer;
