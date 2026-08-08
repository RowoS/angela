import { useState, useEffect } from 'react';
import { searchTickets } from '@/lib/actions/ticket-actions';

export type TicketOption = { id: string; ticket_number: string; title: string };

export function useTicketSearch() {
  const [ticketQuery, setTicketQuery] = useState('');
  const [ticketResults, setTicketResults] = useState<TicketOption[]>([]);
  const [isSearchingTickets, setIsSearchingTickets] = useState(false);

  // Wrap the state setter to handle synchronous clearing in the event handler
  const handleQueryChange = (value: string) => {
    setTicketQuery(value);
    
    if (!value.trim()) {
      setTicketResults([]);
      setIsSearchingTickets(false);
    } else {
      setIsSearchingTickets(true);
    }
  };

  useEffect(() => {
    const query = ticketQuery.trim();
    
    // If the query is empty, do nothing. 
    // The state was already cleared synchronously by handleQueryChange.
    if (!query) return;

    const handle = setTimeout(() => {
      searchTickets(query)
        .then(setTicketResults)
        .catch(() => setTicketResults([]))
        .finally(() => setIsSearchingTickets(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [ticketQuery]);

  return { 
    ticketQuery, 
    setTicketQuery: handleQueryChange, // Export the wrapped setter
    ticketResults, 
    setTicketResults, 
    isSearchingTickets 
  };
}