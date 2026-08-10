'use client';

import { useEffect, useState } from 'react';
import { getUpcomingEvents, type UpcomingEventFilters } from '@/lib/actions/calendar-actions';

export function useUpcomingEvents(filters: UpcomingEventFilters) {
  const [events, setEvents] = useState<Awaited<ReturnType<typeof getUpcomingEvents>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const filterKey = JSON.stringify(filters);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setIsLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    
    // 2. Fetch data (no synchronous setState at the top of the effect)
    getUpcomingEvents(JSON.parse(filterKey))
      .then((data) => { if (!cancelled) setEvents(data); })
      .catch(() => { if (!cancelled) setEvents([]); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [filterKey]);

  return { events, isLoading };
}