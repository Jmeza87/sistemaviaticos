'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ArrowLeft, Download, PlusCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CaseDetailClient({ caseId, userSession }: { caseId: string, userSession: any }) {
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form Expense
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    amountUSD: 0,
    amountBs: 0
  });

  const fetchData = async () => {
    try {
      const [reqRes, expRes] = await Promise.all([
        fetch(`/api/requests/${caseId}`),
        fetch(`/api/requests/${caseId}/expenses`)
      ]);
      
      if (reqRes.ok) setRequest(await reqRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [caseId]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send amount as 0 to avoid breaking old db constraints, we only use amountUSD and amountBs
      const body = { ...formData, amount: 0 };
      const res = await fetch(`/api/requests/${caseId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setFormData({ invoiceNumber: '', amountUSD: 0, amountBs: 0 });
        setShowForm(false);
        fetchData(); // reload
      } else {
        alert('Error al agregar gasto');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = async () => {
    if (!confirm('¿Estás seguro de cerrar esta solicitud? Ya no podrás agregar más gastos.')) return;
    try {
      const res = await fetch(`/api/requests/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cerrada' })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(43, 195, 198); // Teal color
    doc.text('Relación de Viáticos - MeruQ', 14, 22);
    
    // Info user and request
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`Solicitante: ${userSession.firstName} ${userSession.lastName}`, 14, 35);
    doc.text(`Departamento: ${userSession.department} | Empresa: ${userSession.company}`, 14, 42);
    doc.text(`Causa del viaje: ${request.TravelCause}`, 14, 49);
    doc.text(`Días de viaje: ${request.TravelDays}`, 14, 56);
    doc.text(`Estado: ${request.Status}`, 14, 63);
    
    // Summary
    const totalExpensesUSD = expenses.reduce((sum, exp) => sum + exp.AmountUSD, 0);
    const totalExpensesBs = expenses.reduce((sum, exp) => sum + exp.AmountBs, 0);
    const balanceUSD = request.AssignedAmountUSD - totalExpensesUSD;
    const balanceBs = request.AssignedAmountBs - totalExpensesBs;
    
    doc.setFontSize(12);
    doc.text(`Monto Asignado: $${request.AssignedAmountUSD.toFixed(2)} | Bs ${request.AssignedAmountBs.toFixed(2)}`, 14, 75);
    doc.text(`Total Gastos: $${totalExpensesUSD.toFixed(2)} | Bs ${totalExpensesBs.toFixed(2)}`, 14, 82);
    
    if (balanceUSD < 0 || balanceBs < 0) {
      doc.setTextColor(220, 38, 38); // Red
    } else {
      doc.setTextColor(22, 101, 52); // Green
    }
    doc.text(`Saldo Final: $${balanceUSD.toFixed(2)} | Bs ${balanceBs.toFixed(2)}`, 14, 89);
    doc.setTextColor(50, 50, 50);

    // Table
    const tableData = expenses.map(e => [
      new Date(e.CreatedAt).toLocaleDateString(),
      e.InvoiceNumber || 'S/N',
      `$${e.AmountUSD.toFixed(2)}`,
      `Bs ${e.AmountBs.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 100,
      head: [['Fecha', 'Nro Factura', 'Monto USD', 'Monto Bs']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [43, 195, 198] } // Teal
    });

    doc.save(`Viaticos_${request.RequestName.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return <p>Cargando detalles...</p>;
  if (!request) return <p>Solicitud no encontrada.</p>;

  const totalExpensesUSD = expenses.reduce((sum, exp) => sum + exp.AmountUSD, 0);
  const totalExpensesBs = expenses.reduce((sum, exp) => sum + exp.AmountBs, 0);
  const balanceUSD = request.AssignedAmountUSD - totalExpensesUSD;
  const balanceBs = request.AssignedAmountBs - totalExpensesBs;
  const isNegativeUSD = balanceUSD < 0;
  const isNegativeBs = balanceBs < 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary)' }}>
            <ArrowLeft size={20} style={{ marginRight: '0.25rem' }} />
            Volver
          </Link>
          <h1 className="h1" style={{ margin: 0 }}>{request.RequestName}</h1>
          <span style={{ 
            padding: '0.25rem 0.75rem', 
            borderRadius: '1rem', 
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: request.Status === 'Abierta' ? '#dcfce7' : '#f3f4f6',
            color: request.Status === 'Abierta' ? '#166534' : '#4b5563'
          }}>
            {request.Status}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={exportPDF} className="btn btn-secondary">
            <Download size={18} />
            Exportar PDF
          </button>
          {request.Status === 'Abierta' && (
            <button onClick={handleClose} className="btn btn-primary">
              <CheckCircle size={18} />
              Cerrar Solicitud
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 className="h2" style={{ fontSize: '1.25rem' }}>Detalles de Solicitud</h3>
          <p><strong>Causa:</strong> {request.TravelCause}</p>
          <p><strong>Días de Viaje:</strong> {request.TravelDays}</p>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 className="h2" style={{ fontSize: '1.25rem', marginBottom: '0' }}>Resumen de Saldo</h3>
          <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>DÓLARES (USD)</div>
              <div style={{ fontSize: '1rem' }}>Asignado: ${(request.AssignedAmountUSD || 0).toFixed(2)}</div>
              <div style={{ fontSize: '1rem' }}>Gastos: ${totalExpensesUSD.toFixed(2)}</div>
              <div style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: isNegativeUSD ? 'var(--color-danger)' : 'var(--color-primary)',
                marginTop: '0.5rem' 
              }}>
                Saldo: ${balanceUSD.toFixed(2)}
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>BOLÍVARES (Bs)</div>
              <div style={{ fontSize: '1rem' }}>Asignado: Bs {(request.AssignedAmountBs || 0).toFixed(2)}</div>
              <div style={{ fontSize: '1rem' }}>Gastos: Bs {totalExpensesBs.toFixed(2)}</div>
              <div style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: isNegativeBs ? 'var(--color-danger)' : 'var(--color-primary)',
                marginTop: '0.5rem' 
              }}>
                Saldo: Bs {balanceBs.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="h2" style={{ margin: 0 }}>Relación de Gastos</h2>
          {request.Status === 'Abierta' && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <PlusCircle size={18} />
              Agregar Gasto
            </button>
          )}
        </div>

        {showForm && request.Status === 'Abierta' && (
          <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderBottom: '1px solid var(--color-border)' }}>
            <form onSubmit={handleAddExpense} className="grid grid-cols-2">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Nro Factura (Opcional)</label>
                <input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Monto Gastado en USD</label>
                <input required type="number" step="0.01" min="0" name="amountUSD" value={formData.amountUSD} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Monto Gastado en Bs</label>
                <input required type="number" step="0.01" min="0" name="amountBs" value={formData.amountBs} onChange={handleChange} className="form-input" />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Gasto</button>
              </div>
            </form>
          </div>
        )}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nro Factura</th>
                <th>Monto USD</th>
                <th>Monto Bs</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No hay gastos registrados.</td>
                </tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.Id}>
                    <td>{new Date(exp.CreatedAt).toLocaleDateString()}</td>
                    <td>{exp.InvoiceNumber || '-'}</td>
                    <td>${exp.AmountUSD.toFixed(2)}</td>
                    <td>Bs {exp.AmountBs.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
