'use client';

import { useEffect, useRef, useCallback } from 'react';
import { SSEEvent } from '@/types';

type EventHandler = (data: unknown) => void;

interface UseSSEOptions {
  onTrade?: EventHandler;
  onPriceUpdate?: EventHandler;
  onNewToken?: EventHandler;
  onGraduation?: EventHandler;
  onComment?: EventHandler;
}

export function useSSE(options: UseSSEOptions = {}) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef(options);
  handlersRef.current = options;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/sse');
    eventSourceRef.current = es;

    es.addEventListener('trade', (e) => {
      try {
        handlersRef.current.onTrade?.(JSON.parse(e.data));
      } catch { /* ignore */ }
    });

    es.addEventListener('price_update', (e) => {
      try {
        handlersRef.current.onPriceUpdate?.(JSON.parse(e.data));
      } catch { /* ignore */ }
    });

    es.addEventListener('new_token', (e) => {
      try {
        handlersRef.current.onNewToken?.(JSON.parse(e.data));
      } catch { /* ignore */ }
    });

    es.addEventListener('graduation', (e) => {
      try {
        handlersRef.current.onGraduation?.(JSON.parse(e.data));
      } catch { /* ignore */ }
    });

    es.addEventListener('comment', (e) => {
      try {
        handlersRef.current.onComment?.(JSON.parse(e.data));
      } catch { /* ignore */ }
    });

    es.onerror = () => {
      // Reconnect after 5s on error
      setTimeout(connect, 5000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);

  return {
    close: () => eventSourceRef.current?.close(),
    reconnect: connect,
  };
}
