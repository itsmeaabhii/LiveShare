"use client";

import React, { useEffect, useState } from "react";
import { CollaborationProvider, useCollaboration } from "@/features/collaboration";
import { FileExplorer } from "@/features/file-explorer";
import { CodeEditor } from "@/features/editor";
import { StatusBar } from "@/components/StatusBar";
import { useFileExplorerStore } from "@/stores";
import type { VirtualFile } from "@/types";

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
  return (
    <CollaborationProvider roomName="nexus-room-1">
      <EditorWorkspace />
    </CollaborationProvider>
  );
}
