import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle2, Clock, Tag, MessageSquare, BarChart3, Calendar } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Ticket {
  id: string;
  description: string;
  category: string;
  sentiment: string;
  processed: boolean;
  created_at: string;
}

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setTickets(data);
    };
    fetchTickets();

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTickets(prev => [payload.new as Ticket, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTickets(prev => prev.map(t => t.id === payload.new.id ? payload.new as Ticket : t));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header con espaciado interno (Padding) */}
      <nav className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BarChart3 className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Vivetori <span className="text-blue-600">AI Co-Pilot</span>
          </h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Sección de Resumen con GAP generoso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <SummaryCard title="Total Tickets" value={tickets.length} color="blue" />
          <SummaryCard title="Pendientes" value={tickets.filter(t => !t.processed).length} color="amber" />
          <SummaryCard title="Críticos" value={tickets.filter(t => t.sentiment === 'Negativo').length} color="red" />
        </div>

        {/* Contenedor de Tabla con Padding y bordes limpios */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Información del Ticket</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Estado</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Categoría / IA</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50 transition-all duration-200">
                  {/* Celda de Descripción con separación del ID */}
                  <td className="px-8 py-6 max-w-md">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed italic">
                        "{ticket.description}"
                      </p>
                      <code className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded w-fit border border-slate-100 uppercase">
                        UUID: {ticket.id}
                      </code>
                    </div>
                  </td>

                  {/* Celda de Estado con Badge espaciado */}
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center">
                      {ticket.processed ? (
                        <Badge color="green" icon={<CheckCircle2 size={14}/>}>Procesado</Badge>
                      ) : (
                        <Badge color="amber" icon={<Clock size={14}/>} pulse>Pendiente</Badge>
                      )}
                    </div>
                  </td>

                  {/* Celda de Categoría y Sentimiento con separación vertical (Flex Col) */}
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Tag size={16} className="text-blue-500" />
                        {ticket.category || 'Sin categorizar'}
                      </div>
                      <div className="flex items-center gap-2">
                        <SentimentBadge sentiment={ticket.sentiment} />
                      </div>
                    </div>
                  </td>

                  {/* Celda de Fecha */}
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      <Calendar size={14} />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

// --- SUBCOMPONENTES PARA ORDEN Y LIMPIEZA ---

function SummaryCard({ title, value, color }: any) {
  const colors: any = {
    blue: "border-blue-500 text-blue-600",
    amber: "border-amber-500 text-amber-600",
    red: "border-red-500 text-red-600"
  };
  return (
    <div className={`bg-white p-6 rounded-xl border-t-4 shadow-sm ${colors[color]}`}>
      <p className="text-xs uppercase font-bold text-slate-400 mb-1">{title}</p>
      <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
  );
}

function Badge({ children, color, icon, pulse }: any) {
  const styles: any = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${styles[color]} ${pulse ? 'animate-pulse' : ''}`}>
      {icon} {children}
    </span>
  );
}

function SentimentBadge({ sentiment }: any) {
  if (!sentiment) return null;
  const isNeg = sentiment.toLowerCase() === 'negativo';
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${isNeg ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
      {sentiment}
    </span>
  );
}