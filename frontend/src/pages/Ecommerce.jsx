import React, { useState, useEffect } from 'react';
import { Search, Eye, X } from 'lucide-react';
import Carousel from '../components/Carousel';
import API_URL from '../api';

const Ecommerce = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const filteredProducts = products.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      {/* Carrusel integrado en la parte superior */}
      <Carousel />

      <div style={{ padding: '40px 5%' }}>
        <header style={{ marginBottom: '50px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '10px' }}>Nova Salud</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Cuidamos tu salud con los mejores productos y precios.</p>
        
        <div style={{ position: 'relative', maxWidth: '700px', margin: '40px auto' }}>
          <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={24} />
          <input 
            type="text" 
            placeholder="¿Qué estás buscando hoy? (ej. Panadol, Vitaminas...)" 
            className="input-field" 
            style={{ width: '100%', paddingLeft: '60px', height: '60px', fontSize: '1.1rem', borderRadius: '30px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="card-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="glass product-card fade-in">
            <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px', zIndex: 10 }}>
                <button onClick={() => setSelectedProduct(product)} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '50%', padding: '8px', cursor: 'pointer', color: 'var(--primary)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <Eye size={18} />
                </button>
            </div>
            <img src={product.imagen} alt={product.nombre} className="product-image" />
            <div style={{ padding: '10px 0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-dark)', height: '40px', overflow: 'hidden' }}>{product.nombre}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '5px 0' }}>{product.unidad}</p>
              <div style={{ margin: '15px 0' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)' }}>S/ {product.precio.toFixed(2)}</span>
              </div>
              {product.stock_actual > 0 ? (
                  <button className="btn-primary" style={{ width: '100%', padding: '12px' }} onClick={() => addToCart(product)}>Agregar al Carrito</button>
              ) : (
                  <div className="badge badge-low-stock" style={{ textAlign: 'center', display: 'block', padding: '10px' }}>Agotado</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detalles */}
      {selectedProduct && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
              <div className="glass fade-in" style={{ width: '550px', padding: '40px', position: 'relative' }}>
                  <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f0f0f0', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>
                      <X size={20} />
                  </button>
                  <img src={selectedProduct.imagen} alt={selectedProduct.nombre} style={{ width: '100%', height: '300px', objectFit: 'contain', marginBottom: '30px' }} />
                  <h2 style={{ color: 'var(--primary)', fontSize: '1.8rem', fontWeight: '800' }}>{selectedProduct.nombre}</h2>
                  <p style={{ margin: '15px 0', fontSize: '1.1rem', color: 'var(--text-muted)' }}>Presentación: {selectedProduct.unidad}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
                      <span style={{ fontWeight: '900', fontSize: '2rem', color: 'var(--text-dark)' }}>S/ {selectedProduct.precio.toFixed(2)}</span>
                      {selectedProduct.stock_actual > 0 ? (
                        <button className="btn-primary" style={{ padding: '15px 30px' }} onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>Añadir al Carrito</button>
                      ) : (
                        <span className="badge badge-low-stock">Sin Stock</span>
                      )}
                  </div>
              </div>
          </div>
      )}
      </div>
    </div>
  );
};

export default Ecommerce;
