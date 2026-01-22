import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

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
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AI Support Co-Pilot</h1>
      </header>

      <div className="grid gap-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <p className="text-gray-700 flex-1">{ticket.description}</p>
              <div className="flex gap-2 ml-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.processed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {ticket.processed ? 'PROCESADO' : 'PENDIENTE'}
                </span>
                {ticket.sentiment && (
                  <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.sentiment === 'Negativo' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {ticket.sentiment}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              Categoría: {ticket.category || 'Analizando...'} | ID: {ticket.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}