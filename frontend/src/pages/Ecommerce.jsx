import React, { useState, useEffect } from 'react';
import { Search, Eye, X } from 'lucide-react';
import Carousel from '../components/Carousel';
import API_URL from '../api';

const Ecommerce = ({ addToCart, socket }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = () => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();

    if (socket) {
      socket.on('products_updated', () => {
        console.log('🔄 Sincronizando tienda en tiempo real...');
        fetchProducts();
      });
      return () => socket.off('products_updated');
    }
  }, [socket]);

  // Solo mostrar productos que NO estén en nivel crítico (Stock > Stock Mínimo)
  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) && 
    p.stock_actual > p.stock_minimo
  );

  return (
    <div className="fade-in">
      {/* Carrusel integrado en la parte superior */}
      <Carousel products={products} addToCart={addToCart} />

      <div style={{ padding: '3% 5%' }}>
        <header style={{ marginBottom: '5%', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', color: 'var(--primary)', marginBottom: '1%' }}>Nova Salud</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 2vw, 1.3rem)' }}>Cuidamos tu salud con los mejores productos y precios.</p>
        
        <div style={{ position: 'relative', maxWidth: '750px', width: '90%', margin: '4% auto' }}>
          <Search style={{ position: 'absolute', left: '3%', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={24} />
          <input 
            type="text" 
            placeholder="¿Qué estás buscando hoy? (ej. Panadol, Vitaminas...)" 
            className="input-field" 
            style={{ width: '100%', paddingLeft: '8%', height: '60px', fontSize: '1.1rem', borderRadius: '30px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="card-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="glass product-card fade-in">
            <img src={product.imagen} alt={product.nombre} className="product-image" />
            <div style={{ padding: '4% 0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-dark)', height: '2.5rem', overflow: 'hidden' }}>{product.nombre}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '2% 0' }}>{product.unidad}</p>
              <div style={{ margin: '5% 0' }}>
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

      </div>
    </div>
  );
};

export default Ecommerce;
