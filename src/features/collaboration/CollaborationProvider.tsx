"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import * as Y from "yjs";
import type { AwarenessState, CollabUser, VirtualFile } from "@/types";
import { inferLanguage } from "@/types";
import { generateUserName, pickUserColor } from "@/lib/user-identity";
import { useAwarenessStore, useConnectionStore } from "@/stores";

// ─── Context Shape ──────────────────────────────────────────────

interface CollaborationContextValue {
  /** The shared Yjs document */
  ydoc: Y.Doc;
  /** The WebSocket provider */
  provider: any; // WebsocketProvider — dynamically imported to avoid SSR window errors
  /** Awareness protocol instance */
  awareness: any; // Awareness — from the provider, only available client-side
  /** Y.Map<Y.Text> — each key is a file ID mapping to its Y.Text content */
  filesContent: Y.Map<Y.Text>;
  /** Y.Array<VirtualFile> — the synced file tree metadata */
  fileTree: Y.Array<VirtualFile>;
  /** Current local user identity */
  localUser: CollabUser;
  /** Helpers */
  createFile: (name: string) => VirtualFile;
  deleteFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
  getOrCreateYText: (fileId: string) => Y.Text;
}

const CollaborationContext = createContext<CollaborationContextValue | null>(
  null,
);

// ─── Hook ───────────────────────────────────────────────────────

export function useCollaboration(): CollaborationContextValue {
  const ctx = useContext(CollaborationContext);
  if (!ctx) {
    throw new Error(
      "useCollaboration must be used within a CollaborationProvider",
    );
  }
  return ctx;
}

// ─── Provider Props ─────────────────────────────────────────────

interface CollaborationProviderProps {
  /** Room name — users in the same room share state */
  roomName: string;
  /** WebSocket server URL (default: ws://localhost:1234) */
  serverUrl?: string;
  children: ReactNode;
}

// ─── Provider Component ─────────────────────────────────────────

export function CollaborationProvider({
  roomName,
  serverUrl = "ws://localhost:1234",
  children,
}: CollaborationProviderProps) {
  const [ready, setReady] = useState(false);
  const ctxRef = useRef<CollaborationContextValue | null>(null);
  const setStatus = useConnectionStore((s) => s.setStatus);
  const setPeers = useAwarenessStore((s) => s.setPeers);

  useEffect(() => {
    let provider: any;
    let awareness: any;
    let cancelled = false;

    // Dynamically import y-websocket to avoid SSR "window is not defined"
    import("y-websocket").then(({ WebsocketProvider }) => {
      if (cancelled) return;

    // 1. Create the shared Y.Doc
    const ydoc = new Y.Doc();

    // 2. Get shared types
    const filesContent = ydoc.getMap<Y.Text>("filesContent");
    const fileTree = ydoc.getArray<VirtualFile>("fileTree");

    // 3. Connect via WebSocket
    provider = new WebsocketProvider(serverUrl, roomName, ydoc, {
      connect: true,
    });
    awareness = provider.awareness;

    // 4. Build local user identity
    const localUser: CollabUser = {
      id: ydoc.clientID,
      name: generateUserName(),
      color: pickUserColor(),
    };

    // Set local awareness state
    awareness.setLocalStateField("user", localUser);

    // 5. Connection status listeners
    provider.on("status", ({ status }: { status: string }) => {
      setStatus(status as "connecting" | "connected" | "disconnected");
    });

    // 6. Track remote awareness states
    const onAwarenessChange = () => {
      const states = new Map<number, AwarenessState>();
      awareness.getStates().forEach((state: Record<string, unknown>, clientId: number) => {
        if (clientId !== ydoc.clientID && state.user) {
          states.set(clientId, state as unknown as AwarenessState);
        }
      });
      setPeers(states);
    };
    awareness.on("change", onAwarenessChange);

    // 7. Helper: get or create Y.Text for a file
    const getOrCreateYText = (fileId: string): Y.Text => {
      let ytext = filesContent.get(fileId);
      if (!ytext) {
        ytext = new Y.Text();
        filesContent.set(fileId, ytext);
      }
      return ytext;
    };

    // 8. Helper: create a new file
    const createFileHelper = (name: string): VirtualFile => {
      const file: VirtualFile = {
        id: crypto.randomUUID(),
        name,
        language: inferLanguage(name),
        path: `/${name}`,
      };
      fileTree.push([file]);
      getOrCreateYText(file.id);
      return file;
    };

    // 9. Helper: delete a file
    const deleteFileHelper = (id: string) => {
      const files = fileTree.toArray();
      const index = files.findIndex((f) => f.id === id);
      if (index !== -1) {
        fileTree.delete(index, 1);
      }
      filesContent.delete(id);
    };

    // 10. Helper: rename a file
    const renameFileHelper = (id: string, newName: string) => {
      const files = fileTree.toArray();
      const index = files.findIndex((f) => f.id === id);
      if (index !== -1) {
        const old = files[index];
        const updated: VirtualFile = {
          ...old,
          name: newName,
          language: inferLanguage(newName),
          path: `/${newName}`,
        };
        fileTree.delete(index, 1);
        fileTree.insert(index, [updated]);
      }
    };

    // Seed a default file if the document is empty (first client only)
    if (fileTree.length === 0) {
      createFileHelper("main.ts");
    }

    ctxRef.current = {
      ydoc,
      provider,
      awareness,
      filesContent,
      fileTree,
      localUser,
      createFile: createFileHelper,
      deleteFile: deleteFileHelper,
      renameFile: renameFileHelper,
      getOrCreateYText,
    };

    setReady(true);
    }); // end dynamic import

    return () => {
      cancelled = true;
      if (awareness) awareness.off("change", undefined);
      if (provider) provider.disconnect();
      setReady(false);
    };
  }, [roomName, serverUrl, setStatus, setPeers]);

  if (!ready || !ctxRef.current) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">
            Connecting to session…
          </span>
        </div>
      </div>
    );
  }

  return (
    <CollaborationContext.Provider value={ctxRef.current}>
      {children}
    </CollaborationContext.Provider>
  );
}
