import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, BarChart3, AlertTriangle, Eye, Trash2, Plus, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('pos');
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [posCart, setPosCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // New product form state
  const [newProduct, setNewProduct] = useState({
    nombre: '', precio: '', unidad: '', imagen: '', stock_actual: 10, stock_minimo: 5,
    codigo_barras: '', lote: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchReports();
  }, []);

  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  const fetchReports = () => {
    fetch('http://localhost:5000/api/sales/reports')
      .then(res => res.json())
      .then(data => setReports(data));
  };

  const generatePDF = (saleId, items, total) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Nova Salud - Ticket de Venta', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`ID Venta: ${saleId}`, 20, 30);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 20, 35);
    doc.text(`Atendido por: ${user.username}`, 20, 40);

    const tableRows = items.map(item => [
      item.nombre,
      item.cantidad,
      `S/ ${item.precio.toFixed(2)}`,
      `S/ ${(item.cantidad * item.precio).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 50,
      head: [['Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: tableRows,
    });

    const finalY = doc.lastAutoTable.finalY || 50;
    doc.setFontSize(14);
    doc.text(`TOTAL: S/ ${total.toFixed(2)}`, 140, finalY + 20);
    
    doc.save(`Ticket_NovaSalud_${saleId}.pdf`);
  };

  const handlePosSale = () => {
    const total = posCart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const saleData = {
      user_id: user.id,
      items: posCart,
      total,
      tipo: 'Manual'
    };

    fetch('http://localhost:5000/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    })
    .then(res => res.json())
    .then(data => {
      alert('Venta procesada. Descargando ticket...');
      generatePDF(data.sale_id, posCart, total);
      setPosCart([]);
      fetchProducts();
      fetchReports();
    });
  };

  const addToPosCart = (product) => {
    const existing = posCart.find(item => item.id === product.id);
    if (existing) {
      setPosCart(posCart.map(item => item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      setPosCart([...posCart, { ...product, cantidad: 1 }]);
    }
  };

  const removeFromPosCart = (id) => {
    setPosCart(posCart.filter(item => item.id !== id));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    // For this demo, we'll send it to the backend. 
    // I need to create a new route in the backend for this.
    fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
    })
    .then(res => res.json())
    .then(data => {
        alert('Producto agregado exitosamente');
        setNewProduct({ nombre: '', precio: '', unidad: '', imagen: '', stock_actual: 10, stock_minimo: 5, codigo_barras: '', lote: '' });
        fetchProducts();
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
      {/* Sidebar */}
      <nav className="glass" style={{ width: '280px', margin: '20px', padding: '25px', borderRadius: '15px' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '30px', color: 'var(--primary)', fontWeight: '800' }}>PANEL CONTROL</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className={`btn-sidebar ${activeTab === 'pos' ? 'active' : ''}`} onClick={() => setActiveTab('pos')}>
            <ShoppingBag size={20} /> Punto de Venta
          </button>
          <button className={`btn-sidebar ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            <Package size={20} /> Inventario
          </button>
          {user.role === 'Administrador' && (
            <>
              <button className={`btn-sidebar ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                <BarChart3 size={20} /> Reportes
              </button>
              <button className={`btn-sidebar ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
                <Plus size={20} /> Nuevo Producto
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '20px' }}>
        {activeTab === 'pos' && (
          <div style={{ display: 'flex', gap: '25px', height: '100%' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: '20px', fontWeight: '700' }}>Atención en Caja</h2>
              <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                {products.map(p => (
                  <div key={p.id} className="glass product-card fade-in" style={{ padding: '20px' }}>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                            <Eye size={18} />
                        </button>
                    </div>
                    <div onClick={() => addToPosCart(p)} style={{ cursor: 'pointer' }}>
                        <p style={{ fontWeight: '700', fontSize: '1rem', height: '40px', overflow: 'hidden' }}>{p.nombre}</p>
                        <p style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.2rem', margin: '10px 0' }}>S/ {p.precio.toFixed(2)}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stock: {p.stock_actual} {p.unidad}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass" style={{ width: '380px', padding: '25px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Download size={20} /> Detalle de Venta
              </h3>
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
                {posCart.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px' }}>No hay productos en la lista</p>
                ) : (
                    posCart.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.nombre}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.cantidad} x S/ {item.precio.toFixed(2)}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontWeight: '700' }}>S/ {(item.cantidad * item.precio).toFixed(2)}</span>
                            <button onClick={() => removeFromPosCart(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    ))
                )}
              </div>
              <div style={{ borderTop: '2.5px solid var(--primary)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '800', marginBottom: '25px' }}>
                  <span>Total:</span>
                  <span>S/ {posCart.reduce((acc, i) => acc + (i.precio * i.cantidad), 0).toFixed(2)}</span>
                </div>
                <button className="btn-orange" style={{ width: '100%', padding: '18px', fontSize: '1rem' }} onClick={handlePosSale} disabled={posCart.length === 0}>
                  PROCESAR VENTA Y TICKET
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="glass fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
            <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Agregar Nuevo Producto</h2>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input type="text" placeholder="Nombre del Producto" className="input-field" value={newProduct.nombre} onChange={e => setNewProduct({...newProduct, nombre: e.target.value})} required />
              <div style={{ display: 'flex', gap: '20px' }}>
                <input type="number" step="0.01" placeholder="Precio (S/)" className="input-field" style={{ flex: 1 }} value={newProduct.precio} onChange={e => setNewProduct({...newProduct, precio: e.target.value})} required />
                <input type="text" placeholder="Unidad (ej. Blíster 10 UN)" className="input-field" style={{ flex: 1 }} value={newProduct.unidad} onChange={e => setNewProduct({...newProduct, unidad: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <input type="text" placeholder="Código de Barras" className="input-field" style={{ flex: 1 }} value={newProduct.codigo_barras} onChange={e => setNewProduct({...newProduct, codigo_barras: e.target.value})} />
                <input type="text" placeholder="Número de Lote" className="input-field" style={{ flex: 1 }} value={newProduct.lote} onChange={e => setNewProduct({...newProduct, lote: e.target.value})} />
              </div>
              <input type="text" placeholder="URL de la Imagen" className="input-field" value={newProduct.imagen} onChange={e => setNewProduct({...newProduct, imagen: e.target.value})} required />
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem' }}>Stock Inicial</label>
                  <input type="number" className="input-field" style={{ width: '100%' }} value={newProduct.stock_actual} onChange={e => setNewProduct({...newProduct, stock_actual: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem' }}>Stock Mínimo (Alerta)</label>
                  <input type="number" className="input-field" style={{ width: '100%' }} value={newProduct.stock_minimo} onChange={e => setNewProduct({...newProduct, stock_minimo: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '15px' }}>GUARDAR PRODUCTO</button>
            </form>
          </div>
        )}

        {/* Similar logic for Inventory and Reports... */}
        {activeTab === 'inventory' && (
            <div className="glass fade-in" style={{ padding: '25px' }}>
                <h2 style={{ marginBottom: '20px' }}>Control de Existencias</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-main)', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>Producto</th>
                            <th style={{ padding: '15px' }}>Stock</th>
                            <th style={{ padding: '15px' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '15px' }}>{p.nombre}</td>
                                <td style={{ padding: '15px' }}>{p.stock_actual} {p.unidad}</td>
                                <td style={{ padding: '15px' }}>
                                    {p.stock_actual <= p.stock_minimo ? (
                                        <span className="badge badge-low-stock">Crítico</span>
                                    ) : (
                                        <span className="badge" style={{ background: '#e6f7ef', color: 'var(--success)' }}>Óptimo</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div className="glass fade-in" style={{ width: '500px', padding: '30px', position: 'relative' }}>
                  <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X />
                  </button>
                  <img src={selectedProduct.imagen} alt={selectedProduct.nombre} style={{ width: '100%', height: '250px', objectFit: 'contain', marginBottom: '20px' }} />
                  <h2 style={{ color: 'var(--primary)' }}>{selectedProduct.nombre}</h2>
                  <p style={{ margin: '15px 0', fontSize: '1.1rem' }}>{selectedProduct.unidad}</p>
                  <p style={{ fontWeight: '800', fontSize: '1.5rem', color: 'var(--text-dark)' }}>S/ {selectedProduct.precio.toFixed(2)}</p>
                  <div style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-main)', borderRadius: '10px' }}>
                      <p><strong>Stock Actual:</strong> {selectedProduct.stock_actual}</p>
                      <p><strong>Stock Mínimo:</strong> {selectedProduct.stock_minimo}</p>
                  </div>
              </div>
          </div>
      )}

      <style>{`
        .btn-sidebar {
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 15px 20px;
          border-radius: 10px;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
          font-weight: 600;
        }
        .btn-sidebar:hover {
          background: #f0f4f3;
          color: var(--primary);
        }
        .btn-sidebar.active {
          background: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
