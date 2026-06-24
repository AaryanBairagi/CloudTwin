"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getTwins } from "@/lib/api";
import type { Twin } from "@/types/twin";

const POLL_INTERVAL_MS = 5000;

interface UseTwinsResult {
  twins: Twin[];
  loading: boolean;
  error: string | null;
  lastUpdatedAt: Date | null;
}

// Polls GET /twins on an interval. This is intentionally the only place
// that knows about polling -- when Redis + WebSocket land on the backend,
// this hook is the single spot that swaps to a socket subscription instead.
export function useTwins(): UseTwinsResult {
  const [twins, setTwins] = useState<Twin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const isMounted = useRef(true);

  const fetchTwins = useCallback(async () => {
    try {
      const data = await getTwins();
      if (!isMounted.current) return;
      setTwins(data);
      setError(null);
      setLastUpdatedAt(new Date());
    } catch (err) {
      if (!isMounted.current) return;
      setError(err instanceof Error ? err.message : "Failed to load twins");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    const tick = () => {
      fetchTwins();
    };

    const interval = setInterval(tick, POLL_INTERVAL_MS);
    const initialFetchTimeout = setTimeout(tick, 0);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
      clearTimeout(initialFetchTimeout);
    };
  }, [fetchTwins]);

  return { twins, loading, error, lastUpdatedAt };
}
