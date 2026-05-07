import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, BarChart3, AlertTriangle, Eye, Trash2, Plus, Download, X, Link as LinkIcon, Settings, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';
import API_URL from '../api';

const Dashboard = ({ user, socket }) => {
  const [activeTab, setActiveTab] = useState('pos');
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [posCart, setPosCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inventorySearch, setInventorySearch] = useState('');
  
  const [newProduct, setNewProduct] = useState({
    nombre: '', precio: '', unidad: '', imagen: '', stock_actual: 10, stock_minimo: 5,
    codigo_barras: '', lote: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchReports();

    if (socket) {
        socket.on('products_updated', () => {
            console.log('🔄 Sincronizando inventario en tiempo real...');
            fetchProducts();
        });
        return () => socket.off('products_updated');
    }
  }, [socket]);

  const fetchProducts = () => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  const fetchReports = () => {
    fetch(`${API_URL}/api/sales/reports`)
      .then(res => res.json())
      .then(data => setReports(data));
  };

  const generatePDF = (saleId, items, total) => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [80, 200] // Formato ticket térmico 80mm
    });

    // Cabecera del Ticket
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('NOVA SALUD', 40, 10, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Tu Farmacia de Confianza', 40, 14, { align: 'center' });
    doc.text('RUC: 20601234567', 40, 18, { align: 'center' });
    doc.text('Av. Salud 123 - Lima', 40, 22, { align: 'center' });
    
    doc.text('------------------------------------------', 40, 26, { align: 'center' });
    doc.text(`TICKET: ${saleId.substring(0, 8)}`, 5, 30);
    doc.text(`FECHA: ${new Date().toLocaleString()}`, 5, 34);
    doc.text(`CAJERO: ${user?.username || 'Sistema'}`, 5, 38);
    doc.text('------------------------------------------', 40, 42, { align: 'center' });

    // Tabla de Productos
    const tableRows = items.map(item => [
      item.nombre.substring(0, 20),
      item.cantidad,
      item.precio.toFixed(2),
      (item.cantidad * item.precio).toFixed(2)
    ]);

    autoTable(doc, {
      startY: 45,
      margin: { left: 2, right: 2 },
      head: [['Prod', 'Cant', 'P.U', 'Sub']],
      body: tableRows,
      theme: 'plain',
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fontStyle: 'bold' },
      didDrawPage: (data) => {
        // Guardar la posición final de la tabla
        doc.finalY = data.cursor.y;
      }
    });

    const finalY = doc.finalY || 45;
    doc.text('------------------------------------------', 40, finalY + 5, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: S/ ${total.toFixed(2)}`, 40, finalY + 12);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('¡Gracias por su preferencia!', 40, finalY + 20, { align: 'center' });
    doc.text('Conserve su comprobante', 40, finalY + 24, { align: 'center' });
    
    doc.save(`Ticket_NovaSalud_${saleId.substring(0, 5)}.pdf`);
  };

  const handlePosSale = () => {
    if (!user || !user.id) {
      alert('Error: Sesión de usuario no válida');
      return;
    }

    const saleData = {
      user_id: user.id,
      items: posCart.map(item => ({ id: item.id, cantidad: item.cantidad })), // Solo IDs y cantidades
      tipo: 'Manual'
    };

    const token = localStorage.getItem('token');

    fetch(`${API_URL}/api/sales`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(saleData)
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en el servidor');
      return data;
    })
    .then(data => {
      // El total ahora viene del servidor
      generatePDF(data.sale_id, posCart, data.total);
      setPosCart([]);
      fetchProducts();
      fetchReports();
      alert(`✅ Venta registrada con éxito. Total: S/ ${data.total.toFixed(2)}`);
    })
    .catch(err => {
      console.error(err);
      alert(`❌ Error al registrar venta: ${err.message}`);
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

    // Si no tiene ID pero el nombre ya existe en la lista, advertir y detener
    const duplicate = products.find(p => p.nombre.trim().toLowerCase() === newProduct.nombre.trim().toLowerCase());
    if (!newProduct.id && duplicate) {
      alert(`⚠️ ERROR: Ya existe un producto llamado "${duplicate.nombre}". Selecciona el nombre exacto de la lista para reponer stock.`);
      return;
    }
    
    const isUpdate = !!newProduct.id;
    const url = isUpdate ? `${API_URL}/api/products/${newProduct.id}` : `${API_URL}/api/products`;
    const method = isUpdate ? 'PUT' : 'POST';
    const token = localStorage.getItem('token');

    fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
    })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error en la operación');
        return data;
    })
    .then(data => {
        alert(isUpdate ? '¡Stock actualizado correctamente! ✅' : '¡Producto creado exitosamente! ✅');
        setNewProduct({ nombre: '', precio: '', unidad: '', imagen: '', stock_actual: 10, stock_minimo: 5, codigo_barras: '', lote: '' });
        fetchProducts();
    })
    .catch(err => {
        alert(`❌ Error: ${err.message}`);
    });
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
        const url = `${API_URL}/api/products/${id}`;
        const token = localStorage.getItem('token');

        fetch(url, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al eliminar');
            return data;
        })
        .then(() => {
            alert('✅ Producto eliminado correctamente');
            fetchProducts();
        })
        .catch(err => {
            console.error('Error al eliminar:', err);
            alert(`❌ No se pudo eliminar: ${err.message}`);
        });
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar / Top Nav on Mobile */}
      <nav className="dashboard-nav glass">
        <h2 className="hide-mobile" style={{ fontSize: '1.4rem', marginBottom: '30px', color: 'var(--primary)', fontWeight: '800' }}>PANEL CONTROL</h2>
        <div className="nav-links-container">
          <button className={`btn-sidebar ${activeTab === 'pos' ? 'active' : ''}`} onClick={() => setActiveTab('pos')}>
            <ShoppingBag size={20} /> <span className="btn-text">Caja</span>
          </button>
          <button className={`btn-sidebar ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            <Package size={20} /> <span className="btn-text">Inventario</span>
          </button>
          {user.role === 'Administrador' && (
            <>
              <button className={`btn-sidebar ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                <BarChart3 size={20} /> <span className="btn-text">Reportes</span>
              </button>
              <button className={`btn-sidebar ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
                <Plus size={20} /> <span className="btn-text">Nuevo</span>
              </button>
              <button className={`btn-sidebar ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                <LinkIcon size={20} /> <span className="btn-text">Puente</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'pos' && (
          <div className="pos-layout">
            <div className="pos-products">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ fontWeight: '800', color: 'var(--text-dark)' }}>Venta en Caja</h2>
                <div style={{ background: 'white', padding: '10px 20px', borderRadius: '10px', fontSize: '0.8rem', border: '1px solid var(--border)', fontWeight: '700' }}>
                  {products.length} Items en Stock
                </div>
              </div>
              
              <div className="pos-grid-container">
                {products.map(p => (
                  <div key={p.id} className="pos-card fade-in" onClick={() => addToPosCart(p)}>
                    <div className="pos-card-img">
                      <img src={p.imagen.startsWith('http') ? p.imagen : `${API_URL}${p.imagen}`} alt={p.nombre} />
                    </div>
                    <div className="pos-card-content">
                      <h4 className="pos-card-title">{p?.nombre || 'Producto sin nombre'}</h4>
                      <div className="pos-card-footer">
                        <span className="pos-card-price">S/ {(p?.precio || 0).toFixed(2)}</span>
                        <span className={`pos-card-stock ${(p?.stock_actual || 0) <= (p?.stock_minimo || 0) ? 'critical' : ''}`}>
                          {p?.stock_actual || 0} ud.
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pos-cart glass">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Download size={20} /> Detalle de Venta
              </h3>
              <div className="pos-cart-items">
                {posCart.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px' }}>Lista vacía</p>
                ) : (
                    posCart.map(item => (
                    <div key={item.id} className="cart-item-pos">
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: '600', fontSize: '0.85rem' }}>{item.nombre}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.cantidad} x S/ {(item?.precio || 0).toFixed(2)}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>S/ {(item.cantidad * (item?.precio || 0)).toFixed(2)}</span>
                            <button onClick={(e) => { e.stopPropagation(); removeFromPosCart(item.id); }} className="btn-delete-item">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    ))
                )}
              </div>
              <div className="pos-cart-footer">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: '800', marginBottom: '20px' }}>
                  <span>Total:</span>
                  <span>S/ {posCart.reduce((acc, i) => acc + (i.precio * i.cantidad), 0).toFixed(2)}</span>
                </div>
                <button className="btn-orange" onClick={handlePosSale} disabled={posCart.length === 0} style={{ width: '100%', padding: '15px' }}>
                  PROCESAR VENTA
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="glass fade-in inventory-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontWeight: '800' }}>Reporte de Ventas</h2>
              <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.8rem' }} onClick={() => window.print()}>
                <Download size={16} /> EXPORTAR REPORTE
              </button>
            </div>

            {/* Panel de Resumen (KPIs) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="glass" style={{ padding: '20px', textAlign: 'center', borderBottom: '4px solid var(--primary)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>TOTAL VENTAS HOY</p>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>
                        S/ {reports.reduce((acc, s) => acc + s.total, 0).toFixed(2)}
                    </h3>
                </div>
                <div className="glass" style={{ padding: '20px', textAlign: 'center', borderBottom: '4px solid var(--orange)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>TRANSACCIONES</p>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--orange)' }}>
                        {reports.length}
                    </h3>
                </div>
                <div className="glass" style={{ padding: '20px', textAlign: 'center', borderBottom: '4px solid var(--secondary)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>PROMEDIO TICKET</p>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)' }}>
                        S/ {reports.length > 0 ? (reports.reduce((acc, s) => acc + s.total, 0) / reports.length).toFixed(2) : '0.00'}
                    </h3>
                </div>
            </div>

            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID Venta</th>
                    <th>Fecha y Hora</th>
                    <th>Vendedor</th>
                    <th>Tipo</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '50px' }}>No hay ventas registradas aún</td></tr>
                  ) : (
                    reports.map(sale => (
                      <tr key={sale?.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>#{String(sale?.id || '').substring(0, 8)}</td>
                        <td>{sale?.fecha ? new Date(sale.fecha).toLocaleString() : '---'}</td>
                        <td>{sale?.username || 'Sistema'}</td>
                        <td><span className={`badge ${sale?.tipo === 'Manual' ? 'badge-optimo' : 'badge-low-stock'}`} style={{ fontSize: '0.7rem' }}>{sale?.tipo || 'Venta'}</span></td>
                        <td style={{ fontWeight: '800', color: 'var(--primary)' }}>S/ {(sale?.total || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="glass fade-in form-container">
            <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>Gestión de Mercadería</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem' }}>Busca un producto existente para reponer stock o crea uno nuevo.</p>
            
            <form onSubmit={handleAddProduct} className="dashboard-form">
              <div style={{ position: 'relative' }}>
                <input 
                  list="existing-products"
                  type="text" 
                  placeholder="Nombre del Producto (Escribe para buscar...)" 
                  className="input-field" 
                  value={newProduct.nombre} 
                  onChange={e => {
                    const val = e.target.value;
                    // Buscador inteligente: ignora espacios y mayúsculas
                    const existing = products.find(p => 
                      p.nombre.trim().toLowerCase() === val.trim().toLowerCase()
                    );
                    
                    if (existing) {
                      setNewProduct({
                        ...existing,
                        stock_actual: 0 // Reset para reponer
                      });
                    } else {
                      // Si no existe, mantenemos lo que el usuario escribe pero limpiamos el ID
                      setNewProduct({
                        ...newProduct, 
                        id: undefined, 
                        nombre: val
                      });
                    }
                  }} 
                  required 
                />
                <datalist id="existing-products">
                  {products.map(p => <option key={p.id} value={p.nombre} />)}
                </datalist>
              </div>

              <div className="form-row">
                <input type="number" step="0.01" placeholder="Precio (S/)" className="input-field" value={newProduct.precio} onChange={e => setNewProduct({...newProduct, precio: e.target.value})} required />
                <input type="text" placeholder="Unidad (ej: FRASCO 50ML)" className="input-field" value={newProduct.unidad} onChange={e => setNewProduct({...newProduct, unidad: e.target.value})} required />
              </div>
              
              <div className="form-row">
                <input type="text" placeholder="Código de Barras" className="input-field" value={newProduct.codigo_barras} onChange={e => setNewProduct({...newProduct, codigo_barras: e.target.value})} />
                <input type="text" placeholder="Lote" className="input-field" value={newProduct.lote} onChange={e => setNewProduct({...newProduct, lote: e.target.value})} />
              </div>

              <input type="text" placeholder="URL de la Imagen" className="input-field" value={newProduct.imagen} onChange={e => setNewProduct({...newProduct, imagen: e.target.value})} required />
              
              <div className="form-row" style={{ background: '#f0f4f3', padding: '20px', borderRadius: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                    {newProduct.id ? 'Cantidad que está ingresando' : 'Stock Inicial'}
                  </label>
                  <input type="number" className="input-field" style={{ width: '100%', background: 'white' }} value={newProduct.stock_actual} onChange={e => setNewProduct({...newProduct, stock_actual: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Stock Mínimo Alerta</label>
                  <input type="number" className="input-field" style={{ width: '100%', background: 'white' }} value={newProduct.stock_minimo} onChange={e => setNewProduct({...newProduct, stock_minimo: e.target.value})} required />
                </div>
              </div>

              <button type="submit" className={newProduct.id ? 'btn-orange' : 'btn-primary'} style={{ padding: '15px', fontWeight: '800' }}>
                {newProduct.id ? `REPOSICIÓN: AGREGAR ${newProduct.stock_actual} UNIDADES` : 'CREAR NUEVO PRODUCTO'}
              </button>
              
              {newProduct.id && (
                <button type="button" onClick={() => setNewProduct({ nombre: '', precio: '', unidad: '', imagen: '', stock_actual: 10, stock_minimo: 5, codigo_barras: '', lote: '' })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}>
                  Limpiar y crear uno nuevo diferente
                </button>
              )}
            </form>
          </div>
        )}

        {activeTab === 'inventory' && (
            <div className="glass fade-in inventory-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 style={{ fontWeight: '800' }}>Existencias</h2>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Buscar en inventario..." 
                            className="input-field" 
                            style={{ paddingLeft: '40px', height: '40px' }}
                            value={inventorySearch}
                            onChange={(e) => setInventorySearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Stock</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'center' }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products
                                .filter(p => (p?.nombre || '').toLowerCase().includes((inventorySearch || '').toLowerCase()))
                                .map(p => (
                                <tr key={p?.id} className="fade-in">
                                    <td style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <img 
                                          src={p.imagen.startsWith('http') ? p.imagen : `${API_URL}${p.imagen}`} 
                                          alt={p.nombre} 
                                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} 
                                        />
                                        <div>
                                            <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-dark)' }}>{p?.nombre || 'Sin nombre'}</p>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {p?.id || '---'}</p>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: '800' }}>{p?.stock_actual || 0} {p?.unidad || 'unidades'}</td>
                                    <td>
                                        {(p?.stock_actual || 0) <= (p?.stock_minimo || 0) ? (
                                            <span className="badge badge-low-stock">Crítico</span>
                                        ) : (
                                            <span className="badge-ok" style={{ color: 'var(--secondary)', fontWeight: '800' }}>Óptimo</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="btn-delete-item" onClick={() => handleDeleteProduct(p.id)} style={{ padding: '8px' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass fade-in form-container">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <LinkIcon size={48} style={{ color: 'var(--primary)', marginBottom: '15px' }} />
                <h2>Puente API</h2>
            </div>
            <div className="alert-info">
                <strong>Instrucciones:</strong> Ejecuta <code>npm run bridge</code> en tu PC y pega aquí la URL generada.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="https://..." className="input-field" id="bridgeUrlInput" defaultValue={localStorage.getItem('nova_salud_bridge') || ''} />
                <button className="btn-primary" onClick={() => {
                    const val = document.getElementById('bridgeUrlInput').value;
                    if (val) { localStorage.setItem('nova_salud_bridge', val); window.location.reload(); }
                    else { localStorage.removeItem('nova_salud_bridge'); window.location.reload(); }
                }}>CONECTAR</button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .dashboard-container { 
          display: flex; 
          min-height: calc(100vh - 80px); 
          background: var(--bg-main); 
          padding: 2% 4%; 
        }
        
        /* Sidebar Desktop - Fluida */
        .dashboard-nav { 
          width: 22%; 
          min-width: 250px;
          margin-right: 3%; 
          padding: 2%; 
          border-radius: 15px; 
          display: flex; 
          flex-direction: column; 
          height: fit-content; 
          position: sticky;
          top: 100px;
        }
        .nav-links-container { display: flex; flex-direction: column; gap: 10px; }
        
        .dashboard-main { 
          flex: 1; 
          padding: 1% 0; 
          overflow-x: hidden; 
        }
        
        .pos-layout { display: flex; gap: 3%; height: 100%; }
        .pos-products { flex: 1; }
        .pos-cart { 
          width: 35%; 
          min-width: 320px;
          padding: 2.5%; 
          border-radius: 15px; 
          display: flex; 
          flex-direction: column; 
          height: fit-content; 
        }
        
        /* Contenedores con Aire Porcentual */
        .inventory-container, .form-container { 
          padding: 5%; 
          border-radius: 20px; 
          margin-top: 2%;
        }

        .dashboard-form { display: flex; flex-direction: column; gap: 20px; }
        .form-row { display: flex; gap: 20px; }
        
        .dashboard-table th { background: #f8faf9; padding: 1.5% 1%; text-align: left; }
        .dashboard-table td { padding: 1.5% 1%; border-bottom: 1px solid var(--border); }

        .btn-sidebar { 
          background: none; border: none; color: var(--text-muted); padding: 5% 7%; 
          border-radius: 10px; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 12px; 
          transition: all 0.2s; font-weight: 600; width: 100%;
        }
        .btn-sidebar:hover { background: #f0f4f3; color: var(--primary); }
        .btn-sidebar.active { background: var(--primary); color: white; }

        /* Estilos POS Card Pro */
        .pos-grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 20px;
          max-height: 70vh;
          overflow-y: auto;
          padding-right: 10px;
        }

        .pos-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
        }

        .pos-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          border-color: var(--primary);
        }

        .pos-card-img {
          width: 100%;
          height: 120px;
          background: #f8faf9;
          display: flex;
          justify-content: center;
          alignItems: center;
          padding: 10px;
        }

        .pos-card-img img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .pos-card-content {
          padding: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .pos-card-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-dark);
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 2.4rem;
        }

        .pos-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pos-card-price {
          font-weight: 900;
          color: var(--primary);
          font-size: 1rem;
        }

        .pos-card-stock {
          font-size: 0.7rem;
          color: var(--text-muted);
          background: #f0f4f3;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .pos-card-stock.critical {
          background: #fee2e2;
          color: #ef4444;
          font-weight: 700;
        }

        @media (max-width: 1024px) {
          .dashboard-container { padding: 2% 3%; }
          .pos-layout { flex-direction: column; }
          .pos-cart { width: 100%; margin-top: 3%; }
          .dashboard-nav { width: 30%; }
        }

        @media (max-width: 768px) {
          .dashboard-container { flex-direction: column; padding: 2%; }
          .dashboard-nav { width: 100%; margin: 0 0 5% 0; padding: 3%; height: auto; flex-direction: row; position: static; }
          .nav-links-container { flex-direction: row; overflow-x: auto; width: 100%; padding-bottom: 2%; }
          .btn-sidebar { padding: 10px 15px; width: auto; white-space: nowrap; }
          .inventory-container, .form-container { padding: 8% 5%; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
