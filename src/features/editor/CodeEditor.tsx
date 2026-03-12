"use client";

import React, { useMemo } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useCollabEditor, AwarenessCursors } from "@/features/collaboration";
import type { VirtualFile } from "@/types";

interface CodeEditorProps {
  file: VirtualFile;
}

/**
 * The main code editor component.
 * Mounts Monaco Editor and attaches the Yjs CRDT binding
 * via the useCollabEditor hook — no useState for content.
 */
export function CodeEditor({ file }: CodeEditorProps) {
  const { onEditorMount } = useCollabEditor({ fileId: file.id });

  const handleMount: OnMount = (editor) => {
    onEditorMount(editor);
    editor.focus();
  };

  const editorOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: "on" as const,
      wordWrap: "on" as const,
      padding: { top: 16 },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: "smooth" as const,
      cursorSmoothCaretAnimation: "on" as const,
      renderLineHighlight: "gutter" as const,
      bracketPairColorization: { enabled: true },
      automaticLayout: true,
    }),
    [],
  );

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Peer presence badges */}
      <AwarenessCursors activeFileId={file.id} />

      {/* File tab header */}
      <div className="flex h-9 items-center border-b border-border bg-background px-4">
        <span className="text-xs font-medium text-muted-foreground">
          {file.path}
        </span>
        <span className="ml-2 text-[10px] uppercase text-muted-foreground/60">
          {file.language}
        </span>
      </div>

      {/* Monaco Editor — content is managed entirely by Yjs */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={file.language}
          theme="vs-dark"
          onMount={handleMount}
          options={editorOptions}
          loading={
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading editor…
            </div>
          }
        />
      </div>
    </div>
  );
}
