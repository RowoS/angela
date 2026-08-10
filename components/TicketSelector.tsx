'use client';

import { FIELD_INPUT } from '@/lib/calendar-styles';
import { useTicketSearch, type TicketOption } from '@/hooks/use-ticket-search';

interface Props {
  selectedTicket: TicketOption | null;
  onSelectTicket: (t: TicketOption) => void;
  onClearTicket: () => void;
}

export function TicketSelector({ selectedTicket, onSelectTicket, onClearTicket }: Props) {
  const { 
    ticketQuery, 
    setTicketQuery, 
    ticketResults, 
    setTicketResults, 
    isSearchingTickets 
  } = useTicketSearch();

  if (selectedTicket) {
    return (
      <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <span className="truncate">
          <span className="font-semibold text-slate-900">{selectedTicket.ticket_number}</span>
          {' — '}
          <span className="text-slate-500">{selectedTicket.title}</span>
        </span>
        <button
          type="button"
          onClick={onClearTicket}
          className="ml-2 shrink-0 text-xs text-slate-400 hover:text-slate-600"
          aria-label="Remove linked ticket"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={ticketQuery}
        onChange={(e) => setTicketQuery(e.target.value)}
        placeholder="Search by ticket number or title…"
        className={FIELD_INPUT}
      />
      {ticketQuery.trim() && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {isSearchingTickets ? (
            <li className="px-3 py-2 text-sm text-slate-400">Searching…</li>
          ) : ticketResults.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">No matching tickets.</li>
          ) : (
            ticketResults.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTicket(t);
                    setTicketQuery('');
                    setTicketResults([]);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="font-semibold text-slate-900">{t.ticket_number}</span>
                  {' — '}
                  <span className="text-slate-500">{t.title}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}