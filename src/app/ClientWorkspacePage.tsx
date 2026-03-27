"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CollaborationProvider, useCollaboration } from "@/features/collaboration";
import { FileExplorer } from "@/features/file-explorer";
import { CodeEditor } from "@/features/editor";
import { StatusBar } from "@/components/StatusBar";
import { useFileExplorerStore } from "@/stores";
import type { VirtualFile } from "@/types";

// Internal client-only workspace UI
function EditorWorkspace() {
  const { fileTree } = useCollaboration();
  const activeFileId = useFileExplorerStore((s) => s.activeFileId);
  const [files, setFiles] = useState<VirtualFile[]>([]);

  useEffect(() => {
    const update = () => setFiles(fileTree.toArray());
    update();
    fileTree.observe(update);
    return () => fileTree.unobserve(update);
  }, [fileTree]);

  const activeFile = files.find((f) => f.id === activeFileId) ?? null;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <FileExplorer />

        {/* Editor pane */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {activeFile ? (
            <CodeEditor key={activeFile.id} file={activeFile} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <h1 className="text-2xl font-semibold text-foreground">
                👋 Hi, welcome to NexusCode!
              </h1>
              <p className="text-sm text-muted-foreground">
                Create a file in the sidebar to start collaborating.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  );
}

export default function ClientWorkspacePage() {
  // Dynamically determine WebSocket URL to support local network access (e.g., 192.168.x.x)
  // Priority:
  // 1. Environment variable (NEXT_PUBLIC_WS_URL)
  // 2. Current window location hostname (so it works on LAN)
  // 3. Fallback to localhost
  const [wsUrl, setWsUrl] = useState(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:1234");

  useEffect(() => {
    // If env var is not set, use the current hostname
    if (!process.env.NEXT_PUBLIC_WS_URL && typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname;
      // Only update if different to avoid re-renders
      const dynamicUrl = `${protocol}//${host}:1234`;
      if (dynamicUrl !== wsUrl) {
        setWsUrl(dynamicUrl);
      }
    }
  }, []);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [roomName, setRoomName] = useState<string | null>(null);

  useEffect(() => {
    const roomFromUrl = searchParams.get("room");

    if (roomFromUrl) {
      // Use existing room from URL
      setRoomName(roomFromUrl);
    } else {
      // Generate new unique room ID
      const newRoom = generateRoomId();
      // Update URL without page reload
      router.replace(`/?room=${newRoom}`);
      setRoomName(newRoom);
    }
  }, [searchParams, router]);

  // Show loading until room is determined
  if (!roomName) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <CollaborationProvider roomName={roomName} serverUrl={wsUrl}>
      <EditorWorkspace />
    </CollaborationProvider>
  );
}

// Generate a readable room ID (e.g., "cosmic-panda-42")
function generateRoomId(): string {
  const adjectives = ["cosmic", "solar", "lunar", "stellar", "quantum", "digital", "neon", "cyber"];
  const nouns = ["panda", "falcon", "dragon", "phoenix", "tiger", "wolf", "eagle", "leopard"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${num}`;
}
