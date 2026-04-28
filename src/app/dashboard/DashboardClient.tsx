'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, FileText, CheckCircle } from 'lucide-react';

export default function DashboardClient() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    requestName: '',
    travelDays: 1,
    travelCause: '',
    assignedAmountUSD: 0,
    assignedAmountBs: 0
  });

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      if (res.ok) setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ requestName: '', travelDays: 1, travelCause: '', assignedAmountUSD: 0, assignedAmountBs: 0 });
        fetchRequests();
      } else {
        alert('Error al crear solicitud');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <PlusCircle size={20} />
          Nueva Solicitud
        </button>
      </div>

      {loading ? (
        <p>Cargando solicitudes...</p>
      ) : requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>No tienes solicitudes de viáticos registradas.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Crear la primera
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {requests.map(req => (
            <Link href={`/dashboard/case/${req.Id}`} key={req.Id}>
              <div className="card" style={{ height: '100%', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h2 className="h2" style={{ margin: 0 }}>{req.RequestName}</h2>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '1rem', 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: req.Status === 'Abierta' ? '#dcfce7' : '#f3f4f6',
                    color: req.Status === 'Abierta' ? '#166534' : '#4b5563'
                  }}>
                    {req.Status}
                  </span>
                </div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>
                  <p><strong>Días:</strong> {req.TravelDays}</p>
                  <p><strong>Monto Asignado:</strong> ${(req.AssignedAmountUSD || 0).toFixed(2)} | Bs {(req.AssignedAmountBs || 0).toFixed(2)}</p>
                  <p style={{ marginTop: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {req.TravelCause}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary)', fontWeight: 500, fontSize: '0.875rem' }}>
                  <FileText size={16} style={{ marginRight: '0.5rem' }} />
                  Ver detalle
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="h2" style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Nueva Solicitud de Viático</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre de Solicitud</label>
                <input required name="requestName" value={formData.requestName} onChange={handleChange} className="form-input" />
              </div>
              <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Días de Viaje</label>
                  <input required type="number" min="1" name="travelDays" value={formData.travelDays} onChange={handleChange} className="form-input" />
                </div>
              </div>
              <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Monto Asignado (USD)</label>
                  <input required type="number" step="0.01" min="0" name="assignedAmountUSD" value={formData.assignedAmountUSD} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Monto Asignado (Bs)</label>
                  <input required type="number" step="0.01" min="0" name="assignedAmountBs" value={formData.assignedAmountBs} onChange={handleChange} className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Causa del Viaje</label>
                <textarea required name="travelCause" value={formData.travelCause} onChange={handleChange} className="form-input" rows={3}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
