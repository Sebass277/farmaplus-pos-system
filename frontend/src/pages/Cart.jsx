import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react';
import API_URL from '../api';

const Cart = ({ cart, removeFromCart, clearCart, user }) => {
  const navigate = useNavigate();
  const total = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const handleCheckout = () => {
    if (!user) {
      alert('Por favor inicia sesión para completar tu pedido.');
      navigate('/login');
      return;
    }

    const saleData = {
      user_id: user.id,
      items: cart,
      total,
      tipo: 'Ecommerce'
    };

    fetch(`${API_URL}/api/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    })
    .then(res => res.json())
    .then(() => {
      alert('¡Gracias por tu compra! Tu pedido está en camino.');
      clearCart();
      navigate('/');
    });
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '100px 5%', textAlign: 'center' }} className="fade-in">
        <ShoppingBag size={80} style={{ color: 'var(--border)', marginBottom: '20px' }} />
        <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Tu carrito está vacío</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>¡Explora nuestros productos y encuentra lo que necesitas!</p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-flex', padding: '15px 40px', textDecoration: 'none' }}>
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 5%', maxWidth: '1000px', margin: '0 auto' }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
        <Link to="/" style={{ color: 'var(--text-muted)' }}><ArrowLeft /></Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>Tu Carrito</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {cart.map(item => (
          <div key={item.id} className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <img src={item.imagen} alt={item.nombre} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{item.nombre}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.unidad}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontWeight: '700' }}>
                {item.cantidad} x S/ {item.precio.toFixed(2)}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)', minWidth: '100px', textAlign: 'right' }}>
                S/ {(item.cantidad * item.precio).toFixed(2)}
              </div>
              <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '10px' }}>
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        <div className="glass" style={{ padding: '30px', marginTop: '20px', background: 'var(--bg-white)', borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>Total a pagar:</span>
            <span style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-dark)' }}>S/ {total.toFixed(2)}</span>
          </div>
          <button className="btn-orange" onClick={handleCheckout} style={{ width: '100%', padding: '20px', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
            <CreditCard size={24} /> PROCESAR COMPRA
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
