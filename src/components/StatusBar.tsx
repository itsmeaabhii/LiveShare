"use client";

import React, { useState } from "react";
import { Wifi, WifiOff, Loader2, Users, Share2, Check } from "lucide-react";
import { useConnectionStore, useAwarenessStore } from "@/stores";
import { useCollaboration } from "@/features/collaboration";
import { cn } from "@/lib/utils";

export function StatusBar() {
  const status = useConnectionStore((s) => s.status);
  const peers = useAwarenessStore((s) => s.peers);
  const { localUser } = useCollaboration();
  const [copied, setCopied] = useState(false);

  const peerCount = peers.size;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <footer className="flex h-6 items-center justify-between border-t border-border bg-background px-3 text-[11px] text-muted-foreground">
      {/* Left side: connection status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {status === "connected" && (
            <>
              <Wifi size={12} className="text-green-500" />
              <span className="text-green-500">Connected</span>
            </>
          )}
          {status === "connecting" && (
            <>
              <Loader2 size={12} className="animate-spin text-yellow-500" />
              <span className="text-yellow-500">Connecting…</span>
            </>
          )}
          {status === "disconnected" && (
            <>
              <WifiOff size={12} className="text-red-500" />
              <span className="text-red-500">Disconnected</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Users size={12} />
          <span>
            {peerCount + 1} user{peerCount + 1 !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Center: Share button */}
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 rounded px-2 py-0.5 hover:bg-accent transition-colors"
        title="Copy invite link"
      >
        {copied ? (
          <>
            <Check size={12} className="text-green-500" />
            <span className="text-green-500">Link copied!</span>
          </>
        ) : (
          <>
            <Share2 size={12} />
            <span>Share room</span>
          </>
        )}
      </button>

      {/* Right side: local user identity */}
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: localUser.color }}
        />
        <span>{localUser.name}</span>
      </div>
    </footer>
  );
}
