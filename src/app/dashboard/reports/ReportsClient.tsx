'use client';

import { useState, useEffect } from 'react';
import { PieChart, Activity, DollarSign, CheckCircle } from 'lucide-react';

export default function ReportsClient() {
  const [data, setData] = useState<{ requestsData: any[], expensesData: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando reportes...</p>;
  if (!data) return <p>Error al cargar reportes.</p>;

  // Process data
  const summary = {
    USD: { assignedOpen: 0, assignedClosed: 0, spent: 0 },
    Bs: { assignedOpen: 0, assignedClosed: 0, spent: 0 }
  };

  data.requestsData.forEach(r => {
    if (r.Status === 'Abierta') {
      summary.USD.assignedOpen += r.TotalAssignedUSD || 0;
      summary.Bs.assignedOpen += r.TotalAssignedBs || 0;
    } else {
      summary.USD.assignedClosed += r.TotalAssignedUSD || 0;
      summary.Bs.assignedClosed += r.TotalAssignedBs || 0;
    }
  });

  data.expensesData.forEach(e => {
    summary.USD.spent += e.TotalSpentUSD || 0;
    summary.Bs.spent += e.TotalSpentBs || 0;
  });

  const CardStat = ({ title, value, icon, color }: any) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ padding: '1rem', backgroundColor: color, borderRadius: '50%', color: 'white', display: 'flex' }}>
        {icon}
      </div>
      <div>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 className="h2" style={{ marginBottom: '1rem' }}>Resumen en Dólares (USD)</h2>
        <div className="grid grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <CardStat 
            title="Asignado (Abiertas)" 
            value={`$${summary.USD.assignedOpen.toFixed(2)}`} 
            icon={<Activity size={24} />} 
            color="#3b82f6" 
          />
          <CardStat 
            title="Asignado (Cerradas)" 
            value={`$${summary.USD.assignedClosed.toFixed(2)}`} 
            icon={<CheckCircle size={24} />} 
            color="#10b981" 
          />
          <CardStat 
            title="Total Gastado" 
            value={`$${summary.USD.spent.toFixed(2)}`} 
            icon={<DollarSign size={24} />} 
            color="#f59e0b" 
          />
          <CardStat 
            title="Saldo Global" 
            value={`$${(summary.USD.assignedOpen + summary.USD.assignedClosed - summary.USD.spent).toFixed(2)}`} 
            icon={<PieChart size={24} />} 
            color={(summary.USD.assignedOpen + summary.USD.assignedClosed - summary.USD.spent) < 0 ? '#ef4444' : '#1b5e20'} 
          />
        </div>
      </div>

      <div>
        <h2 className="h2" style={{ marginBottom: '1rem' }}>Resumen en Bolívares (Bs)</h2>
        <div className="grid grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <CardStat 
            title="Asignado (Abiertas)" 
            value={`Bs ${summary.Bs.assignedOpen.toFixed(2)}`} 
            icon={<Activity size={24} />} 
            color="#3b82f6" 
          />
          <CardStat 
            title="Asignado (Cerradas)" 
            value={`Bs ${summary.Bs.assignedClosed.toFixed(2)}`} 
            icon={<CheckCircle size={24} />} 
            color="#10b981" 
          />
          <CardStat 
            title="Total Gastado" 
            value={`Bs ${summary.Bs.spent.toFixed(2)}`} 
            icon={<DollarSign size={24} />} 
            color="#f59e0b" 
          />
          <CardStat 
            title="Saldo Global" 
            value={`Bs ${(summary.Bs.assignedOpen + summary.Bs.assignedClosed - summary.Bs.spent).toFixed(2)}`} 
            icon={<PieChart size={24} />} 
            color={(summary.Bs.assignedOpen + summary.Bs.assignedClosed - summary.Bs.spent) < 0 ? '#ef4444' : '#1b5e20'} 
          />
        </div>
      </div>
    </div>
  );
}
