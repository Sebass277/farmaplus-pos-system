import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill, User, LogOut, LayoutDashboard, ShoppingCart, ChevronDown } from 'lucide-react';

const Navbar = ({ user, onLogout, cartCount }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="nav">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--primary)', fontWeight: '900', fontSize: '1.5rem' }}>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '10px', display: 'flex' }}>
            <Pill size={22} />
        </div>
        <span style={{ letterSpacing: '-1px' }}>Nova Salud</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" className="nav-link hide-mobile">Productos</Link>
        
        <Link to="/carrito" style={{ position: 'relative', color: 'var(--text-dark)', display: 'flex' }}>
            <ShoppingCart size={26} />
            {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--secondary)', color: 'white', fontSize: '0.65rem', fontWeight: '900', padding: '2px 5px', borderRadius: '10px', border: '1.5px solid white' }}>
                    {cartCount}
                </span>
            )}
        </Link>
        
        {user ? (
          <div style={{ position: 'relative' }}>
            <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: '5px' }}
            >
              <div style={{ background: 'var(--bg-main)', padding: '8px', borderRadius: '50%', color: 'var(--primary)' }}>
                <User size={20} />
              </div>
              <ChevronDown size={14} className="hide-mobile" />
            </button>

            {menuOpen && (
              <div className="glass fade-in-fast" style={{ position: 'absolute', top: '50px', right: 0, width: '200px', padding: '10px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <p style={{ padding: '10px', fontSize: '0.8rem', fontWeight: '800', borderBottom: '1px solid var(--border)', marginBottom: '5px' }}>{user.username}</p>
                
                {(user.role === 'Administrador' || user.role === 'Cajero') && (
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <LayoutDashboard size={18} /> Mi Panel
                  </Link>
                )}
                
                <button onClick={() => { onLogout(); setMenuOpen(false); }} className="menu-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)', border: 'none', background: 'none', width: '100%', cursor: 'pointer' }}>
                  <LogOut size={18} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '10px 18px', fontSize: '0.9rem' }}>Ingresar</Link>
        )}
      </div>

      <style>{`
        .nav-link {
          text-decoration: none;
          color: var(--text-dark);
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .menu-item {
          text-decoration: none;
          color: var(--text-dark);
          padding: 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: background 0.2s;
        }
        .menu-item:hover {
          background: var(--bg-main);
          color: var(--primary);
        }
        @media (max-width: 600px) {
          .hide-mobile { display: none; }
          .nav { padding: 0 4%; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
