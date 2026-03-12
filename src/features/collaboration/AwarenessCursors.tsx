"use client";

import React from "react";
import { useAwarenessStore } from "@/stores";
import type { AwarenessState } from "@/types";

/**
 * Renders floating cursor labels for all remote peers
 * currently editing the same file as the local user.
 */
interface AwarenessCursorsProps {
  activeFileId: string | null;
}

export function AwarenessCursors({ activeFileId }: AwarenessCursorsProps) {
  const peers = useAwarenessStore((s) => s.peers);

  // Filter to peers on the same file
  const activePeers: [number, AwarenessState][] = [];
  peers.forEach((state, clientId) => {
    if (state.activeFile === activeFileId && state.user) {
      activePeers.push([clientId, state]);
    }
  });

  if (activePeers.length === 0) return null;

  return (
    <div className="pointer-events-none absolute right-4 top-2 z-50 flex flex-col gap-1">
      {activePeers.map(([clientId, state]) => (
        <div
          key={clientId}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium text-white shadow-sm"
          style={{ backgroundColor: state.user.color }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.6)",
            }}
          />
          {state.user.name}
        </div>
      ))}
    </div>
  );
}
