"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileIcon,
  FilePlus,
  Trash2,
  Pencil,
  Check,
  X,
  Code2,
} from "lucide-react";
import { useCollaboration } from "@/features/collaboration";
import { useFileExplorerStore, useAwarenessStore } from "@/stores";
import type { VirtualFile } from "@/types";
import { cn } from "@/lib/utils";

export function FileExplorer() {
  const { fileTree, createFile, deleteFile, renameFile } = useCollaboration();
  const { activeFileId, setActiveFileId } = useFileExplorerStore();
  const peers = useAwarenessStore((s) => s.peers);

  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Observe the Y.Array for file tree changes
  useEffect(() => {
    const updateFiles = () => setFiles(fileTree.toArray());
    updateFiles();
    fileTree.observe(updateFiles);
    return () => fileTree.unobserve(updateFiles);
  }, [fileTree]);

  // Auto-select first file if nothing is selected
  useEffect(() => {
    if (!activeFileId && files.length > 0) {
      setActiveFileId(files[0].id);
    }
  }, [files, activeFileId, setActiveFileId]);

  const handleCreate = useCallback(() => {
    const trimmed = newFileName.trim();
    if (!trimmed) return;
    const file = createFile(trimmed);
    setActiveFileId(file.id);
    setNewFileName("");
    setIsCreating(false);
  }, [newFileName, createFile, setActiveFileId]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteFile(id);
      if (activeFileId === id) {
        const remaining = files.filter((f) => f.id !== id);
        setActiveFileId(remaining.length > 0 ? remaining[0].id : null);
      }
    },
    [deleteFile, activeFileId, files, setActiveFileId],
  );

  const handleRenameSubmit = useCallback(
    (id: string) => {
      const trimmed = renameValue.trim();
      if (trimmed) {
        renameFile(id, trimmed);
      }
      setRenamingId(null);
      setRenameValue("");
    },
    [renameValue, renameFile],
  );

  // Count peers per file
  const peerCountByFile = new Map<string, number>();
  peers.forEach((state) => {
    if (state.activeFile) {
      peerCountByFile.set(
        state.activeFile,
        (peerCountByFile.get(state.activeFile) ?? 0) + 1,
      );
    }
  });

  return (
    <aside className="flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-red-500" />
          <span className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground">
            Files
          </span>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded p-1 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground"
          title="New file"
        >
          <FilePlus size={14} />
        </button>
      </div>

      {/* File list */}
      <nav className="flex-1 overflow-y-auto px-1 py-1">
        {files.map((file) => {
          const isActive = activeFileId === file.id;
          const isRenaming = renamingId === file.id;
          const peerCount = peerCountByFile.get(file.id) ?? 0;

          return (
            <div
              key={file.id}
              className={cn(
                "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-hover",
              )}
            >
              <FileIcon size={14} className="shrink-0 opacity-60" />

              {isRenaming ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRenameSubmit(file.id);
                  }}
                  className="flex flex-1 items-center gap-1"
                >
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="flex-1 rounded border border-input bg-background px-1 py-0.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
                    onBlur={() => handleRenameSubmit(file.id)}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setActiveFileId(file.id)}
                  className="flex-1 truncate text-left text-xs"
                >
                  {file.name}
                </button>
              )}

              {/* Peer count badge */}
              {peerCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/20 px-1 text-[10px] font-medium text-primary">
                  {peerCount}
                </span>
              )}

              {/* Action buttons (visible on hover) */}
              {!isRenaming && (
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingId(file.id);
                      setRenameValue(file.name);
                    }}
                    className="rounded p-0.5 hover:bg-sidebar-hover"
                    title="Rename"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.id);
                    }}
                    className="rounded p-0.5 text-destructive hover:bg-destructive/10"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Inline new-file input */}
        {isCreating && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
            className="flex items-center gap-2 rounded-md px-2 py-1.5"
          >
            <FilePlus size={14} className="shrink-0 opacity-60" />
            <input
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.ts"
              className="flex-1 rounded border border-input bg-background px-1 py-0.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
              onBlur={() => {
                if (!newFileName.trim()) setIsCreating(false);
              }}
            />
            <button
              type="submit"
              className="rounded p-0.5 text-primary hover:bg-primary/10"
            >
              <Check size={12} />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewFileName("");
              }}
              className="rounded p-0.5 text-muted-foreground hover:bg-muted"
            >
              <X size={12} />
            </button>
          </form>
        )}

        {files.length === 0 && !isCreating && (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">
            No files yet. Click + to create one.
          </p>
        )}
      </nav>
    </aside>
  );
}
