"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CollaborationProvider, useCollaboration } from "@/features/collaboration";
import { FileExplorer } from "@/features/file-explorer";
import { CodeEditor } from "@/features/editor";
import { StatusBar } from "@/components/StatusBar";
import { useFileExplorerStore } from "@/stores";
import type { VirtualFile } from "@/types";

// Force dynamic rendering because we rely on runtime URL params (room id)
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Select or create a file to start editing
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

export default function WorkspacePage() {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:1234";
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
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Preparing workspace…</span>
          </div>
        </div>
      }
    >
      <CollaborationProvider roomName={roomName} serverUrl={wsUrl}>
        <EditorWorkspace />
      </CollaborationProvider>
    </Suspense>
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
