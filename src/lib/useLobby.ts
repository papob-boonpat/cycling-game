"use client";

import { useEffect, useState } from "react";

const POLL_INTERVAL_MS = 4000;

export interface LobbyState {
  raceOpen: boolean;
  connected: boolean;
}

/**
 * Polls whether the admin has opened the race. Pass `active: false` once the
 * race starts to stop polling.
 */
export function useLobby(active: boolean): LobbyState {
  const [state, setState] = useState<LobbyState>({
    raceOpen: false,
    connected: false,
  });

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch("/api/lobby", { cache: "no-store" });
        if (!res.ok) throw new Error(`Lobby poll failed: ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setState({ raceOpen: Boolean(data.raceOpen), connected: true });
      } catch (err) {
        console.error(err);
        if (!cancelled) setState((prev) => ({ ...prev, connected: false }));
      }
    };

    poll();
    const intervalId = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [active]);

  return state;
}
