"use client";

import { useEffect, useRef, useCallback } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import { useCollaboration } from "./CollaborationProvider";

interface UseCollabEditorOptions {
  fileId: string;
}

interface UseCollabEditorReturn {
  onEditorMount: (editor: MonacoEditor.IStandaloneCodeEditor) => void;
}

/**
 * Custom hook that binds a Monaco Editor instance to a Yjs Y.Text
 * for conflict-free real-time collaboration.
 *
 * Usage:
 *   const { onEditorMount } = useCollabEditor({ fileId });
 *   <Editor onMount={onEditorMount} />
 */
export function useCollabEditor({
  fileId,
}: UseCollabEditorOptions): UseCollabEditorReturn {
  const { getOrCreateYText, awareness } = useCollaboration();
  const bindingRef = useRef<any>(null);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);

  // Clean up binding when fileId changes or component unmounts
  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
    };
  }, [fileId]);

  const onEditorMount = useCallback(
    (editor: MonacoEditor.IStandaloneCodeEditor) => {
      // Destroy any previous binding
      bindingRef.current?.destroy();
      editorRef.current = editor;

      const ytext = getOrCreateYText(fileId);
      const model = editor.getModel();
      if (!model) return;

      // Dynamically import y-monaco to avoid SSR "window is not defined"
      import("y-monaco").then(({ MonacoBinding }) => {
        // Create the y-monaco binding: this wires up:
        //  - Local edits → Yjs Y.Text mutations → broadcast via provider
        //  - Remote Y.Text mutations → Monaco model updates
        //  - Awareness (cursor positions) ↔ Monaco cursor decorations
        const binding = new MonacoBinding(
          ytext,
          model,
          new Set([editor]),
          awareness,
        );

        bindingRef.current = binding;
      });

      // Update awareness with the active file
      awareness.setLocalStateField("activeFile", fileId);
    },
    [fileId, getOrCreateYText, awareness],
  );

  return { onEditorMount };
}
