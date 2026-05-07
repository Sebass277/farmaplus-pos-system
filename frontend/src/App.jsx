import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Ecommerce from './pages/Ecommerce';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [cart, setCart] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    socket.on('stock_alert', (data) => {
      setAlerts(prev => [...prev, data]);
    });
    return () => socket.off('stock_alert');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item);
    } else {
      newCart = [...cart, { ...product, cantidad: 1 }];
    }
    setCart(newCart);
    showToast(`Agregado`);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000); // Duración más corta
  };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar user={user} onLogout={handleLogout} cartCount={cart.reduce((acc, item) => acc + item.cantidad, 0)} />
        
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Ecommerce addToCart={addToCart} />} />
            <Route path="/carrito" element={<Cart cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} user={user} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route 
              path="/dashboard/*" 
              element={user && (user.role === 'Administrador' || user.role === 'Cajero') ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>

        <Footer />

        {/* Toast Notification - Movida a la derecha superior */}
        {toast && (
          <div className="fade-in-fast" style={{ position: 'fixed', top: '100px', right: '20px', background: 'var(--secondary)', color: 'white', padding: '12px 25px', borderRadius: '10px', zIndex: 2000, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }}></div>
            {toast}
          </div>
        )}
        
        {/* Alerts UI */}
        <div style={{ position: 'fixed', top: 100, right: 20, zIndex: 1000 }}>
          {alerts.map((alert, idx) => (
            <div key={idx} className="glass fade-in" style={{ padding: '20px', marginBottom: '15px', borderLeft: '5px solid var(--danger)', minWidth: '320px' }}>
              <p style={{ fontWeight: '800', color: 'var(--text-dark)' }}>{alert.message}</p>
              <button onClick={() => setAlerts(alerts.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', marginTop: '10px' }}>Cerrar</button>
            </div>
          ))}
        </div>
      </div>
    </Router>
  );
}

export default App;
